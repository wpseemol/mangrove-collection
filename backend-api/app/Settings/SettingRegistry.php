<?php

namespace App\Settings;

use App\Rules\MessengerPage;
use App\Rules\PhoneNumber;
use App\Rules\SafeText;
use App\Rules\SafeUrl;
use App\Rules\WhatsAppNumber;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * The single source of truth for every runtime-configurable setting.
 * Keys not declared here are rejected on update.
 *
 * type:      string | text | boolean | integer | float | json | email | url | phone
 * public:    exposed via the unauthenticated /v1/settings endpoint
 * encrypted: stored encrypted at rest and masked in admin responses
 * raw:       intentionally holds markup/scripts (admin-only), so SafeText is skipped
 * rules:     extra validation rules for the value, on top of the type's rules
 * each:      validation rules for every item of a json value
 */
final class SettingRegistry
{
    public const SOCIAL_NETWORKS = ['facebook', 'instagram', 'youtube', 'linkedin', 'twitter'];

    /**
     * @return array<string, array<string, array{type: string, public?: bool, encrypted?: bool, raw?: bool, default?: mixed, options?: list<string>, rules?: list<string|ValidationRule>, each?: list<string|ValidationRule>}>>
     */
    public static function groups(): array
    {
        return [
            'general' => [
                'site_name' => ['type' => 'string', 'public' => true, 'default' => 'Mangrove Collection', 'rules' => ['max:100']],
                'site_tagline' => ['type' => 'string', 'public' => true, 'default' => null, 'rules' => ['max:160']],
                'site_logo' => ['type' => 'url', 'public' => true, 'default' => null],
                'site_favicon' => ['type' => 'url', 'public' => true, 'default' => null],
                'contact_email' => ['type' => 'email', 'public' => true, 'default' => null],
                'contact_phone' => ['type' => 'phone', 'public' => true, 'default' => null],
                'contact_address' => ['type' => 'text', 'public' => true, 'default' => null, 'rules' => ['max:500']],
                'social_links' => [
                    'type' => 'json',
                    'public' => true,
                    'default' => [],
                    'rules' => ['array:'.implode(',', self::SOCIAL_NETWORKS)],
                    'each' => ['nullable', 'string', 'max:2048', new SafeUrl],
                ],
                'storefront_url' => ['type' => 'url', 'public' => true, 'default' => 'https://mangrove-collection.com'],
                'dashboard_url' => ['type' => 'url', 'public' => false, 'default' => 'https://dashboard.mangrove-collection.com'],
            ],

            // Floating chat button shown on every storefront page, plus the contact page and footer links.
            'whatsapp' => [
                'whatsapp_number' => ['type' => 'phone', 'public' => true, 'default' => null, 'rules' => [new WhatsAppNumber]],
                'whatsapp_message' => [
                    'type' => 'text',
                    'public' => true,
                    'default' => 'Hello Mangrove Collection! I would like to know more about your products.',
                    'rules' => ['max:500'],
                ],
                'whatsapp_button_enabled' => ['type' => 'boolean', 'public' => true, 'default' => true],
                'whatsapp_button_position' => ['type' => 'string', 'public' => true, 'default' => 'right', 'options' => ['right', 'left']],
                'messenger_page' => ['type' => 'string', 'public' => true, 'default' => null, 'rules' => ['max:50', new MessengerPage]],
                'messenger_button_enabled' => ['type' => 'boolean', 'public' => true, 'default' => false],
            ],

            'commerce' => [
                'currency' => ['type' => 'string', 'public' => true, 'default' => 'BDT', 'rules' => ['max:10']],
                'currency_symbol' => ['type' => 'string', 'public' => true, 'default' => '৳', 'rules' => ['max:5']],
                // bKash / Nagad / Rocket accounts live in the payment_accounts table.
                'cod_enabled' => ['type' => 'boolean', 'public' => true, 'default' => true],
                'free_shipping_threshold' => ['type' => 'float', 'public' => true, 'default' => null, 'rules' => ['min:0', 'max:10000000']],
                'low_stock_threshold' => ['type' => 'integer', 'public' => false, 'default' => 5, 'rules' => ['min:0', 'max:100000']],
                'order_notification_email' => ['type' => 'email', 'public' => false, 'default' => null],
            ],

            // Customer sign-in methods. Staff can always use email and password, so the dashboard never locks itself out.
            'login' => [
                'password_login_enabled' => ['type' => 'boolean', 'public' => true, 'default' => true],
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
                'mail_port' => ['type' => 'integer', 'default' => 587, 'rules' => ['between:1,65535']],
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
                'sms_payment_verified_template' => [
                    'type' => 'text',
                    'default' => 'Dear {name}, we received your {method} payment of {currency} {amount} for order {order_number}. Thank you! - Mangrove Collection',
                ],
                'sms_payment_rejected_template' => [
                    'type' => 'text',
                    'default' => 'Dear {name}, we could not verify your {method} payment for order {order_number}: {reason}. Please submit the correct transaction ID. - Mangrove Collection',
                ],
            ],

            'seo' => [
                'meta_title' => ['type' => 'string', 'public' => true, 'default' => 'Mangrove Collection', 'rules' => ['max:255']],
                'meta_description' => ['type' => 'text', 'public' => true, 'default' => null, 'rules' => ['max:500']],
                'meta_keywords' => ['type' => 'text', 'public' => true, 'default' => null, 'rules' => ['max:500']],
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
     * @return array<string, array{group: string, type: string, public: bool, encrypted: bool, raw: bool, default: mixed, options: list<string>|null, rules: list<string|ValidationRule>, each: list<string|ValidationRule>|null}>
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
                    'rules' => $definition['rules'] ?? [],
                    'each' => $definition['each'] ?? null,
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
     * @return list<string>
     */
    public static function secretKeys(): array
    {
        return array_keys(array_filter(self::all(), fn (array $definition) => $definition['encrypted']));
    }

    /**
     * @return array{group: string, type: string, public: bool, encrypted: bool, raw: bool, default: mixed, options: list<string>|null, rules: list<string|ValidationRule>, each: list<string|ValidationRule>|null}|null
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
            'phone' => ['string', 'max:32', new PhoneNumber],
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

        return ['nullable', ...$rules, ...$definition['rules']];
    }

    /**
     * Rules for every item of a json setting (`settings.{key}.*`), or null when unconstrained.
     *
     * @return list<string|ValidationRule>|null
     */
    public static function itemRulesFor(string $key): ?array
    {
        return self::get($key)['each'] ?? null;
    }
}
