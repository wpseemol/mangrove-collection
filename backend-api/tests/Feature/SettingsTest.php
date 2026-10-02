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

    public function test_whatsapp_button_settings_are_public_and_editable(): void
    {
        $this->getJson('/v1/settings')
            ->assertOk()
            ->assertJsonPath('data.whatsapp_number', null)
            ->assertJsonPath('data.whatsapp_button_enabled', true)
            ->assertJsonPath('data.whatsapp_button_position', 'right');

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson('/v1/admin/settings', ['settings' => [
            'whatsapp_number' => '+880 1712-345678',
            'whatsapp_message' => 'Hi! I want to order honey.',
            'whatsapp_button_enabled' => false,
            'whatsapp_button_position' => 'left',
        ]])
            ->assertOk()
            ->assertJsonPath('data.whatsapp.whatsapp_number.value', '+880 1712-345678');

        $this->getJson('/v1/settings')
            ->assertJsonPath('data.whatsapp_number', '+880 1712-345678')
            ->assertJsonPath('data.whatsapp_message', 'Hi! I want to order honey.')
            ->assertJsonPath('data.whatsapp_button_enabled', false)
            ->assertJsonPath('data.whatsapp_button_position', 'left');
    }

    public function test_whatsapp_number_must_be_international(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['01712345678', 'call me', '+0 1712', '+88017123456789012'] as $number) {
            $this->putJson('/v1/admin/settings', ['settings' => ['whatsapp_number' => $number]])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('settings.whatsapp_number');
        }

        $this->putJson('/v1/admin/settings', ['settings' => [
            'whatsapp_message' => '<script>alert(1)</script>',
            'whatsapp_button_position' => 'center',
        ]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['settings.whatsapp_message', 'settings.whatsapp_button_position']);
    }

    public function test_social_links_and_payment_methods_are_strictly_validated(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson('/v1/admin/settings', ['settings' => [
            'social_links' => ['facebook' => 'javascript:alert(1)', 'myspace' => 'https://myspace.com/x'],
            'payment_methods' => ['cod', 'paypal'],
            'contact_phone' => 'not a phone',
        ]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['settings.social_links', 'settings.social_links.facebook', 'settings.payment_methods.1', 'settings.contact_phone']);

        $this->putJson('/v1/admin/settings', ['settings' => [
            'social_links' => ['facebook' => 'https://facebook.com/mangrove', 'youtube' => 'https://youtube.com/@mangrove'],
            'payment_methods' => ['cod', 'bkash'],
            'contact_phone' => '+880 1712-345678',
        ]])->assertOk();

        $this->getJson('/v1/settings')
            ->assertJsonPath('data.social_links.facebook', 'https://facebook.com/mangrove')
            ->assertJsonPath('data.payment_methods', ['cod', 'bkash']);
    }

    public function test_only_admins_can_read_or_change_settings(): void
    {
        Sanctum::actingAs(User::factory()->manager()->create());

        $this->getJson('/v1/admin/settings')->assertForbidden();
        $this->putJson('/v1/admin/settings', ['settings' => ['site_name' => 'Hacked']])->assertForbidden();

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/v1/admin/settings')->assertForbidden();

        $this->assertSame('Mangrove Collection', app(SettingsService::class)->get('site_name'));
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
