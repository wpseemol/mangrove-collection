<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Concerns\IssuesApiTokens;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\SafeText;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Throwable;

class GoogleAuthController extends Controller
{
    use IssuesApiTokens;

    public function __construct(protected SettingsService $settings) {}

    /**
     * Returns the Google consent-screen URL for the authorization-code flow.
     * Google redirects back to the `google_redirect_uri` setting (a frontend
     * page), which then POSTs the received `code` to /v1/auth/google.
     */
    public function redirect(): JsonResponse
    {
        $this->ensureConfigured(requireRedirect: true);

        $url = $this->driver()->stateless()->redirect()->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    /**
     * Accepts either an `access_token` (Google Identity Services token client)
     * or an authorization `code` (redirect flow) and returns a Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'access_token' => ['required_without:code', 'nullable', 'string', 'max:4096', 'regex:/^[A-Za-z0-9._\-~+\/=]+$/'],
            'code' => ['required_without:access_token', 'nullable', 'string', 'max:2048', 'regex:/^[A-Za-z0-9._\-~+\/=]+$/'],
            'device_name' => ['nullable', 'string', 'max:100', new SafeText],
        ]);

        $this->ensureConfigured(requireRedirect: $request->filled('code'));

        try {
            $googleUser = $request->filled('access_token')
                ? $this->driver()->userFromToken($request->string('access_token'))
                : $this->driver()->stateless()->user();
        } catch (Throwable $e) {
            report($e);

            throw ValidationException::withMessages(['google' => 'Unable to authenticate with Google.']);
        }

        $user = $this->resolveUser($googleUser);

        if (! $user->is_active) {
            throw ValidationException::withMessages(['google' => 'Your account has been deactivated.']);
        }

        return $this->issueToken($user, $request->input('device_name', 'google'));
    }

    protected function resolveUser(SocialiteUser $googleUser): User
    {
        $email = strtolower((string) $googleUser->getEmail());

        if ($email === '' || (($googleUser->user['email_verified'] ?? true) === false)) {
            throw ValidationException::withMessages(['google' => 'Your Google account email is not verified.']);
        }

        $user = User::query()->where('google_id', $googleUser->getId())->first()
            ?? User::query()->where('email', $email)->first();

        if (! $user) {
            return User::query()->create([
                'name' => $googleUser->getName() ?: $email,
                'email' => $email,
                'avatar' => $googleUser->getAvatar(),
                'google_id' => $googleUser->getId(),
                'email_verified_at' => now(),
            ]);
        }

        $user->forceFill(array_filter([
            'google_id' => $user->google_id ?? $googleUser->getId(),
            'avatar' => $user->avatar ?? $googleUser->getAvatar(),
            'email_verified_at' => $user->email_verified_at ?? now(),
        ]))->save();

        return $user;
    }

    protected function ensureConfigured(bool $requireRedirect = false): void
    {
        $configured = $this->settings->get('google_login_enabled')
            && $this->settings->filled('google_client_id')
            && $this->settings->filled('google_client_secret')
            && (! $requireRedirect || $this->settings->filled('google_redirect_uri'));

        abort_unless($configured, 503, 'Google login is not configured.');
    }

    protected function driver(): GoogleProvider
    {
        /** @var GoogleProvider */
        return Socialite::driver('google');
    }
}
