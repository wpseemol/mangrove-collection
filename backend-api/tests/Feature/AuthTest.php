<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_and_receives_a_token(): void
    {
        $this->postJson('/v1/auth/register', [
            'name' => 'Rahim',
            'email' => 'rahim@example.com',
            'phone' => '01700000000',
            'password' => 'secret-pass',
            'password_confirmation' => 'secret-pass',
        ])
            ->assertCreated()
            ->assertJsonStructure(['token', 'token_type', 'expires_at', 'user' => ['id', 'email', 'role']])
            ->assertJsonPath('user.role', 'customer');
    }

    public function test_user_can_login_with_email_or_phone(): void
    {
        User::factory()->create(['email' => 'karim@example.com', 'phone' => '01811111111', 'password' => 'secret-pass']);

        $this->postJson('/v1/auth/login', ['login' => 'karim@example.com', 'password' => 'secret-pass'])->assertOk();
        $this->postJson('/v1/auth/login', ['login' => '01811111111', 'password' => 'secret-pass'])->assertOk();
        $this->postJson('/v1/auth/login', ['login' => 'karim@example.com', 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('login');
    }

    public function test_bearer_token_authenticates_and_logout_revokes_it(): void
    {
        User::factory()->create(['email' => 'a@example.com', 'password' => 'secret-pass']);
        $token = $this->postJson('/v1/auth/login', ['login' => 'a@example.com', 'password' => 'secret-pass'])->json('token');

        $this->withToken($token)->getJson('/v1/auth/me')->assertOk()->assertJsonPath('data.email', 'a@example.com');
        $this->withToken($token)->postJson('/v1/auth/logout')->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/v1/auth/me')->assertUnauthorized();
    }

    public function test_deactivated_users_cannot_login(): void
    {
        User::factory()->create(['email' => 'off@example.com', 'password' => 'secret-pass', 'is_active' => false]);

        $this->postJson('/v1/auth/login', ['login' => 'off@example.com', 'password' => 'secret-pass'])
            ->assertUnprocessable();
    }

    public function test_dashboard_login_is_restricted_to_staff(): void
    {
        User::factory()->create(['email' => 'c@example.com', 'password' => 'secret-pass']);
        User::factory()->manager()->create(['email' => 'm@example.com', 'password' => 'secret-pass']);

        $this->postJson('/v1/auth/dashboard/login', ['login' => 'c@example.com', 'password' => 'secret-pass'])
            ->assertUnprocessable();
        $this->postJson('/v1/auth/dashboard/login', ['login' => 'm@example.com', 'password' => 'secret-pass'])
            ->assertOk()
            ->assertJsonPath('user.role', 'manager');
    }

    public function test_customers_cannot_reach_admin_endpoints(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/v1/admin/dashboard')->assertForbidden();
    }

    public function test_managers_cannot_reach_admin_only_endpoints(): void
    {
        Sanctum::actingAs(User::factory()->manager()->create());

        $this->getJson('/v1/admin/dashboard')->assertOk();
        $this->getJson('/v1/admin/settings')->assertForbidden();
        $this->getJson('/v1/admin/users')->assertForbidden();
    }

    public function test_password_reset_link_points_to_the_storefront(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'reset@example.com']);

        $this->postJson('/v1/auth/forgot-password', ['email' => 'reset@example.com'])->assertOk();
        $this->postJson('/v1/auth/forgot-password', ['email' => 'nobody@example.com'])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $url = $notification->toMail($user)->actionUrl;

            return str_starts_with($url, 'http://mangrove-collection.com/reset-password?token=');
        });
    }

    public function test_unauthenticated_requests_get_json_401(): void
    {
        $this->get('/v1/auth/me')->assertUnauthorized()->assertJson(['message' => 'Unauthenticated.']);
    }
}
