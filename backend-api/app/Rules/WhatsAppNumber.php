<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * International (E.164) number with the country code, as wa.me links require:
 * "+8801712345678" or "880 1712-345678". Local numbers like "01712345678" are rejected.
 */
class WhatsAppNumber implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || preg_match('/^\+?[1-9]\d{7,14}$/', (string) preg_replace('/[\s\-().]/', '', $value)) !== 1) {
            $fail('Enter the WhatsApp number in international format with the country code, e.g. +8801712345678.');
        }
    }
}
