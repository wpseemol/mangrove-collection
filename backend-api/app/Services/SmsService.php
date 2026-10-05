<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class SmsService
{
    public function __construct(protected SettingsService $settings) {}

    public function enabled(): bool
    {
        return (bool) $this->settings->get('sms_enabled');
    }

    /**
     * Sends through the configured gateway. The `http` driver posts form fields
     * `api_key`, `senderid`, `number` and `message` (BulkSMSBD-compatible).
     *
     * @throws RuntimeException when the gateway is misconfigured or rejects the request
     */
    public function send(string $phone, string $message): void
    {
        $driver = $this->settings->get('sms_driver');

        if ($driver !== 'http') {
            Log::info('SMS (log driver)', ['to' => $phone, 'message' => $message]);

            return;
        }

        $url = $this->settings->get('sms_api_url');
        $apiKey = $this->settings->get('sms_api_key');

        if (blank($url) || blank($apiKey)) {
            throw new RuntimeException('SMS gateway URL or API key is not configured.');
        }

        $response = Http::asForm()->timeout(15)->post($url, [
            'api_key' => $apiKey,
            'senderid' => $this->settings->get('sms_sender_id'),
            'number' => $phone,
            'message' => $message,
        ]);

        if ($response->failed()) {
            throw new RuntimeException("SMS gateway responded with HTTP {$response->status()}.");
        }
    }

    /**
     * @param  array<string, string|int|float|null>  $replacements
     */
    public function render(string $templateKey, array $replacements): string
    {
        $template = (string) $this->settings->get($templateKey, '');

        return strtr($template, collect($replacements)
            ->mapWithKeys(fn ($value, $key) => ['{'.$key.'}' => (string) $value])
            ->all());
    }
}
