<?php

/*
 * One-shot API deploy helper. CI uploads it to the API's document root under a
 * random name with a random token, calls it once over HTTPS and it deletes
 * itself whatever the outcome. The app files themselves are uploaded over FTP.
 *
 *   action=check   before upload: verify the PHP version and extensions
 *   action=finish  after upload: create runtime folders, migrate, seed, cache
 *   app            path from this file's folder to the Laravel app: "." or ".."
 */

declare(strict_types=1);

const TOKEN = '__DEPLOY_TOKEN__';

$self = __FILE__;

register_shutdown_function(static function () use ($self): void {
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

function fail(string $message): never
{
    http_response_code(500);
    echo "ERROR: {$message}\n";
    exit;
}

$app = (string) ($_POST['app'] ?? '');
if (!in_array($app, ['.', '..'], true)) {
    fail('invalid app');
}
$dir = $app === '.' ? __DIR__ : dirname(__DIR__);

switch ((string) ($_POST['action'] ?? '')) {
    case 'check':
        $missing = array_values(array_filter(
            ['pdo_mysql', 'mbstring', 'openssl', 'tokenizer', 'xml', 'dom', 'ctype', 'fileinfo', 'curl', 'gd'],
            static fn (string $ext): bool => !extension_loaded($ext)
        ));
        if (version_compare(PHP_VERSION, '8.2.0', '<') || $missing !== []) {
            fail('PHP '.PHP_VERSION.' on the API domain. Enable these extensions in cPanel > Select PHP Version: '
                .($missing ? implode(', ', $missing) : '(none missing, but PHP 8.2+ is required)').'. Nothing was changed.');
        }
        echo "OK: ready\n";
        break;

    case 'finish':
        foreach (['storage/app/public', 'storage/app/private', 'storage/framework/cache/data', 'storage/framework/sessions',
            'storage/framework/views', 'storage/logs', 'bootstrap/cache', 'public/uploads'] as $path) {
            is_dir("{$dir}/{$path}") || mkdir("{$dir}/{$path}", 0775, true);
        }
        @chmod("{$dir}/.env", 0600);

        require "{$dir}/vendor/autoload.php";
        $laravel = require "{$dir}/bootstrap/app.php";
        $kernel = $laravel->make(Illuminate\Contracts\Console\Kernel::class);

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
        echo "OK: api deployed\n";
        break;

    default:
        fail('unknown action');
}
