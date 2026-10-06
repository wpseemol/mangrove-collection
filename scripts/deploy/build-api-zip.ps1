# Builds deploy-data/api.zip for a manual cPanel upload of backend-api:
# production vendor/ included, .env prefilled from .env.example + the local APP_KEY.
# Usage (from the repo root): powershell -ExecutionPolicy Bypass -File scripts/deploy/build-api-zip.ps1
$ErrorActionPreference = 'Stop'
$root = Resolve-Path "$PSScriptRoot/../.."
$src = Join-Path $root 'backend-api'
$out = Join-Path $root 'deploy-data'
$stage = Join-Path $env:TEMP "mangrove-api-build"

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force $stage, $out | Out-Null

foreach ($dir in 'app', 'bootstrap', 'config', 'database', 'public', 'resources', 'routes') {
    Copy-Item (Join-Path $src $dir) $stage -Recurse
}
foreach ($file in 'artisan', 'composer.json', 'composer.lock', '.env.example') {
    Copy-Item (Join-Path $src $file) $stage
}

Get-ChildItem "$stage/bootstrap/cache" -Filter *.php | Remove-Item
Remove-Item "$stage/public/storage" -Force -Recurse -ErrorAction SilentlyContinue
Get-ChildItem "$stage/public/uploads" -Force | Where-Object { $_.Name -notin '.gitkeep', '.htaccess' } | Remove-Item -Recurse -Force

foreach ($dir in 'app/public', 'app/private', 'framework/cache/data', 'framework/sessions', 'framework/views', 'logs') {
    New-Item -ItemType Directory -Force (Join-Path $stage "storage/$dir") | Out-Null
}

Push-Location $stage
try {
    composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts
    if ($LASTEXITCODE) { throw 'composer install failed' }
} finally { Pop-Location }

# The subdomain's document root is the app folder itself, so send everything to public/.
[IO.File]::WriteAllText("$stage/.htaccess", "RewriteEngine On`nRewriteRule ^(.*)$ public/`$1 [L]`n")

$appKey = (Select-String -Path "$src/.env" -Pattern '^APP_KEY=(.+)$').Matches[0].Groups[1].Value
$env = (Get-Content "$stage/.env.example" -Raw) -replace '(?m)^APP_KEY=.*$', "APP_KEY=$appKey" `
    -replace '(?m)^DB_HOST=.*$', 'DB_HOST=localhost' `
    -replace '(?m)^DB_DATABASE=.*$', 'DB_DATABASE=CHANGE_ME' `
    -replace '(?m)^DB_USERNAME=.*$', 'DB_USERNAME=CHANGE_ME' `
    -replace '(?m)^DB_PASSWORD=.*$', 'DB_PASSWORD=CHANGE_ME'
[IO.File]::WriteAllText("$stage/.env", ($env -replace "`r`n", "`n"))

$zip = Join-Path $out 'api.zip'
if (Test-Path $zip) { Remove-Item $zip }
tar -a -c -f $zip -C $stage .
if ($LASTEXITCODE) { throw 'zip failed' }

"Built $zip ($([math]::Round((Get-Item $zip).Length / 1MB, 1)) MB)"
