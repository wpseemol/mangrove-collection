#!/usr/bin/env bash
# Usage: ftp-deploy.sh <api|storefront|dashboard> <local build dir> <remote dir>
# Uploads the build file by file over FTP (nothing is zipped or extracted on the server).
# Nothing on the server is ever deleted; files matched by `keep` are not overwritten either.
# Env: FTP_HOST, FTP_USERNAME, FTP_PASSWORD, FTP_API_DIR, API_URL, FTP_PARALLEL (default 8)
set -euo pipefail

trim() { local v=$1; v=${v//$'\r'/}; v=${v//$'\n'/}; v=${v#"${v%%[![:space:]]*}"}; printf '%s' "${v%"${v##*[![:space:]]}"}"; }
FTP_HOST=$(trim "$FTP_HOST"); FTP_HOST=${FTP_HOST#ftp://}; FTP_HOST=${FTP_HOST%/}
FTP_USERNAME=$(trim "$FTP_USERNAME")
# lftp --env-password only reads LFTP_PASSWORD.
export LFTP_PASSWORD=$(trim "${FTP_PASSWORD:-${LFTP_PASSWORD:-}}")

target=$1
src=${2%/}
dir=${3%/}

ftp() {
  lftp --env-password -u "$FTP_USERNAME" "$FTP_HOST" -e "
    set ftp:ssl-allow yes;
    set ssl:verify-certificate ${FTP_VERIFY_CERT:-no};
    set net:max-retries 3;
    set net:timeout 30;
    set ftp:list-options -a;
    set xfer:use-temp-file yes;
    $1
    bye"
}

# Server files a deploy never overwrites: extended regexes on paths relative
# to the remote dir. Use [.] rather than \. because lftp would eat the backslash.
keep=('(^|/)[.]ftpquota$' '(^|/)[.]well-known(/|$)' '(^|/)cgi-bin(/|$)' '(^|/)[.]user[.]ini$' '(^|/)php[.]ini$' '(^|/)error_log$')
case $target in
  api) keep+=('^storage(/|$)' '^public/uploads(/|$)' '^public/storage(/|$)' '(^|/)deploy-[0-9a-f]+[.]php$') ;;
  storefront) keep+=('^tmp(/|$)' '^[.]htaccess$' '^stderr[.]log$' '^node_modules(/|$)') ;;
  dashboard) ;;
  *) echo "::error title=Unknown target::$target"; exit 1 ;;
esac

# ::error:: lines become run annotations, which are readable without signing in to GitHub.
upload() { # <local dir> <remote dir>
  local args="--reverse --dereference --no-perms --parallel=${FTP_PARALLEL:-8} --verbose=1"
  for rx in "${keep[@]}"; do args+=" --exclude '$rx'"; done
  echo "Uploading $1 ($(find "$1" -type f | wc -l) files, $(du -sh "$1" | cut -f1)) to $2/"
  if ! ftp "mirror $args '$1' '$2';" 2>&1 | tee /tmp/mirror.log; then
    echo "::error title=FTP upload failed ($target)::$(tail -n 3 /tmp/mirror.log | tr '\n' ' ')"
    exit 1
  fi
}

# MultiPHP Manager writes the PHP version handler into the document root's
# .htaccess; losing it silently drops the site back to the server's default PHP.
keep_php_handler() { # <remote .htaccess> <local .htaccess>
  rm -f /tmp/htaccess.remote
  ftp "get '$1' -o /tmp/htaccess.remote;" >/dev/null 2>&1 || true
  [ -f /tmp/htaccess.remote ] || return 0
  local block
  block=$(sed -n '/#[[:space:]]*php -- BEGIN cPanel-generated handler/,/#[[:space:]]*php -- END cPanel-generated handler/p' /tmp/htaccess.remote)
  if [ -n "$block" ] && ! grep -qs 'cPanel-generated handler' "$2"; then
    printf '\n%s\n' "$block" >> "$2"
  fi
}

