<?php

namespace App\Services;

use App\Models\Setting;
use App\Settings\SettingRegistry;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Throwable;

class SettingsService
{
    public const CACHE_KEY = 'app.settings';

    public const SECRET_MASK = '********';

    /**
     * Raw rows keyed by setting key, as stored (encrypted values stay encrypted).
     *
     * @var array<string, array{value: string|null}>|null
     */
    protected ?array $rows = null;

    public function get(string $key, mixed $fallback = null): mixed
    {
        $definition = SettingRegistry::get($key);

        if ($definition === null) {
            return $fallback;
        }

        $rows = $this->rows();

        if (! array_key_exists($key, $rows) || $rows[$key]['value'] === null) {
            return $definition['default'] ?? $fallback;
        }

        $raw = $rows[$key]['value'];

        if ($definition['encrypted']) {
            try {
                $raw = Crypt::decryptString($raw);
            } catch (DecryptException) {
                return $fallback;
            }
        }

        return $this->cast($raw, $definition['type']);
    }

    public function filled(string $key): bool
    {
        return filled($this->get($key));
    }

    /**
     * Decrypted value of a secret for an admin who re-entered their password; null when nothing is saved.
     */
    public function reveal(string $key): ?string
    {
        $value = $this->get($key);

        return filled($value) ? (string) $value : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function public(): array
    {
        $values = [];

        foreach (SettingRegistry::all() as $key => $definition) {
            if ($definition['public']) {
                $values[$key] = $this->get($key);
            }
        }

        return $values;
    }

    /**
     * Grouped settings for the admin dashboard; secrets are masked.
     *
     * @return array<string, array<string, array<string, mixed>>>
     */
    public function forAdmin(): array
    {
        $grouped = [];

        foreach (SettingRegistry::all() as $key => $definition) {
            $value = $this->get($key);

            if ($definition['encrypted']) {
                $value = filled($value) ? self::SECRET_MASK : null;
            }

            $grouped[$definition['group']][$key] = [
                'value' => $value,
                'type' => $definition['type'],
                'public' => $definition['public'],
                'secret' => $definition['encrypted'],
                'options' => $definition['options'],
            ];
        }

        return $grouped;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    public function update(array $values): void
    {
        DB::transaction(function () use ($values) {
            foreach ($values as $key => $value) {
                $definition = SettingRegistry::get($key);

                if ($definition === null) {
                    continue;
                }

                // The dashboard echoes the mask back for untouched secrets.
                if ($definition['encrypted'] && $value === self::SECRET_MASK) {
                    continue;
                }

                Setting::query()->updateOrCreate(['key' => $key], [
                    'group' => $definition['group'],
                    'type' => $definition['type'],
                    'is_public' => $definition['public'],
                    'is_encrypted' => $definition['encrypted'],
                    'value' => $this->serialize($value, $definition),
                ]);
            }
        });

        $this->flush();
        $this->applyRuntimeConfig();
    }

    /**
     * Insert any registry keys missing from the table without touching existing values.
     */
    public function syncDefaults(): void
    {
        $existing = Setting::query()->pluck('key')->all();

        foreach (SettingRegistry::all() as $key => $definition) {
            if (in_array($key, $existing, true)) {
                continue;
            }

            Setting::query()->create([
                'key' => $key,
                'group' => $definition['group'],
                'type' => $definition['type'],
                'is_public' => $definition['public'],
                'is_encrypted' => $definition['encrypted'],
                'value' => $this->serialize($definition['default'], $definition),
            ]);
        }

        $this->flush();
    }

    public function flush(): void
    {
        $this->rows = null;
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Push DB-backed credentials into Laravel's config so Socialite, the mailer,
     * etc. pick them up without any .env changes.
     */
    public function applyRuntimeConfig(): void
    {
        try {
            $this->rows();
        } catch (Throwable) {
            // Settings table not migrated yet (fresh install / during migrations).
            return;
        }

        config([
            'services.google.client_id' => $this->get('google_client_id'),
            'services.google.client_secret' => $this->get('google_client_secret'),
            'services.google.redirect' => $this->get('google_redirect_uri'),
        ]);

        if ($this->get('mail_mailer') === 'smtp' && $this->filled('mail_host')) {
            $encryption = $this->get('mail_encryption');

            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $this->get('mail_host'),
                'mail.mailers.smtp.port' => $this->get('mail_port'),
                'mail.mailers.smtp.username' => $this->get('mail_username'),
                'mail.mailers.smtp.password' => $this->get('mail_password'),
                'mail.mailers.smtp.scheme' => $encryption === 'ssl' ? 'smtps' : 'smtp',
            ]);
        }

        if ($this->filled('mail_from_address')) {
            config([
                'mail.from.address' => $this->get('mail_from_address'),
                'mail.from.name' => $this->get('mail_from_name'),
            ]);
        }

        if (app()->resolved('mail.manager')) {
            app('mail.manager')->forgetMailers();
        }
    }

    /**
     * @return array<string, array{value: string|null}>
     */
    protected function rows(): array
    {
        return $this->rows ??= Cache::rememberForever(self::CACHE_KEY, fn () => Setting::query()
            ->get(['key', 'value'])
            ->mapWithKeys(fn (Setting $setting) => [$setting->key => ['value' => $setting->value]])
            ->all());
    }

    protected function cast(string $raw, string $type): mixed
    {
        return match ($type) {
            'boolean' => filter_var($raw, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $raw,
            'float' => (float) $raw,
            'json' => json_decode($raw, true),
            default => $raw,
        };
    }

    /**
     * @param  array{type: string, encrypted: bool}  $definition
     */
    protected function serialize(mixed $value, array $definition): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $string = match ($definition['type']) {
            'boolean' => $value ? '1' : '0',
            'json' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            default => (string) $value,
        };

        return $definition['encrypted'] ? Crypt::encryptString($string) : $string;
    }
}
