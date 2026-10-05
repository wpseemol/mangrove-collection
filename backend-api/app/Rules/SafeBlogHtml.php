<?php

namespace App\Rules;

use App\Support\BlogVideo;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Blog posts (Tiptap output). Every tag and attribute is allow-listed and checked; there is no `style`
 * beyond text alignment, no event handler and no iframe. Videos are stored as
 * `<figure data-video="youtube|vimeo|upload" data-src="…">` and turned into players when rendered.
 */
class SafeBlogHtml implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && ! self::isSafe($value)) {
            $fail('The :attribute contains formatting, links, images or embeds that are not allowed. Remove pasted code or scripts and try again.');
        }
    }

    /**
     * @return array<string, array<string, Closure(string): bool>>
     */
    private static function tags(): array
    {
        $align = ['style' => fn (string $v) => preg_match('/^text-align:\s*(?:left|center|right|justify);?$/i', trim($v)) === 1];
        $plain = fn (string $v) => ! SafeText::isUnsafe($v);
        $digits = fn (string $v) => preg_match('/^\d{1,5}$/', $v) === 1;

        return [
            'p' => $align,
            'h2' => $align,
            'h3' => $align,
            'h4' => $align,
            'br' => [],
            'hr' => [],
            'strong' => [],
            'b' => [],
            'em' => [],
            'i' => [],
            'u' => [],
            's' => [],
            'mark' => [],
            'ul' => [],
            'li' => [],
            'blockquote' => [],
            'pre' => [],
            'figcaption' => [],
            'ol' => ['start' => $digits, 'type' => fn (string $v) => preg_match('/^[1aAiI]$/', $v) === 1],
            'code' => ['class' => fn (string $v) => preg_match('/^language-[a-z0-9+#-]{1,30}$/i', $v) === 1],
            'a' => [
                'href' => fn (string $v) => preg_match('#^(?:https?://|mailto:|tel:|/(?![/\\\\])|\#)#i', $v) === 1 && preg_match('/[\s<>"\'`\\\\]/', $v) !== 1,
                'title' => $plain,
                'target' => fn (string $v) => $v === '_blank',
                'rel' => fn (string $v) => preg_match('/^[a-z ]{1,60}$/i', $v) === 1,
            ],
            'img' => ['src' => fn (string $v) => SafeUrl::isSafe($v), 'alt' => $plain, 'title' => $plain, 'width' => $digits, 'height' => $digits],
            'figure' => [
                'data-video' => fn (string $v) => in_array($v, ['youtube', 'vimeo', 'upload'], true),
                'data-src' => fn (string $v) => SafeUrl::isSafe($v),
            ],
        ];
    }

    public static function isSafe(string $html): bool
    {
        if (preg_match('/<[?%!]|[?%]>|[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $html) === 1) {
            return false;
        }

        if (preg_match('/\b(?:javascript|vbscript)\s*:|\bdata\s*:\s*[a-z]+\/[\w.+-]+[;,]/i', $html) === 1) {
            return false;
        }

        preg_match_all('/<\s*(\/?)\s*([a-z][a-z0-9]*)\b([^<>]*)>/i', $html, $tags, PREG_SET_ORDER);

        if (preg_match_all('/<\s*\/?\s*[a-z]/i', $html) !== count($tags)) {
            return false;
        }

        $allowed = self::tags();

        foreach ($tags as [, $closing, $name, $attributes]) {
            $name = strtolower($name);
            $rules = $allowed[$name] ?? null;

            if ($rules === null) {
                return false;
            }

            $attributes = trim(rtrim($attributes, '/'));

            if ($closing !== '') {
                if ($attributes !== '') {
                    return false;
                }

                continue;
            }

            preg_match_all('/([a-z-]+)\s*=\s*("[^"]*"|\'[^\']*\')/i', $attributes, $pairs, PREG_SET_ORDER);

            if (preg_replace('/\s+/', '', implode('', array_column($pairs, 0))) !== preg_replace('/\s+/', '', $attributes)) {
                return false;
            }

            $values = [];

            foreach ($pairs as [, $key, $raw]) {
                $key = strtolower($key);
                $value = str_replace('&amp;', '&', substr($raw, 1, -1));
                $check = $rules[$key] ?? null;

                if (! $check || array_key_exists($key, $values) || ! $check($value)) {
                    return false;
                }

                $values[$key] = $value;
            }

            if ($name === 'figure' && ! BlogVideo::isVideoUrl($values['data-video'] ?? '', $values['data-src'] ?? '')) {
                return false;
            }

            if ($name === 'img' && blank($values['src'] ?? null)) {
                return false;
            }
        }

        return true;
    }
}
