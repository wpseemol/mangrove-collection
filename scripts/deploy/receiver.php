<?php

/*
 * One-shot deploy receiver. CI uploads it to the API's public/ folder under a
 * random name with a random token, calls it once over HTTPS and it deletes
 * itself (and the uploaded zip) whatever the outcome.
 *
 * Assumes the API, storefront and dashboard folders all sit in the FTP root
 * (the cPanel home folder), i.e. this file lives at <home>/<api dir>/public/.
 */

declare(strict_types=1);

const TOKEN = '__DEPLOY_TOKEN__';

$self = __FILE__;
$base = dirname(__DIR__, 2);
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

function extract_zip(string $zip, string $dir): void
{
    $archive = new ZipArchive();
    if ($archive->open($zip) !== true) {
        fail('cannot open zip');
    }
    if (!$archive->extractTo($dir)) {
        fail('extract failed');
    }
    $archive->close();
}

$target = (string) ($_POST['target'] ?? '');
$dir = $base.'/'.relativePath((string) ($_POST['dir'] ?? ''), 'dir');
$zip = $base.'/'.relativePath((string) ($_POST['zip'] ?? ''), 'zip');

if (!is_file($zip)) {
    fail('zip not found');
}

switch ($target) {
    case 'api':
        $handler = cpanelHandler("{$dir}/public/.htaccess");
        clearDir($dir, [...ALWAYS_KEEP, 'storage', 'public']);
        clearDir("{$dir}/public", [...ALWAYS_KEEP, 'uploads', 'storage', basename($self)]);
        extract_zip($zip, $dir);
        restoreCpanelHandler("{$dir}/public/.htaccess", $handler);

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
            $code = $kernel->call($command, $args);
            echo $kernel->output();
            if ($code !== 0 && $command !== 'storage:link') {
                fail("{$command} exited with {$code}");
            }
        }
        break;

    case 'storefront':
        clearDir($dir, [...ALWAYS_KEEP, 'tmp', '.htaccess', 'stderr.log', 'node_modules']);
        extract_zip($zip, $dir);
        is_dir("{$dir}/tmp") || mkdir("{$dir}/tmp", 0755, true);
        touch("{$dir}/tmp/restart.txt");
        break;

    case 'dashboard':
        $handler = cpanelHandler("{$dir}/.htaccess");
        clearDir($dir, [...ALWAYS_KEEP]);
        extract_zip($zip, $dir);
        restoreCpanelHandler("{$dir}/.htaccess", $handler);
        break;

    default:
        fail('unknown target');
}

echo "OK: {$target} deployed\n";
