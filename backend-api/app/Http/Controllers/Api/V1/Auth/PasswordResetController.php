<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingsService;
use App\Support\UserSessions;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Throwable;

class PasswordResetController extends Controller
{
    public function __construct(protected SettingsService $settings) {}

    public function forgot(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email', 'max:255']]);

        try {
            // With customer password sign-in turned off, only staff can still get a reset link.
            $user = User::query()->where('email', $request->input('email'))->first();

            if ($user && ($user->isStaff() || $this->settings->get('password_login_enabled'))) {
                Password::sendResetLink($request->only('email'));
            }
        } catch (Throwable $e) {
            report($e);
        }

        // Identical response either way to avoid account enumeration.
        return response()->json([
            'message' => 'If an account exists for that email, a password reset link has been sent.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z0-9]+$/'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:128', 'confirmed', PasswordRule::min(8)],
        ]);

        $broker = Password::broker();
        $user = $broker->getUser($request->only('email'));

        if (! $user) {
            throw ValidationException::withMessages(['email' => __(Password::INVALID_USER)]);
        }

        if (! $broker->tokenExists($user, (string) $request->input('token'))) {
            throw ValidationException::withMessages(['email' => __(Password::INVALID_TOKEN)]);
        }

        if (! $user->isStaff() && ! $this->settings->get('password_login_enabled')) {
            throw ValidationException::withMessages(['email' => AuthController::PASSWORD_LOGIN_OFF]);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();

                UserSessions::revoke($user);

                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return response()->json(['message' => __($status)]);
    }
}
