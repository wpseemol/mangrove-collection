<?php

/*
 * One-shot deploy receiver. CI uploads it to the API's public/ folder under a
 * random name with a random token, calls it once over HTTPS and it deletes
 * itself (and the uploaded zip) whatever the outcome.
 *
 * All paths it receives are relative to the FTP login folder, which it finds by
 * walking up from its own folder until the uploaded zip is found.
 */

declare(strict_types=1);

const TOKEN = '__DEPLOY_TOKEN__';

$self = __FILE__;
$zip = null;

register_shutdown_function(static function () use ($self, &$zip): void {
    if ($zip !== null && is_file($zip)) {
        @unlink($zip);
    }
    @unlink($self);
});

if (strlen(TOKEN) < 32 || str_starts_with(TOKEN, '__')
    || !hash_equals(TOKEN, (string) ($_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? ''))) {
    http_response_code(404);
    exit;
}

set_time_limit(0);
ignore_user_abort(true);
header('Content-Type: text/plain; charset=utf-8');

// Production PHP hides errors; print them so CI shows why a deploy failed.
ini_set('display_errors', '0');
set_exception_handler(static function (Throwable $e): void {
    http_response_code(500);
    echo 'ERROR: '.$e::class.': '.$e->getMessage().' at '.basename($e->getFile()).':'.$e->getLine()."\n";
});
register_shutdown_function(static function (): void {
    $e = error_get_last();
    if ($e !== null && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        echo "FATAL: {$e['message']} at ".basename($e['file']).":{$e['line']}\n";
    }
});

const ALWAYS_KEEP = ['.well-known', 'cgi-bin', '.user.ini', 'php.ini', 'error_log'];

function fail(string $message): never
{
    http_response_code(500);
    echo "ERROR: {$message}\n";
    exit;
}

function relativePath(string $value, string $field): string
{
    if ($value === '' || str_contains($value, '..') || str_starts_with($value, '/') || str_contains($value, '\\')) {
        fail("invalid {$field}");
    }

    return $value;
}

function removePath(string $path): void
{
    if (is_link($path) || is_file($path)) {
        unlink($path);

        return;
    }
    foreach (scandir($path) as $name) {
        if ($name !== '.' && $name !== '..') {
            removePath("{$path}/{$name}");
        }
    }
    rmdir($path);
}

function clearDir(string $dir, array $keep): void
{
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);

        return;
    }
    foreach (scandir($dir) as $name) {
        if ($name !== '.' && $name !== '..' && !in_array($name, $keep, true)) {
            removePath("{$dir}/{$name}");
        }
    }
}

// MultiPHP Manager writes the PHP version handler into the document root's
// .htaccess; losing it silently drops the site back to the server's default PHP.
function cpanelHandler(string $htaccess): string
{
    if (!is_file($htaccess)) {
        return '';
    }
    preg_match('/#\s*php -- BEGIN cPanel-generated handler.*?#\s*php -- END cPanel-generated handler[^\n]*\n?/s', file_get_contents($htaccess), $m);

    return $m[0] ?? '';
}

function restoreCpanelHandler(string $htaccess, string $block): void
{
    if ($block === '') {
        return;
    }
    $current = is_file($htaccess) ? file_get_contents($htaccess) : '';
    if (!str_contains($current, 'cPanel-generated handler')) {
        file_put_contents($htaccess, rtrim($current)."\n\n".$block);
    }
}

// Uses ZipArchive when the zip extension is on, otherwise the phar extension's PharData.
function open_zip(string $zip): ZipArchive|PharData
{
    if (class_exists(ZipArchive::class)) {
        $archive = new ZipArchive();
        if ($archive->open($zip) !== true) {
            fail('cannot open zip');
        }

        return $archive;
    }
    if (class_exists(PharData::class)) {
        return new PharData($zip);
    }
    fail('neither the zip nor the phar PHP extension is enabled');
}

function extract_zip(ZipArchive|PharData $archive, string $dir): void
{
    if ($archive instanceof ZipArchive) {
        $archive->extractTo($dir) || fail('extract failed');
        $archive->close();

        return;
    }
    $archive->extractTo($dir, null, true);
}