case $target in
  dashboard)
    keep_php_handler "$dir/.htaccess" "$src/.htaccess"
    upload "$src" "$dir"
    ;;

  storefront)
    upload "$src" "$dir"
    : > /tmp/restart.txt
    ftp "mkdir -p -f '$dir/tmp'; put /tmp/restart.txt -o '$dir/tmp/restart.txt';" >/dev/null
    ;;

  api)
    token=$(openssl rand -hex 32)
    receiver="deploy-$(openssl rand -hex 16).php"
    sed "s/__DEPLOY_TOKEN__/${token}/" "$(dirname "$0")/receiver.php" > "/tmp/${receiver}"
    receiver_path=""
    cleanup() { [ -z "$receiver_path" ] || ftp "rm -f '$receiver_path';" >/dev/null 2>&1 || true; }
    trap cleanup EXIT

    call_receiver() { # <remote folder> <action> <path from that folder to the app: . or ..>
      receiver_path="$1/$receiver"
      ftp "put '/tmp/$receiver' -o '$receiver_path';" >/dev/null
      body=$(curl -sS --max-time 900 -w '\nHTTP %{http_code}' \
        -H "X-Deploy-Token: $token" \
        --data-urlencode "action=$2" \
        --data-urlencode "app=$3" \
        "$API_URL/$receiver" 2>&1) || true
    }

    # Folders that may be the API subdomain's document root, relative to the FTP login folder.
    # The last two cover an FTP account whose login folder is the API folder itself.
    candidates=("$dir/public" "$dir" "public_html/$dir/public" "public_html/$dir" public .)
    app_dir=""
    for candidate in "${candidates[@]}"; do
      ftp "cd '$candidate'" >/dev/null 2>&1 || continue
      case $candidate in */public|public) rel=..;; *) rel=.;; esac
      echo "Checking PHP from $candidate/"
      call_receiver "$candidate" check "$rel"
      if grep -q '^HTTP 404$' <<<"$body"; then
        ftp "rm -f '$receiver_path';" >/dev/null 2>&1 || true
        receiver_path=""
        continue
      fi
      echo "$body"
      if ! grep -q '^OK: ready' <<<"$body"; then
        echo "::error title=Server check failed (api)::$(tail -n 4 <<<"$body" | tr '\n' ' ' | cut -c1-500)"
        exit 1
      fi
      case $candidate in public) app_dir=.;; *) app_dir=${candidate%/public};; esac
      break
    done
    if [ -z "$app_dir" ]; then
      listing=$(ftp "cls -1 -a" 2>&1 | tr '\n' ' ' | cut -c1-400)
      echo "::error title=API document root not found::$API_URL did not serve a file uploaded to any of: ${candidates[*]} (relative to the FTP login folder). Point the FTP account at your home folder or the API folder in cPanel > FTP Accounts. FTP login folder contains: $listing"
      exit 1
    fi

    if [ "$rel" = . ]; then
      # Route every request into public/ so .env, vendor/ and the source are never served.
      printf 'RewriteEngine On\nRewriteRule ^(.*)$ public/$1 [L]\n' > "$src/.htaccess"
      keep_php_handler "$app_dir/.htaccess" "$src/.htaccess"
    else
      keep_php_handler "$app_dir/public/.htaccess" "$src/public/.htaccess"
    fi

    upload "$src" "$app_dir"

    echo "Running migrations and caches"
    call_receiver "$app_dir/public" finish ..
    echo "$body"
    if ! grep -q '^OK: api deployed' <<<"$body"; then
      echo "::error title=Server step failed (api)::$(tail -n 4 <<<"$body" | tr '\n' ' ' | cut -c1-500)"
      exit 1
    fi
    if [ "$rel" = . ]; then
      echo "::warning title=API document root::The API document root is the app folder; set it to $app_dir/public in cPanel > Domains."
    fi
    ;;
esac

echo "OK: $target deployed"
