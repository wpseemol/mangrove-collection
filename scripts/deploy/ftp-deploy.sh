#!/usr/bin/env bash
# Usage: ftp-deploy.sh <api|storefront|dashboard> <local zip> <remote dir>
# Uploads the zip to the FTP login folder, then calls receiver.php on the API domain,
# which extracts it, replaces the old files in <remote dir> and deletes the zip.
# Env: FTP_HOST, FTP_USERNAME, FTP_PASSWORD, FTP_API_DIR, FTP_STOREFRONT_DIR, FTP_DASHBOARD_DIR, API_URL
set -euo pipefail

trim() { local v=$1; v=${v//$'\r'/}; v=${v//$'\n'/}; v=${v#"${v%%[![:space:]]*}"}; printf '%s' "${v%"${v##*[![:space:]]}"}"; }
FTP_HOST=$(trim "$FTP_HOST"); FTP_HOST=${FTP_HOST#ftp://}; FTP_HOST=${FTP_HOST%/}
FTP_USERNAME=$(trim "$FTP_USERNAME")
# lftp --env-password only reads LFTP_PASSWORD.
export LFTP_PASSWORD=$(trim "${FTP_PASSWORD:-${LFTP_PASSWORD:-}}")

target=$1
zip=$2
dir=${3%/}

id=$(openssl rand -hex 16)
token=$(openssl rand -hex 32)
receiver="deploy-${id}.php"
remote_zip=".deploy-${target}-${id}.zip"

sed "s/__DEPLOY_TOKEN__/${token}/" "$(dirname "$0")/receiver.php" > "/tmp/${receiver}"

ftp() {
  lftp --env-password -u "$FTP_USERNAME" "$FTP_HOST" -e "
    set ftp:ssl-allow yes;
    set ssl:verify-certificate ${FTP_VERIFY_CERT:-no};
    set net:max-retries 3;
    set net:timeout 30;
    $1
    bye"
}

# Folders that may be the API subdomain's document root, relative to the FTP login folder.
# The last two cover an FTP account whose login folder is the API folder itself.
candidates=("$FTP_API_DIR/public" "$FTP_API_DIR" "public_html/$FTP_API_DIR/public" "public_html/$FTP_API_DIR" public .)
receiver_path=""

cleanup() {
  ftp "rm -f '$remote_zip'; ${receiver_path:+rm -f '$receiver_path';}" >/dev/null 2>&1 || true
}
trap cleanup ERR

# ::error:: lines become run annotations, which are readable without signing in to GitHub.
echo "Uploading $zip ($(du -h "$zip" | cut -f1)) for $target"
if ! out=$(ftp "pwd; cls -1 -a; put '$zip' -o '$remote_zip';" 2>&1); then
  echo "$out"
  echo "::error title=FTP upload failed ($target)::$(echo "$out" | tail -n 3 | tr '\n' ' ')"
  exit 1
fi
echo "$out"
listing=$(tr '\n' ' ' <<<"$out" | cut -c1-400)

for candidate in "${candidates[@]}"; do
  ftp "cd '$candidate'" >/dev/null 2>&1 || continue
  receiver_path="$candidate/$receiver"
  ftp "put '/tmp/$receiver' -o '$receiver_path';" >/dev/null
  echo "Calling the receiver in $candidate/"
  status=0
  body=$(curl -sS --max-time 1800 -w '\nHTTP %{http_code}' \
    -H "X-Deploy-Token: $token" \
    --data-urlencode "target=$target" \
    --data-urlencode "dir=$dir" \
    --data-urlencode "zip=$remote_zip" \
    --data-urlencode "protect=${FTP_API_DIR:-},${FTP_STOREFRONT_DIR:-},${FTP_DASHBOARD_DIR:-}" \
    "$API_URL/$receiver" 2>&1) || status=$?
  if [ "$status" -eq 0 ] && grep -q '^HTTP 404$' <<<"$body"; then
    ftp "rm -f '$receiver_path';" >/dev/null 2>&1 || true
    receiver_path=""
    continue
  fi
  echo "$body"
  if [ "$status" -ne 0 ] || ! grep -q "^OK: $target deployed" <<<"$body"; then
    echo "::error title=Server step failed ($target)::$(echo "$body" | tail -n 4 | tr '\n' ' ' | cut -c1-500)"
    false
  fi
  exit 0
done

echo "::error title=API document root not found::$API_URL did not serve a file uploaded to any of: ${candidates[*]} (relative to the FTP login folder). FTP login folder contains: $listing"
false
