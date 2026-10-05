#!/usr/bin/env bash
# Usage: ftp-deploy.sh <api|storefront|dashboard> <local zip> <remote dir>
# Env: FTP_HOST, FTP_USERNAME, LFTP_PASSWORD, FTP_API_DIR, API_URL
set -euo pipefail

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

echo "Uploading $zip ($(du -h "$zip" | cut -f1)) for $target"
ftp "mkdir -p -f '$FTP_API_DIR/public'; put '$zip' -o '$remote_zip'; put '/tmp/$receiver' -o '$FTP_API_DIR/public/$receiver';"

echo "Extracting on the server"
curl --fail-with-body -sS --max-time 900 \
  -H "X-Deploy-Token: $token" \
  --data-urlencode "target=$target" \
  --data-urlencode "dir=$dir" \
  --data-urlencode "zip=$remote_zip" \
  "$API_URL/$receiver"
