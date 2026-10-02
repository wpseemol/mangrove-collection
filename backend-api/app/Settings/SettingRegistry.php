<?php

namespace App\Settings;

use App\Rules\SafeText;
use App\Rules\SafeUrl;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * The single source of truth for every runtime-configurable setting.
 * Keys not declared here are rejected on update.
 *
 * type:      string | text | boolean | integer | float | json | email | url
 * public:    exposed via the unauthenticated /v1/settings endpoint
 * encrypted: stored encrypted at rest and masked in admin responses
 * raw:       intentionally holds markup/scripts (admin-only), so SafeText is skipped
 */
final class SettingRegistry
{
    /**
     * @return array<string, array<string, array{type: string, public?: bool, encrypted?: bool, raw?: bool, default?: mixed, options?: list<string>}>>
     */
    public static function groups(): array
    {
        return [
            'general' => [
                'site_name' => ['type' => 'string', 'public' => true, 'default' => 'Mangrove Collection'],
                'site_tagline' => ['type' => 'string', 'public' => true, 'default' => null],
                'site_logo' => ['type' => 'url', 'public' => true, 'default' => null],
                'site_favicon' => ['type' => 'url', 'public' => true, 'default' => null],
                'contact_email' => ['type' => 'email', 'public' => true, 'default' => null],
                'contact_phone' => ['type' => 'string', 'public' => true, 'default' => null],
                'contact_address' => ['type' => 'text', 'public' => true, 'default' => null],
                'social_links' => ['type' => 'json', 'public' => true, 'default' => []],
                'storefront_url' => ['type' => 'url', 'public' => true, 'default' => 'http://mangrove-collection.com'],
                'dashboard_url' => ['type' => 'url', 'public' => false, 'default' => 'https://dashboard.mangrove-collection.com'],
            ],

            'commerce' => [
                'currency' => ['type' => 'string', 'public' => true, 'default' => 'BDT'],
                'currency_symbol' => ['type' => 'string', 'public' => true, 'default' => '৳'],
                'payment_methods' => ['type' => 'json', 'public' => true, 'default' => ['cod']],
                'bkash_number' => ['type' => 'string', 'public' => true, 'default' => null],
                'nagad_number' => ['type' => 'string', 'public' => true, 'default' => null],
                'rocket_number' => ['type' => 'string', 'public' => true, 'default' => null],
                'free_shipping_threshold' => ['type' => 'float', 'public' => true, 'default' => null],
                'low_stock_threshold' => ['type' => 'integer', 'public' => false, 'default' => 5],
                'order_notification_email' => ['type' => 'email', 'public' => false, 'default' => null],
            ],

            'google' => [
                'google_login_enabled' => ['type' => 'boolean', 'public' => true, 'default' => false],
                'google_client_id' => ['type' => 'string', 'public' => true, 'default' => null],
                'google_client_secret' => ['type' => 'string', 'encrypted' => true, 'default' => null],
                'google_redirect_uri' => ['type' => 'url', 'public' => false, 'default' => null],
            ],

            'mail' => [
                'mail_mailer' => ['type' => 'string', 'default' => 'log', 'options' => ['smtp', 'log']],
                'mail_host' => ['type' => 'string', 'default' => null],
                'mail_port' => ['type' => 'integer', 'default' => 587],
                'mail_username' => ['type' => 'string', 'default' => null],
                'mail_password' => ['type' => 'string', 'encrypted' => true, 'default' => null],
                'mail_encryption' => ['type' => 'string', 'default' => 'tls', 'options' => ['tls', 'ssl', 'none']],
                'mail_from_address' => ['type' => 'email', 'default' => null],
                'mail_from_name' => ['type' => 'string', 'default' => 'Mangrove Collection'],
            ],

            'sms' => [
                'sms_enabled' => ['type' => 'boolean', 'default' => false],
                'sms_driver' => ['type' => 'string', 'default' => 'log', 'options' => ['http', 'log']],
                'sms_api_url' => ['type' => 'url', 'default' => null],
                'sms_api_key' => ['type' => 'string', 'encrypted' => true, 'default' => null],
                'sms_sender_id' => ['type' => 'string', 'default' => null],
                'sms_order_placed_template' => [
                    'type' => 'text',
                    'default' => 'Dear {name}, your order {order_number} of {currency} {total} has been placed. Thank you for shopping with Mangrove Collection.',
                ],
                'sms_order_status_template' => [
                    'type' => 'text',
                    'default' => 'Dear {name}, your order {order_number} is now {status}. - Mangrove Collection',
                ],
            ],

            'seo' => [
                'meta_title' => ['type' => 'string', 'public' => true, 'default' => 'Mangrove Collection'],
                'meta_description' => ['type' => 'text', 'public' => true, 'default' => null],
                'meta_keywords' => ['type' => 'text', 'public' => true, 'default' => null],
                'og_image' => ['type' => 'url', 'public' => true, 'default' => null],
                'google_site_verification' => ['type' => 'string', 'public' => true, 'default' => null],
                'google_analytics_id' => ['type' => 'string', 'public' => true, 'default' => null],
                'google_tag_manager_id' => ['type' => 'string', 'public' => true, 'default' => null],
                'facebook_pixel_id' => ['type' => 'string', 'public' => true, 'default' => null],
                'custom_head_script' => ['type' => 'text', 'public' => true, 'raw' => true, 'default' => null],
                'custom_body_script' => ['type' => 'text', 'public' => true, 'raw' => true, 'default' => null],
            ],
        ];
    }

    /**
     * @return array<string, array{group: string, type: string, public: bool, encrypted: bool, raw: bool, default: mixed, options: list<string>|null}>
     */
    public static function all(): array
    {
        $flat = [];

        foreach (self::groups() as $group => $definitions) {
            foreach ($definitions as $key => $definition) {
                $flat[$key] = [
                    'group' => $group,
                    'type' => $definition['type'],
                    'public' => $definition['public'] ?? false,
                    'encrypted' => $definition['encrypted'] ?? false,
                    'raw' => $definition['raw'] ?? false,
                    'default' => $definition['default'] ?? null,
                    'options' => $definition['options'] ?? null,
                ];
            }
        }

        return $flat;
    }

    public static function has(string $key): bool
    {
        return array_key_exists($key, self::all());
    }

    /**
     * @return array{group: string, type: string, public: bool, encrypted: bool, raw: bool, default: mixed, options: list<string>|null}|null
     */
    public static function get(string $key): ?array
    {
        return self::all()[$key] ?? null;
    }

    /**
     * @return list<string|ValidationRule>
     */
    public static function rulesFor(string $key): array
    {
        $definition = self::get($key);

        $rules = match ($definition['type']) {
            'boolean' => ['boolean'],
            'integer' => ['integer'],
            'float' => ['numeric'],
            'json' => ['array', 'max:50'],
            'email' => ['email', 'max:255'],
            'url' => ['url:http,https', 'max:2048', new SafeUrl],
            'text' => ['string', 'max:65000'],
            default => ['string', 'max:2048'],
        };

        // Secrets (passwords, API keys) and admin scripts may legitimately contain any character.
        if (in_array($definition['type'], ['string', 'text', 'json'], true) && ! $definition['encrypted'] && ! $definition['raw']) {
            $rules[] = new SafeText;
        }

        if ($definition['options']) {
            $rules[] = 'in:'.implode(',', $definition['options']);
        }

        return ['nullable', ...$rules];
    }
}
