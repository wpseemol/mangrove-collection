<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Links and image URLs: an absolute http(s) URL, or (when allowed) a site path
 * such as `/shop`. Blocks `javascript:`/`data:` URLs, protocol-relative `//host`
 * links and anything with whitespace, quotes or angle brackets.
 */
class SafeUrl implements ValidationRule
{
    public function __construct(private readonly bool $allowRelative = false) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! self::isSafe($value, $this->allowRelative)) {
            $fail($this->allowRelative
                ? 'The :attribute must be a valid http(s) link or a path starting with /.'
                : 'The :attribute must be a valid http(s) link.');
        }
    }

    public static function isSafe(string $url, bool $allowRelative = false): bool
    {
        if (preg_match('/[\s<>"\'`\\\\\x00-\x1F\x7F]/', $url) === 1) {
            return false;
        }

        if ($allowRelative && preg_match('#^/(?![/\\\\])#', $url) === 1) {
            return true;
        }

        return filter_var($url, FILTER_VALIDATE_URL) !== false
            && in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true);
    }
}
