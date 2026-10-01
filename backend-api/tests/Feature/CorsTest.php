<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CorsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{string}>
     */
    public static function allowedOrigins(): array
    {
        return [
            'storefront' => ['http://mangrove-collection.com'],
            'dashboard' => ['https://dashboard.mangrove-collection.com'],
            'next dev' => ['http://localhost:3000'],
            'vite dev' => ['http://localhost:5173'],
        ];
    }

    #[DataProvider('allowedOrigins')]
    public function test_allowed_origins_receive_cors_headers(string $origin): void
    {
        $this->withHeaders(['Origin' => $origin])
            ->getJson('/v1/settings')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }

    #[DataProvider('allowedOrigins')]
    public function test_preflight_succeeds_for_allowed_origins(string $origin): void
    {
        $this->withHeaders([
            'Origin' => $origin,
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'authorization,content-type',
        ])->options('/v1/auth/login')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }

    public function test_unknown_origins_are_not_allowed(): void
    {
        foreach (['https://evil.example.com', 'https://mangrove-collection.com.evil.io', 'http://localhost:8080'] as $origin) {
            $response = $this->withHeaders(['Origin' => $origin])->getJson('/v1/settings');

            $this->assertNotEquals($origin, $response->headers->get('Access-Control-Allow-Origin'));
        }
    }
}
