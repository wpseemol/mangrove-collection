<?php

namespace App\Http\Controllers\Concerns;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Browser sign-in via Sanctum's SPA flow: the user is stored in the encrypted,
 * HttpOnly session cookie. No token is ever returned to JavaScript.
 */
trait StartsAuthSession
{
    /**
     * Sessions only exist for requests from SANCTUM_STATEFUL_DOMAINS, so this
     * rejects sign-in attempts from any other origin (scripts, other sites).
     */
    protected function ensureBrowserSession(Request $request): void
    {
        abort_unless(
            $request->hasSession(),
            Response::HTTP_FORBIDDEN,
            'Sign-in is only available from the Mangrove Collection website or dashboard.',
        );
    }

    protected function startSession(Request $request, User $user, bool $remember = false, int $status = 200): JsonResponse
    {
        $this->ensureBrowserSession($request);

        Auth::guard('web')->login($user, $remember);

        // New session id + CSRF token: prevents session fixation.
        $request->session()->regenerate();

        $user->forceFill(['last_login_at' => now()])->save();

        return response()->json(['user' => new UserResource($user)], $status);
    }

    protected function endSession(Request $request): void
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }
}
