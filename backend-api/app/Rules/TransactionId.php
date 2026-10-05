<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * bKash, Nagad and Rocket transaction IDs are short letter/digit codes (e.g. 9AB7CD6E5F).
 * Pair with TransactionId::normalize() so "9ab7 cd6e5f" and "9AB7CD6E5F" are treated alike.
 */
class TransactionId implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || preg_match('/^[A-Z0-9]{6,20}$/', $value) !== 1) {
            $fail('The :attribute must be 6–20 letters or digits, exactly as shown in your payment SMS.');
        }
    }

    public static function normalize(mixed $value): mixed
    {
        return is_string($value) ? strtoupper((string) preg_replace('/[\s\-]+/', '', $value)) : $value;
    }
}