$target = (string) ($_POST['target'] ?? '');
$zipName = relativePath((string) ($_POST['zip'] ?? ''), 'zip');

$base = null;
for ($d = __DIR__, $i = 0; $i < 6; $d = dirname($d), $i++) {
    if (is_file("{$d}/{$zipName}")) {
        $base = $d;
        break;
    }
}
if ($base === null) {
    fail('zip not found above '.__DIR__);
}

$dir = $base.'/'.relativePath((string) ($_POST['dir'] ?? ''), 'dir');
$zip = "{$base}/{$zipName}";
$archive = open_zip($zip);

switch ($target) {
    case 'api':
        $missing = array_filter(['pdo_mysql', 'mbstring', 'openssl', 'tokenizer', 'xml', 'ctype', 'fileinfo', 'curl'],
            static fn (string $ext): bool => !extension_loaded($ext));
        if (version_compare(PHP_VERSION, '8.4.1', '<') || $missing !== []) {
            fail('PHP '.PHP_VERSION.' on the API domain; need 8.4.1+ with extensions: '.($missing ? implode(', ', $missing) : 'all present').'. Nothing was changed.');
        }

        // Some hosts point the API subdomain at the app folder instead of public/.
        $docRootIsApp = is_dir($dir) && realpath(__DIR__) === realpath($dir);
        $handler = cpanelHandler("{$dir}/public/.htaccess") ?: cpanelHandler("{$dir}/.htaccess");
        clearDir($dir, [...ALWAYS_KEEP, 'storage', 'public', basename($self)]);
        clearDir("{$dir}/public", [...ALWAYS_KEEP, 'uploads', 'storage', basename($self)]);
        extract_zip($archive, $dir);
        restoreCpanelHandler("{$dir}/public/.htaccess", $handler);
        if ($docRootIsApp) {
            // Route every request into public/ so .env, vendor/ and the source are never served.
            file_put_contents("{$dir}/.htaccess", "RewriteEngine On\nRewriteRule ^(.*)$ public/$1 [L]\n");
            restoreCpanelHandler("{$dir}/.htaccess", $handler);
            echo "WARNING: the API document root is the app folder; set it to {$dir}/public in cPanel > Domains.\n";
        }

        foreach (['storage/app/public', 'storage/framework/cache/data', 'storage/framework/sessions',
            'storage/framework/views', 'storage/logs', 'bootstrap/cache', 'public/uploads'] as $path) {
            is_dir("{$dir}/{$path}") || mkdir("{$dir}/{$path}", 0775, true);
        }
        @chmod("{$dir}/.env", 0600);

        require "{$dir}/vendor/autoload.php";
        $app = require "{$dir}/bootstrap/app.php";
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

        $commands = [['migrate', ['--force' => true]], ['db:seed', ['--force' => true]]];
        if (!file_exists("{$dir}/public/storage")) {
            $commands[] = ['storage:link', []];
        }
        $commands[] = ['optimize', []];

        foreach ($commands as [$command, $args]) {
            echo "> php artisan {$command}\n";
            try {
                $code = $kernel->call($command, $args);
            } catch (Throwable $e) {
                fail("{$command}: ".$e::class.': '.$e->getMessage());
            }
            echo $kernel->output();
            if ($code !== 0 && $command !== 'storage:link') {
                fail("{$command} exited with {$code}");
            }
        }
        break;

    case 'storefront':
        clearDir($dir, [...ALWAYS_KEEP, 'tmp', '.htaccess', 'stderr.log', 'node_modules']);
        extract_zip($archive, $dir);
        is_dir("{$dir}/tmp") || mkdir("{$dir}/tmp", 0755, true);
        touch("{$dir}/tmp/restart.txt");
        break;

    case 'dashboard':
        $handler = cpanelHandler("{$dir}/.htaccess");
        clearDir($dir, [...ALWAYS_KEEP]);
        extract_zip($archive, $dir);
        restoreCpanelHandler("{$dir}/.htaccess", $handler);
        break;

    default:
        fail('unknown target');
}

echo "OK: {$target} deployed\n";
