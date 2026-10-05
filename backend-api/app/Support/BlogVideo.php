<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Video links in blog posts: YouTube, Vimeo, or an MP4/WebM uploaded to our own public disk.
 */
class BlogVideo
{
    public const PROVIDERS = ['upload', 'youtube', 'vimeo'];

    /**
     * The 11-character video id from youtube.com/watch, youtu.be, /embed, /shorts and /live links.
     */
    public static function youtubeId(string $url): ?string
    {
        if (! ($parts = self::httpUrl($url))) {
            return null;
        }

        $host = preg_replace('/^(?:www\.|m\.)/', '', $parts['host']);
        $path = $parts['path'] ?? '/';
        $candidate = null;

        if ($host === 'youtu.be') {
            $candidate = explode('/', substr($path, 1))[0];
        } elseif ($host === 'youtube.com' || $host === 'youtube-nocookie.com') {
            if ($path === '/watch') {
                parse_str($parts['query'] ?? '', $query);
                $candidate = is_string($query['v'] ?? null) ? $query['v'] : null;
            } elseif (preg_match('#^/(?:embed|shorts|live)/([^/]+)#', $path, $match) === 1) {
                $candidate = $match[1];
            }
        }

        return $candidate !== null && preg_match('/^[A-Za-z0-9_-]{11}$/', $candidate) === 1 ? $candidate : null;
    }

    /**
     * The numeric id from vimeo.com/123 or player.vimeo.com/video/123 links.
     */
    public static function vimeoId(string $url): ?string
    {
        if (! ($parts = self::httpUrl($url))) {
            return null;
        }

        $host = preg_replace('/^www\./', '', $parts['host']);
        $path = $parts['path'] ?? '/';

        $pattern = match ($host) {
            'vimeo.com' => '#^/(?:.*/)?(\d{6,12})$#',
            'player.vimeo.com' => '#^/video/(\d{6,12})$#',
            default => null,
        };

        return $pattern && preg_match($pattern, $path, $match) === 1 ? $match[1] : null;
    }

    /**
     * A video uploaded through `POST /admin/media/videos`.
     */
    public static function isUploaded(string $url): bool
    {
        $base = Storage::disk('public')->url('uploads/');

        return str_starts_with($url, $base)
            && preg_match('#^[\w/-]+\.(?:mp4|webm)$#', substr($url, strlen($base))) === 1
            && ! str_contains($url, '..');
    }

    public static function isVideoUrl(string $provider, string $url): bool
    {
        return match ($provider) {
            'youtube' => self::youtubeId($url) !== null,
            'vimeo' => self::vimeoId($url) !== null,
            'upload' => self::isUploaded($url),
            default => false,
        };
    }

    /**
     * The provider of a pasted link, or null when it is not a supported video link.
     */
    public static function detectProvider(string $url): ?string
    {
        return match (true) {
            self::youtubeId($url) !== null => 'youtube',
            self::vimeoId($url) !== null => 'vimeo',
            self::isUploaded($url) => 'upload',
            default => null,
        };
    }

    public static function embedUrl(string $provider, string $url): ?string
    {
        if ($provider === 'youtube' && ($id = self::youtubeId($url))) {
            return "https://www.youtube-nocookie.com/embed/{$id}";
        }

        if ($provider === 'vimeo' && ($id = self::vimeoId($url))) {
            return "https://player.vimeo.com/video/{$id}";
        }

        return null;
    }

    public static function thumbnail(string $provider, string $url): ?string
    {
        $id = $provider === 'youtube' ? self::youtubeId($url) : null;

        return $id ? "https://i.ytimg.com/vi/{$id}/hqdefault.jpg" : null;
    }

    /**
     * Sniffs the container from the first bytes instead of trusting the file name or the browser's MIME type.
     *
     * @return array{extension: string, mime: string}|null
     */
    public static function sniff(string $path): ?array
    {
        $handle = @fopen($path, 'rb');

        if ($handle === false) {
            return null;
        }

        $bytes = (string) fread($handle, 16);
        fclose($handle);

        if (strlen($bytes) < 12) {
            return null;
        }

        if (substr($bytes, 4, 4) === 'ftyp') {
            return str_starts_with(substr($bytes, 8, 4), 'qt') ? null : ['extension' => 'mp4', 'mime' => 'video/mp4'];
        }

        if (substr($bytes, 0, 4) === "\x1A\x45\xDF\xA3") {
            return ['extension' => 'webm', 'mime' => 'video/webm'];
        }

        return null;
    }

    /**
     * @return array{host: string, path?: string, query?: string}|null
     */
    private static function httpUrl(string $url): ?array
    {
        if (preg_match('#^https?://[^/?\#]+#i', $url) !== 1) {
            return null;
        }

        $parts = parse_url($url);

        if (! is_array($parts) || blank($parts['host'] ?? null)) {
            return null;
        }

        $parts['host'] = strtolower($parts['host']);

        return $parts;
    }
}
