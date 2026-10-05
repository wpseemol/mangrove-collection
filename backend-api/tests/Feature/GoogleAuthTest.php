<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_503_when_google_is_not_configured(): void
    {
        $this->postJson('/v1/auth/google', ['access_token' => 'x'])->assertStatus(503);
    }

    public function test_google_credentials_are_loaded_from_the_database(): void
    {
        $this->configureGoogle();

        $this->assertSame('client-123', config('services.google.client_id'));
        $this->assertSame('secret-xyz', config('services.google.client_secret'));
    }

    public function test_google_access_token_creates_and_logs_in_a_user(): void
    {
        $this->configureGoogle();
        $this->mockGoogleUser('g-1', 'new@gmail.com');

        $this->fromStorefront()->postJson('/v1/auth/google', ['access_token' => 'valid-token'])
            ->assertOk()
            ->assertJsonMissingPath('token')
            ->assertJsonPath('user.email', 'new@gmail.com')
            ->assertJsonPath('user.google_linked', true);

        $this->assertDatabaseHas('users', ['email' => 'new@gmail.com', 'google_id' => 'g-1']);
    }

    public function test_google_login_links_existing_account_by_email(): void
    {
        $this->configureGoogle();
        $existing = User::factory()->create(['email' => 'old@gmail.com']);
        $this->mockGoogleUser('g-2', 'old@gmail.com');

        $this->fromStorefront()->postJson('/v1/auth/google', ['access_token' => 'valid-token'])
            ->assertOk()
            ->assertJsonPath('user.id', $existing->id);

        $this->assertSame('g-2', $existing->fresh()->google_id);
    }

    protected function configureGoogle(): void
    {
        app(SettingsService::class)->update([
            'google_login_enabled' => true,
            'google_client_id' => 'client-123',
            'google_client_secret' => 'secret-xyz',
            'google_redirect_uri' => 'http://localhost:3000/auth/google/callback',
        ]);
    }

    protected function mockGoogleUser(string $id, string $email): void
    {
        $user = (new SocialiteUser)->setRaw(['email_verified' => true])->map([
            'id' => $id,
            'name' => 'Google User',
            'email' => $email,
            'avatar' => 'https://lh3.googleusercontent.com/a.png',
        ]);

        Http::fake(['oauth2.googleapis.com/tokeninfo*' => Http::response(['aud' => 'client-123', 'azp' => 'client-123'])]);

        $provider = Mockery::mock(GoogleProvider::class);
        $provider->shouldReceive('userFromToken')->with('valid-token')->andReturn($user);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }
}
