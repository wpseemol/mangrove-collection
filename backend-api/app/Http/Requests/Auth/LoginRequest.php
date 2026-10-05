<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Rules\SafeText;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
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
            'login' => ['required', 'string', 'max:255', new SafeText],
            'password' => ['required', 'string', 'max:128'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * `login` accepts either an email address or a phone number.
     *
     * @throws ValidationException
     */
    public function authenticate(): User
    {
        $login = trim($this->string('login'));
        $column = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::query()->where($column, $column === 'email' ? strtolower($login) : $login)->first();

        // Checked against a throwaway hash when there is no account, so a quick reply never reveals which emails and phones are registered.
        $valid = Hash::check((string) $this->string('password'), $user?->password ?? Hash::make(Str::random(32)));

        if (! $user || $user->password === null || ! $valid) {
            throw ValidationException::withMessages(['login' => __('auth.failed')]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages(['login' => 'Your account has been deactivated.']);
        }

        return $user;
    }
}
