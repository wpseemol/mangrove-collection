<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Plain-text fields: rejects HTML/XML tags, PHP/ASP tags, script URLs, control
 * characters and well-known SQL-injection payloads. Arrays are checked leaf by leaf.
 *
 * Queries are always parameter-bound, so this is defence in depth that keeps
 * hostile payloads out of the database, logs, emails and SMS templates.
 */
class SafeText implements ValidationRule
{
    /** Keep in sync with `unsafeTextPattern` in the dashboard and storefront `lib/validation.ts`. */
    public const PATTERNS = [
        '/<\s*\/?\s*[a-z!?%]/i',                                   // HTML tags, comments and PHP/ASP opening tags
        '/[?%]>/',                                                  // PHP/ASP closing tags
        '/\b(?:javascript|vbscript)\s*:|\bdata\s*:\s*[a-z]+\/[\w.+-]+[;,]/i', // script / data URLs
        '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/',                       // control characters (tab and newlines are fine)
        '/\bunion\s+(?:all\s+)?select\b/i',                         // UNION SELECT
        '/;\s*(?:drop|truncate|alter|delete|insert|update|create|grant|shutdown)\s/i',
        '/[\'"`]\s*(?:or|and)\s+[\'"`]?\w+[\'"`]?\s*(?:=|like)\s*[\'"`]?\w+/i', // ' OR '1'='1
        '/[\'"`]\s*(?:--|#|\/\*)/',                                 // admin'--
        '/\/\*.*?\*\//s',                                           // /* inline comment */
        '/\b(?:sleep|benchmark|pg_sleep)\(/i',
        '/\bwaitfor\s+delay\b/i',
        '/\b(?:information_schema|load_file)\b|\binto\s+(?:out|dump)file\b/i',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (self::isUnsafe($value)) {
            $fail('The :attribute must not contain HTML, PHP, script or SQL code.');
        }
    }

    public static function isUnsafe(mixed $value): bool
    {
        if (is_array($value)) {
            foreach ($value as $key => $item) {
                if (self::isUnsafe($key) || self::isUnsafe($item)) {
                    return true;
                }
            }

            return false;
        }

        if (! is_string($value) || $value === '') {
            return false;
        }

        foreach (self::PATTERNS as $pattern) {
            if (preg_match($pattern, $value) === 1) {
                return true;
            }
        }

        return false;
    }
}
