<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserSessions
{
    /**
     * Signs a user out of every browser: deletes their stored sessions and
     * rotates the remember-me token so "keep me signed in" cookies stop working.
     * Pass the current session id to keep the caller's own session alive.
     */
    public static function revoke(User $user, ?string $exceptSessionId = null): void
    {
        if (config('session.driver') === 'database') {
            DB::connection(config('session.connection'))
                ->table(config('session.table', 'sessions'))
                ->where('user_id', $user->getKey())
                ->when($exceptSessionId, fn ($query, $id) => $query->where('id', '!=', $id))
                ->delete();
        }

        $user->forceFill(['remember_token' => Str::random(60)])->saveQuietly();

        // Legacy Bearer tokens from before cookie sessions; they can no longer authenticate.
        $user->tokens()->delete();
    }
}
