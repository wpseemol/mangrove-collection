<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Concerns\IssuesApiTokens;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use IssuesApiTokens;

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::query()->create([
            ...$request->safe()->only(['name', 'email', 'phone', 'password']),
            'role' => UserRole::Customer,
        ]);

        return $this->issueToken($user, $request->input('device_name'), 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        return $this->issueToken($request->authenticate(), $request->input('device_name'));
    }

    /**
     * Same as login, but only staff accounts may obtain a dashboard token.
     */
    public function dashboardLogin(LoginRequest $request): JsonResponse
    {
        $user = $request->authenticate();

        if (! $user->isStaff()) {
            throw ValidationException::withMessages(['login' => 'You do not have access to the dashboard.']);
        }

        return $this->issueToken($user, $request->input('device_name', 'dashboard'));
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out from all devices.']);
    }
}
