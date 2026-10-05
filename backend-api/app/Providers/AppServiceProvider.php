<?php

namespace App\Providers;

use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SettingsService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app->make(SettingsService::class)->applyRuntimeConfig();

        $this->configureRateLimiting();

        // Browsers authenticate with the HttpOnly session cookie only; Bearer tokens are ignored.
        Sanctum::getAccessTokenFromRequestUsing(fn () => null);

        ResetPassword::createUrlUsing(function (User $user, string $token) {
            $settings = $this->app->make(SettingsService::class);
            // The storefront is a static export with trailing-slash URLs; the dashboard is an SPA.
            $page = $user->isStaff()
                ? rtrim((string) $settings->get('dashboard_url'), '/').'/reset-password'
                : rtrim((string) $settings->get('storefront_url'), '/').'/reset-password/';

            return $page.'?'.http_build_query([
                'token' => $token,
                'email' => $user->email,
            ]);
        });
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)
            ->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('auth', function (Request $request) {
            $identifier = strtolower(trim((string) $request->input('login', $request->input('email'))));

            return array_filter([
                Limit::perMinute(10)->by('auth-ip:'.$request->ip()),
                $identifier !== '' ? Limit::perMinute(5)->by('auth-login:'.$identifier) : null,
            ]);
        });

        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute(10)
            ->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('quote', fn (Request $request) => Limit::perMinute(60)
            ->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('newsletter', fn (Request $request) => [
            Limit::perMinute(5)->by('newsletter-ip:'.$request->ip()),
            Limit::perHour(30)->by('newsletter-ip-hour:'.$request->ip()),
        ]);

        RateLimiter::for('tracking', fn (Request $request) => Limit::perMinute(20)->by($request->ip()));

        // Phone/email buyer checks: slows down anyone trying numbers one after another.
        RateLimiter::for('review-verify', function (Request $request) {
            $contact = strtolower(trim((string) $request->input('contact')));

            return array_filter([
                Limit::perMinute(10)->by('review-ip:'.$request->ip()),
                Limit::perHour(60)->by('review-ip-hour:'.$request->ip()),
                $contact !== '' ? Limit::perMinute(5)->by('review-contact:'.sha1($contact)) : null,
            ]);
        });

        RateLimiter::for('uploads', fn (Request $request) => Limit::perMinute(20)
            ->by($request->user()?->id ?: $request->ip()));

        // Revealing a stored secret needs the admin's password, so guessing it is kept slow.
        RateLimiter::for('reveal-secret', fn (Request $request) => [
            Limit::perMinute(5)->by('reveal:'.($request->user()?->id ?: $request->ip())),
            Limit::perHour(30)->by('reveal-hour:'.($request->user()?->id ?: $request->ip())),
        ]);

        // Reads stay on the global `api` limit; creates, updates and deletes get a tighter one.
        RateLimiter::for('writes', fn (Request $request) => $request->isMethodSafe()
            ? Limit::none()
            : Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));
    }
}
