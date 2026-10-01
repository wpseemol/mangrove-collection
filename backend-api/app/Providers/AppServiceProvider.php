<?php

namespace App\Providers;

use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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

        ResetPassword::createUrlUsing(function (User $user, string $token) {
            $settings = $this->app->make(SettingsService::class);
            $base = $user->isStaff() ? $settings->get('dashboard_url') : $settings->get('storefront_url');

            return rtrim((string) $base, '/').'/reset-password?'.http_build_query([
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

        RateLimiter::for('tracking', fn (Request $request) => Limit::perMinute(20)->by($request->ip()));
    }
}
