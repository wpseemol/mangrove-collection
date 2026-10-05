#!/usr/bin/env bash
# Usage: ftp-deploy.sh <api|storefront|dashboard> <local zip> <remote dir>
# Env: FTP_HOST, FTP_USERNAME, LFTP_PASSWORD, FTP_API_DIR, API_URL
set -euo pipefail

trim() { local v=$1; v=${v//$'\r'/}; v=${v//$'\n'/}; v=${v#"${v%%[![:space:]]*}"}; printf '%s' "${v%"${v##*[![:space:]]}"}"; }
FTP_HOST=$(trim "$FTP_HOST"); FTP_HOST=${FTP_HOST#ftp://}; FTP_HOST=${FTP_HOST%/}
FTP_USERNAME=$(trim "$FTP_USERNAME")
LFTP_PASSWORD=$(trim "$LFTP_PASSWORD"); export LFTP_PASSWORD

target=$1
zip=$2
dir=$3

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

cleanup() {
  ftp "rm -f '$remote_zip'; rm -f '$FTP_API_DIR/public/$receiver';" || true
}
trap cleanup ERR

# ::error:: lines become run annotations, which are readable without signing in to GitHub.
echo "Uploading $zip ($(du -h "$zip" | cut -f1)) for $target"
if ! out=$(ftp "pwd; mkdir -p -f '$FTP_API_DIR/public'; put '$zip' -o '$remote_zip'; put '/tmp/$receiver' -o '$FTP_API_DIR/public/$receiver';" 2>&1); then
  echo "$out"
  echo "::error title=FTP upload failed ($target)::$(echo "$out" | tail -n 3 | tr '\n' ' ')"
  exit 1
fi
echo "$out"

echo "Extracting on the server"
status=0
body=$(curl -sS --max-time 900 -w '\nHTTP %{http_code}' \
  -H "X-Deploy-Token: $token" \
  --data-urlencode "target=$target" \
  --data-urlencode "dir=$dir" \
  --data-urlencode "zip=$remote_zip" \
  "$API_URL/$receiver" 2>&1) || status=$?
echo "$body"
if [ "$status" -ne 0 ] || ! grep -q "^OK: $target deployed" <<<"$body"; then
  echo "::error title=Server step failed ($target)::$(echo "$body" | tail -n 4 | tr '\n' ' ' | cut -c1-500)"
  false
fi
