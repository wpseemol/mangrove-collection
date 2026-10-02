<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\UserSessions;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_and_is_signed_in_with_a_session(): void
    {
        $this->fromStorefront()->postJson('/v1/auth/register', [
            'name' => 'Rahim',
            'email' => 'rahim@example.com',
            'phone' => '01700000000',
            'password' => 'secret-pass',
            'password_confirmation' => 'secret-pass',
        ])
            ->assertCreated()
            ->assertJsonMissingPath('token')
            ->assertJsonPath('user.role', 'customer');

        $this->assertAuthenticatedAs(User::query()->where('email', 'rahim@example.com')->first(), 'web');
    }

    public function test_user_can_login_with_email_or_phone(): void
    {
        User::factory()->create(['email' => 'karim@example.com', 'phone' => '01811111111', 'password' => 'secret-pass']);

        $this->fromStorefront()->postJson('/v1/auth/login', ['login' => 'karim@example.com', 'password' => 'secret-pass'])->assertOk();
        $this->fromStorefront()->postJson('/v1/auth/login', ['login' => '01811111111', 'password' => 'secret-pass'])->assertOk();
        $this->fromStorefront()->postJson('/v1/auth/login', ['login' => 'karim@example.com', 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('login');
    }

    public function test_login_sets_an_http_only_session_cookie_and_never_returns_a_token(): void
    {
        User::factory()->create(['email' => 'a@example.com', 'password' => 'secret-pass']);

        $response = $this->fromStorefront()
            ->postJson('/v1/auth/login', ['login' => 'a@example.com', 'password' => 'secret-pass'])
            ->assertOk()
            ->assertJsonMissingPath('token')
            ->assertJsonPath('user.email', 'a@example.com')
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertCookie('mangrove_session');

        $cookie = collect($response->headers->getCookies())->first(fn ($c) => $c->getName() === 'mangrove_session');
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', $cookie->getSameSite());
    }

    public function test_remember_me_sets_a_remember_cookie_only_when_asked(): void
    {
        User::factory()->create(['email' => 'a@example.com', 'password' => 'secret-pass']);
        $recaller = auth()->guard('web')->getRecallerName();

        $this->fromStorefront()
            ->postJson('/v1/auth/login', ['login' => 'a@example.com', 'password' => 'secret-pass'])
            ->assertCookieMissing($recaller);

        $this->fromStorefront()
            ->postJson('/v1/auth/login', ['login' => 'a@example.com', 'password' => 'secret-pass', 'remember' => true])
            ->assertCookie($recaller);
    }

    public function test_login_from_an_unknown_origin_is_refused(): void
    {
        User::factory()->create(['email' => 'a@example.com', 'password' => 'secret-pass']);

        $this->withHeader('Origin', 'https://evil.example')
            ->postJson('/v1/auth/login', ['login' => 'a@example.com', 'password' => 'secret-pass'])
            ->assertForbidden();

        $this->postJson('/v1/auth/login', ['login' => 'a@example.com', 'password' => 'secret-pass'])
            ->assertForbidden();

        $this->assertGuest('web');
    }

    public function test_bearer_tokens_are_not_accepted(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('legacy')->plainTextToken;

        $this->withToken($token)->getJson('/v1/auth/me')->assertUnauthorized();
    }

    public function test_session_endpoint_reports_the_signed_in_user_without_401_for_guests(): void
    {
        $this->fromStorefront()->getJson('/v1/auth/session')
            ->assertOk()
            ->assertJson(['authenticated' => false, 'user' => null]);

        $user = User::factory()->create(['email' => 's@example.com', 'password' => 'secret-pass']);
        $this->fromStorefront()->postJson('/v1/auth/login', ['login' => 's@example.com', 'password' => 'secret-pass']);

        $this->fromStorefront()->getJson('/v1/auth/session')
            ->assertOk()
            ->assertJsonPath('authenticated', true)
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_logout_ends_the_session(): void
    {
        User::factory()->create(['email' => 'a@example.com', 'password' => 'secret-pass']);

        $this->fromStorefront()->postJson('/v1/auth/login', ['login' => 'a@example.com', 'password' => 'secret-pass']);
        $this->fromStorefront()->getJson('/v1/auth/me')->assertOk()->assertJsonPath('data.email', 'a@example.com');

        $this->fromStorefront()->postJson('/v1/auth/logout')->assertOk();

        $this->assertGuest('web');
        $this->app['auth']->forgetGuards();
        $this->fromStorefront()->getJson('/v1/auth/me')->assertUnauthorized();
    }

    public function test_revoking_sessions_deletes_stored_sessions_and_rotates_remember_token(): void
    {
        config(['session.driver' => 'database']);
        $user = User::factory()->create(['remember_token' => 'old-token']);
        $other = User::factory()->create();

        DB::table('sessions')->insert([
            ['id' => 'keep-me', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()],
            ['id' => 'drop-me', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()],
            ['id' => 'someone-else', 'user_id' => $other->id, 'payload' => '', 'last_activity' => time()],
        ]);

        UserSessions::revoke($user, 'keep-me');

        $this->assertSame(['keep-me', 'someone-else'], DB::table('sessions')->orderBy('id')->pluck('id')->all());
        $this->assertNotSame('old-token', $user->fresh()->remember_token);
    }

    public function test_password_reset_signs_the_user_out_everywhere(): void
    {
        config(['session.driver' => 'database']);
        $user = User::factory()->create(['email' => 'r@example.com']);
        DB::table('sessions')->insert(['id' => 'old', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);

        $token = Password::broker()->createToken($user);

        $this->fromStorefront()->postJson('/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'r@example.com',
            'password' => 'new-secret-pass',
            'password_confirmation' => 'new-secret-pass',
        ])->assertOk();

        $this->assertDatabaseMissing('sessions', ['id' => 'old']);
    }

    public function test_deactivated_users_cannot_login(): void
    {
        User::factory()->create(['email' => 'off@example.com', 'password' => 'secret-pass', 'is_active' => false]);

        $this->fromStorefront()->postJson('/v1/auth/login', ['login' => 'off@example.com', 'password' => 'secret-pass'])
            ->assertUnprocessable();
    }

    public function test_dashboard_login_is_restricted_to_staff(): void
    {
        User::factory()->create(['email' => 'c@example.com', 'password' => 'secret-pass']);
        User::factory()->manager()->create(['email' => 'm@example.com', 'password' => 'secret-pass']);

        $this->fromStorefront()->postJson('/v1/auth/dashboard/login', ['login' => 'c@example.com', 'password' => 'secret-pass'])
            ->assertUnprocessable();
        $this->fromStorefront()->postJson('/v1/auth/dashboard/login', ['login' => 'm@example.com', 'password' => 'secret-pass'])
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

            return str_starts_with($url, 'https://mangrove-collection.com/reset-password/?token=');
        });
    }

    public function test_unauthenticated_requests_get_json_401(): void
    {
        $this->get('/v1/auth/me')->assertUnauthorized()->assertJson(['message' => 'Unauthenticated.']);
    }
}
