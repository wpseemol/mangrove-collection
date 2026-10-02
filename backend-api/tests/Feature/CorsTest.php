<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CorsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Same shape as CORS_ALLOWED_ORIGINS in production plus the local dev servers.
        config(['cors.allowed_origins' => [
            'https://mangrove-collection.com',
            'https://dashboard.mangrove-collection.com',
            'http://localhost:3000',
            'http://localhost:5173',
        ]]);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function allowedOrigins(): array
    {
        return [
            'storefront' => ['https://mangrove-collection.com'],
            'dashboard' => ['https://dashboard.mangrove-collection.com'],
            'next dev' => ['http://localhost:3000'],
            'vite dev' => ['http://localhost:5173'],
        ];
    }

    #[DataProvider('allowedOrigins')]
    public function test_allowed_origins_receive_credentialed_cors_headers(string $origin): void
    {
        $this->withHeaders(['Origin' => $origin])
            ->getJson('/v1/settings')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', $origin)
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    #[DataProvider('allowedOrigins')]
    public function test_preflight_allows_the_csrf_header(string $origin): void
    {
        $response = $this->withHeaders([
            'Origin' => $origin,
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'x-xsrf-token,content-type',
        ])->options('/v1/auth/login')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', $origin)
            ->assertHeader('Access-Control-Allow-Credentials', 'true');

        $this->assertStringContainsStringIgnoringCase('x-xsrf-token', (string) $response->headers->get('Access-Control-Allow-Headers'));
    }

    public function test_unknown_origins_are_not_allowed(): void
    {
        foreach (['https://evil.example.com', 'https://mangrove-collection.com.evil.io', 'http://mangrove-collection.com', 'http://localhost:8080'] as $origin) {
            $response = $this->withHeaders(['Origin' => $origin])->getJson('/v1/settings');

            $this->assertNotEquals($origin, $response->headers->get('Access-Control-Allow-Origin'));
        }
    }
}
