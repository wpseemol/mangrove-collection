<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Rich-text fields (product description, page content): only basic formatting
 * tags are accepted. Scripts, styles, iframes, event handlers, PHP/ASP tags and
 * non-http(s) links are rejected.
 */
class SafeHtml implements ValidationRule
{
    private const TAGS = ['p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a'];

    private const LINK_ATTRIBUTES = ['href', 'title', 'target', 'rel'];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && ! self::isSafe($value)) {
            $fail('The :attribute may only use basic formatting (p, strong, em, ul, ol, li, h2–h4, blockquote and http links).');
        }
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

        // Every "<letter" must belong to a complete, well-formed tag.
        if (preg_match_all('/<\s*\/?\s*[a-z]/i', $html) !== count($tags)) {
            return false;
        }

        foreach ($tags as [, $closing, $name, $attributes]) {
            $name = strtolower($name);

            if (! in_array($name, self::TAGS, true)) {
                return false;
            }

            $attributes = trim(rtrim($attributes, '/'));

            if ($closing !== '' || $attributes === '') {
                continue;
            }

            if ($name !== 'a' || ! self::linkAttributesAreSafe($attributes)) {
                return false;
            }
        }

        return true;
    }

    private static function linkAttributesAreSafe(string $attributes): bool
    {
        preg_match_all('/([a-z-]+)\s*=\s*("[^"]*"|\'[^\']*\'|[^\s"\'=<>`]+)/i', $attributes, $pairs, PREG_SET_ORDER);

        $consumed = implode(' ', array_column($pairs, 0));

        if (preg_replace('/\s+/', '', $consumed) !== preg_replace('/\s+/', '', $attributes)) {
            return false;
        }

        foreach ($pairs as [, $key, $value]) {
            $key = strtolower($key);
            $value = trim($value, '"\'');

            if (! in_array($key, self::LINK_ATTRIBUTES, true)) {
                return false;
            }

            if ($key === 'href' && preg_match('#^(?:https?://|mailto:|tel:|/(?!/)|\#)#i', $value) !== 1) {
                return false;
            }
        }

        return true;
    }
}
