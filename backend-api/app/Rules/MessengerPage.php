<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * A Facebook Page username or numeric Page ID, used for m.me links.
 */
class MessengerPage implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || preg_match('/^(?:\d{5,20}|[A-Za-z0-9.]{5,50})$/', $value) !== 1) {
            $fail('Enter your Facebook Page username (letters, numbers and dots) or numeric Page ID.');
        }
    }
}
