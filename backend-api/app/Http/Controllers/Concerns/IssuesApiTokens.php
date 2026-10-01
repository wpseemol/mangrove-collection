<?php

namespace App\Http\Controllers\Concerns;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

trait IssuesApiTokens
{
    protected function issueToken(User $user, ?string $deviceName = null, int $status = 200): JsonResponse
    {
        $minutes = config('sanctum.expiration');
        $expiresAt = $minutes ? now()->addMinutes($minutes) : null;

        $token = $user->createToken($deviceName ?: 'api', ['*'], $expiresAt);

        $user->forceFill(['last_login_at' => now()])->save();

        return response()->json([
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt?->toIso8601String(),
            'user' => new UserResource($user),
        ], $status);
    }
}
