<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/** Digits with an optional leading +, allowing spaces, dashes and brackets (e.g. 01712-345678, +880 1712 345678). */
class PhoneNumber implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || preg_match('/^\+?[0-9][0-9\s\-()]{5,19}$/', $value) !== 1) {
            $fail('The :attribute must be a valid phone number.');
        }
    }
}
