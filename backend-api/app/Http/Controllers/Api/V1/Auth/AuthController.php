<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Concerns\StartsAuthSession;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\SettingsService;
use App\Support\UserSessions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use StartsAuthSession;

    public const PASSWORD_LOGIN_OFF = 'Email and password sign-in is turned off. Please use another sign-in option.';

    public function __construct(protected SettingsService $settings) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $this->ensureBrowserSession($request);

        $user = User::query()->create([
            ...$request->safe()->only(['name', 'email', 'phone', 'password']),
            'role' => UserRole::Customer,
        ]);

        return $this->startSession($request, $user, $request->boolean('remember'), 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $this->ensureBrowserSession($request);

        $user = $request->authenticate();

        // Turns off email/password sign-in for customers only; staff keep it so the dashboard stays reachable.
        if (! $user->isStaff() && ! $this->settings->get('password_login_enabled')) {
            throw ValidationException::withMessages(['login' => self::PASSWORD_LOGIN_OFF]);
        }

        return $this->startSession($request, $user, $request->boolean('remember'));
    }

    /**
     * Same as login, but only staff may sign in, and never with a remember-me cookie.
     */
    public function dashboardLogin(LoginRequest $request): JsonResponse
    {
        $this->ensureBrowserSession($request);

        $user = $request->authenticate();

        if (! $user->isStaff()) {
            throw ValidationException::withMessages(['login' => 'You do not have access to the dashboard.']);
        }

        return $this->startSession($request, $user);
    }

    /**
     * Public: lets the static frontends find out whether the session cookie
     * belongs to a signed-in user, without a 401 for guests.
     */
    public function session(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && ! $user->is_active) {
            $this->endSession($request);
            $user = null;
        }

        return response()->json([
            'authenticated' => $user !== null,
            'user' => $user ? new UserResource($user) : null,
        ]);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        $this->endSession($request);

        return response()->json(['message' => 'Logged out.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        UserSessions::revoke($request->user());

        $this->endSession($request);

        return response()->json(['message' => 'Logged out from all devices.']);
    }
}
