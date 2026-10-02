<?php

namespace App\Http\Requests\Auth;

use App\Rules\PhoneNumber;
use App\Rules\SafeText;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', new SafeText],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:32', new PhoneNumber, 'unique:users,phone'],
            'password' => ['required', 'string', 'max:128', 'confirmed', Password::min(8)],
            'remember' => ['sometimes', 'boolean'],
        ];
    }
}
