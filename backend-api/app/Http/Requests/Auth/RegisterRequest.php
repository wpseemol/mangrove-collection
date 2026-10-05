<?php

namespace App\Http\Requests\Auth;

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Rules\PhoneNumber;
use App\Rules\SafeText;
use App\Services\SettingsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RegisterRequest extends FormRequest
{
    public function authorize(SettingsService $settings): bool
    {
        return (bool) $settings->get('password_login_enabled');
    }

    protected function failedAuthorization(): never
    {
        throw new HttpException(403, AuthController::PASSWORD_LOGIN_OFF);
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
