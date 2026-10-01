<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(SettingsService::class)->syncDefaults();
    }

    public function test_public_endpoint_exposes_seo_tags_but_never_secrets(): void
    {
        app(SettingsService::class)->update([
            'facebook_pixel_id' => '1234567890',
            'google_client_secret' => 'super-secret',
            'mail_password' => 'smtp-secret',
            'sms_api_key' => 'sms-secret',
        ]);

        $response = $this->getJson('/v1/settings')
            ->assertOk()
            ->assertJsonPath('data.facebook_pixel_id', '1234567890')
            ->assertJsonPath('data.site_name', 'Mangrove Collection');

        foreach (['google_client_secret', 'mail_password', 'mail_host', 'sms_api_key', 'sms_api_url'] as $key) {
            $response->assertJsonMissingPath("data.{$key}");
        }

        $this->assertStringNotContainsString('super-secret', $response->getContent());
    }

    public function test_admin_can_update_settings_and_secrets_are_encrypted_and_masked(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson('/v1/admin/settings', ['settings' => [
            'site_name' => 'Mangrove',
            'mail_mailer' => 'smtp',
            'mail_host' => 'smtp.mailgun.org',
            'mail_port' => 465,
            'mail_encryption' => 'ssl',
            'mail_password' => 'p@ss',
            'mail_from_address' => 'shop@mangrove-collection.com',
        ]])
            ->assertOk()
            ->assertJsonPath('data.general.site_name.value', 'Mangrove')
            ->assertJsonPath('data.mail.mail_password.value', SettingsService::SECRET_MASK);

        $stored = Setting::query()->where('key', 'mail_password')->value('value');
        $this->assertNotSame('p@ss', $stored);
        $this->assertSame('p@ss', Crypt::decryptString($stored));

        // Runtime config now reflects the DB values without any .env change.
        $this->assertSame('smtp', config('mail.default'));
        $this->assertSame('smtp.mailgun.org', config('mail.mailers.smtp.host'));
        $this->assertSame('smtps', config('mail.mailers.smtp.scheme'));
        $this->assertSame('shop@mangrove-collection.com', config('mail.from.address'));

        // Echoing the mask back must not overwrite the stored secret.
        $this->putJson('/v1/admin/settings', ['settings' => ['mail_password' => SettingsService::SECRET_MASK]])->assertOk();
        $this->assertSame('p@ss', app(SettingsService::class)->get('mail_password'));
    }

    public function test_unknown_keys_and_invalid_values_are_rejected(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson('/v1/admin/settings', ['settings' => [
            'not_a_setting' => 'x',
            'mail_port' => 'abc',
            'sms_driver' => 'carrier-pigeon',
        ]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['settings.not_a_setting', 'settings.mail_port', 'settings.sms_driver']);
    }

    public function test_sms_gateway_test_uses_database_credentials(): void
    {
        Http::fake(['sms.example.com/*' => Http::response(['ok' => true])]);
        Sanctum::actingAs(User::factory()->admin()->create());

        app(SettingsService::class)->update([
            'sms_driver' => 'http',
            'sms_api_url' => 'https://sms.example.com/api',
            'sms_api_key' => 'key-123',
            'sms_sender_id' => 'MANGROVE',
        ]);

        $this->postJson('/v1/admin/settings/test-sms', ['phone' => '01700000000'])->assertOk();

        Http::assertSent(fn ($request) => $request->url() === 'https://sms.example.com/api'
            && $request['api_key'] === 'key-123'
            && $request['number'] === '01700000000'
            && $request['senderid'] === 'MANGROVE');
    }
}
