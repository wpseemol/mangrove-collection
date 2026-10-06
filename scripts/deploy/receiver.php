<?php

/*
 * One-shot deploy receiver (PHP 8.2+). CI uploads the build zip to the FTP login
 * folder and this file to the API's public folder under a random name with a
 * random token, calls it once over HTTPS, and it deletes itself and the zip
 * whatever the outcome.
 *
 * The zip is extracted into a staging folder first, so a broken upload never
 * touches the live site. Only then are the old files removed (except the ones
 * the server owns) and the new ones moved in.
 *
 * Extraction uses ZipArchive when the zip extension is on, and otherwise a
 * built-in reader that only needs zlib.
 *
 * All paths it receives are relative to the FTP login folder, which it finds by
 * walking up from its own folder until the uploaded zip is found.
 */

declare(strict_types=1);

const TOKEN = '__DEPLOY_TOKEN__';
const ALWAYS_KEEP = ['.well-known', 'cgi-bin', '.user.ini', 'php.ini', 'error_log', '.ftpquota'];

$self = __FILE__;
$zip = null;
$staging = null;

register_shutdown_function(static function () use ($self, &$zip, &$staging): void {
    try {
        if ($staging !== null && is_dir($staging)) {
            removePath($staging);
        }
    } catch (Throwable) {
    }
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

function fail(string $message): never
{
    http_response_code(500);
    echo "ERROR: {$message}\n";
    exit;
}

function relativePath(string $value, string $field): string
{
    $value = trim($value, '/');
    if ($value === '' || in_array('..', explode('/', $value), true) || str_contains($value, '\\')) {
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

// Moves everything from $from into $to, merging into folders that already exist.
function moveInto(string $from, string $to): void
{
    is_dir($to) || mkdir($to, 0755, true);
    foreach (scandir($from) as $name) {
        if ($name === '.' || $name === '..') {
            continue;
        }
        $src = "{$from}/{$name}";
        $dst = "{$to}/{$name}";
        if (is_dir($src) && is_dir($dst) && !is_link($dst)) {
            moveInto($src, $dst);
            continue;
        }
        if (file_exists($dst) || is_link($dst)) {
            removePath($dst);
        }
        rename($src, $dst) || fail("cannot move {$dst}");
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

function extractZip(string $zip, string $to): void
{
    mkdir($to, 0755, true);
    if (class_exists(ZipArchive::class)) {
        $archive = new ZipArchive();
        if ($archive->open($zip) === true) {
            $ok = $archive->extractTo($to);
            $archive->close();
            if ($ok) {
                return;
            }
        }
        echo "ZipArchive could not extract the zip, using the built-in reader\n";
        removePath($to);
        mkdir($to, 0755, true);
    }
    extractZipBuiltin($zip, $to);
}

/** Reads the zip's central directory (including zip64) and returns its file entries. */
function zipEntries($fh, int $size): array
{
    $tailLen = min($size, 22 + 65535);
    fseek($fh, $size - $tailLen);
    $tail = (string) fread($fh, $tailLen);
    $eocd = strrpos($tail, "PK\x05\x06");
    $eocd !== false || fail('zip end record not found (incomplete upload?)');
    ['entries' => $count, 'offset' => $cdOffset] = unpack('ventries/Vsize/Voffset', substr($tail, $eocd + 10, 10));

    if ($count === 0xFFFF || $cdOffset === 0xFFFFFFFF) {
        $loc = $eocd - 20;
        ($loc >= 0 && substr($tail, $loc, 4) === "PK\x06\x07") || fail('zip64 locator not found');
        fseek($fh, unpack('P', substr($tail, $loc + 8, 8))[1]);
        $record = (string) fread($fh, 56);
        str_starts_with($record, "PK\x06\x06") || fail('zip64 end record not found');
        $count = unpack('P', substr($record, 32, 8))[1];
        $cdOffset = unpack('P', substr($record, 48, 8))[1];
    }

    fseek($fh, $cdOffset);
    $entries = [];
    for ($i = 0; $i < $count; $i++) {
        $header = (string) fread($fh, 46);
        (strlen($header) === 46 && str_starts_with($header, "PK\x01\x02")) || fail('broken zip central directory');
        $e = unpack('vflags/vmethod/x4/Vcrc/Vcsize/Vusize/vnlen/vxlen/vclen/x8/Voffset', substr($header, 8));
        $e['name'] = str_replace('\\', '/', (string) fread($fh, $e['nlen']));
        $extra = $e['xlen'] > 0 ? (string) fread($fh, $e['xlen']) : '';
        if ($e['clen'] > 0) {
            fseek($fh, $e['clen'], SEEK_CUR);
        }

        if ($e['usize'] === 0xFFFFFFFF || $e['csize'] === 0xFFFFFFFF || $e['offset'] === 0xFFFFFFFF) {
            for ($p = 0; $p + 4 <= strlen($extra); $p += 4 + $len) {
                ['id' => $id, 'len' => $len] = unpack('vid/vlen', substr($extra, $p, 4));
                if ($id !== 0x0001) {
                    continue;
                }
                $q = $p + 4;
                foreach (['usize', 'csize', 'offset'] as $field) {
                    if ($e[$field] === 0xFFFFFFFF) {
                        $e[$field] = unpack('P', substr($extra, $q, 8))[1];
                        $q += 8;
                    }
                }
                break;
            }
        }
        $entries[] = $e;
    }

    return $entries;
}

function extractZipBuiltin(string $zip, string $to): void
{
    function_exists('inflate_init') || fail('neither the zip nor the zlib PHP extension is enabled');
    $fh = fopen($zip, 'rb');
    $fh !== false || fail('cannot open zip');

    foreach (zipEntries($fh, filesize($zip)) as $e) {
        $name = $e['name'];
        if ($name === '' || str_starts_with($name, '/') || in_array('..', explode('/', $name), true)) {
            fail("unsafe path in zip: {$name}");
        }
        $path = "{$to}/{$name}";
        if (str_ends_with($name, '/')) {
            is_dir($path) || mkdir($path, 0755, true);
            continue;
        }
        ($e['flags'] & 1) === 0 || fail("encrypted file in zip: {$name}");
        is_dir(dirname($path)) || mkdir(dirname($path), 0755, true);

        fseek($fh, $e['offset']);
        $local = (string) fread($fh, 30);
        str_starts_with($local, "PK\x03\x04") || fail("broken zip entry: {$name}");
        ['nlen' => $nlen, 'xlen' => $xlen] = unpack('vnlen/vxlen', substr($local, 26, 4));
        fseek($fh, $e['offset'] + 30 + $nlen + $xlen);

        $inflate = match ($e['method']) {
            0 => null,
            8 => inflate_init(ZLIB_ENCODING_RAW),
            default => fail("unsupported compression method {$e['method']} for {$name}"),
        };
        $out = fopen($path, 'wb');
        $out !== false || fail("cannot write {$path}");
        $crc = hash_init('crc32b');

        for ($left = $e['csize']; $left > 0; $left -= strlen($chunk)) {
            $chunk = fread($fh, min($left, 1 << 20));
            ($chunk !== false && $chunk !== '') || fail("zip truncated at {$name}");
            $data = $inflate === null ? $chunk : inflate_add($inflate, $chunk, ZLIB_SYNC_FLUSH);
            $data !== false || fail("cannot inflate {$name}");
            hash_update($crc, $data);
            fwrite($out, $data);
        }
        if ($inflate !== null && $e['csize'] > 0) {
            $data = inflate_add($inflate, '', ZLIB_FINISH);
            $data !== false || fail("cannot inflate {$name}");
            hash_update($crc, $data);
            fwrite($out, $data);
        }
        fclose($out);
        hash_final($crc) === sprintf('%08x', $e['crc']) || fail("checksum mismatch for {$name}");
    }
    fclose($fh);
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

$dirRel = relativePath((string) ($_POST['dir'] ?? ''), 'dir');
$dir = "{$base}/{$dirRel}";
$zip = "{$base}/{$zipName}";

if ($target === 'api') {
    $missing = array_values(array_filter(
        ['pdo_mysql', 'mbstring', 'openssl', 'tokenizer', 'xml', 'dom', 'ctype', 'fileinfo', 'curl', 'gd'],
        static fn (string $ext): bool => !extension_loaded($ext)
    ));
    if (version_compare(PHP_VERSION, '8.2.0', '<') || $missing !== []) {
        fail('PHP '.PHP_VERSION.' on the API domain. Enable these extensions in cPanel > Select PHP Version: '
            .($missing ? implode(', ', $missing) : '(none missing, but PHP 8.2+ is required)').'. Nothing was changed.');
    }
}

$staging = "{$base}/.deploy-staging-".bin2hex(random_bytes(6));
echo 'Extracting '.basename($zip).' ('.round(filesize($zip) / 1048576, 1)." MB)\n";
extractZip($zip, $staging);

// Never delete the other apps' folders when one app lives inside another's (e.g. inside public_html).
$keep = [...ALWAYS_KEEP, basename($self), basename($zip), basename($staging)];
foreach (explode(',', (string) ($_POST['protect'] ?? '')) as $other) {
    $other = trim($other, '/');
    if ($other !== '' && str_starts_with($other, "{$dirRel}/")) {
        $keep[] = explode('/', substr($other, strlen($dirRel) + 1))[0];
    }
}

echo "Replacing the old files in {$dirRel}/\n";
switch ($target) {
    case 'api':
        $handler = cpanelHandler("{$dir}/public/.htaccess") ?: cpanelHandler("{$dir}/.htaccess");
        clearDir($dir, [...$keep, 'storage', 'public']);
        clearDir("{$dir}/public", [...$keep, 'uploads', 'storage']);
        moveInto($staging, $dir);
        restoreCpanelHandler("{$dir}/public/.htaccess", $handler);
        // Always written: when the API subdomain's document root is the app folder instead of public/,
        // this routes every request into public/ so the source, logs and .env are never served.
        // The receiver can't detect that case because this same rule makes it look like it runs from public/.
        file_put_contents("{$dir}/.htaccess", "Options -Indexes\nRewriteEngine On\nRewriteRule ^(.*)$ public/$1 [L]\n");
        restoreCpanelHandler("{$dir}/.htaccess", $handler);

        foreach (['storage/app/public', 'storage/app/private', 'storage/framework/cache/data', 'storage/framework/sessions',
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
    case 'dashboard':
        $handler = cpanelHandler("{$dir}/.htaccess");
        clearDir($dir, $keep);
        moveInto($staging, $dir);
        restoreCpanelHandler("{$dir}/.htaccess", $handler);
        break;

    default:
        fail('unknown target');
}

echo "OK: {$target} deployed\n";
