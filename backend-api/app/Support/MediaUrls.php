<?php

namespace App\Support;

/**
 * URLs of files the API serves itself (/storage/... and /uploads/...) are stored as
 * root-relative paths and turned into absolute URLs with the current APP_URL when read.
 *
 * This keeps the database portable: rows created on a dev machine (http://localhost:8080)
 * or under an old domain still point at the right server after being copied to production.
 */
class MediaUrls
{
    private const PATH = '/(?:storage|uploads)/';

    /** Turns our own absolute media URLs into "/storage/..." paths; anything else is kept as-is. */
    public static function toPath(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return $url;
        }

        return preg_replace(self::ownOrigin(true), '', $url, 1);
    }

    /** Turns stored "/storage/..." paths (and legacy URLs on a dev or old host) into URLs on APP_URL. */
    public static function toUrl(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        $path = self::toPath($value);

        return preg_match('#^'.self::PATH.'#', $path) === 1 ? self::base().$path : $path;
    }

    /** toPath() for every media URL inside an HTML fragment. */
    public static function htmlToPaths(?string $html): ?string
    {
        return $html === null || $html === '' ? $html : preg_replace(self::ownOrigin(false), '', $html);
    }

    /** toUrl() for every media URL inside an HTML fragment. */
    public static function htmlToUrls(?string $html): ?string
    {
        if ($html === null || $html === '') {
            return $html;
        }

        return preg_replace('#(?<=["\'(])(?='.self::PATH.')#', self::base(), self::htmlToPaths($html));
    }

    private static function base(): string
    {
        return rtrim((string) config('app.url'), '/');
    }

    /** Scheme + host of local dev servers and of APP_URL, when followed by a media path. */
    private static function ownOrigin(bool $anchored): string
    {
        $hosts = ['localhost', '127\.0\.0\.1', '[\w.-]+\.test'];
        if ($host = parse_url(self::base(), PHP_URL_HOST)) {
            $hosts[] = preg_quote($host, '#');
        }

        return '#'.($anchored ? '^' : '').'https?://(?:'.implode('|', $hosts).')(?::\d+)?(?='.self::PATH.')#i';
    }
}
