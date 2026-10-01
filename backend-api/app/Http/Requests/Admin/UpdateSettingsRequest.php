<?php

namespace App\Http\Requests\Admin;

use App\Settings\SettingRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Body: { "settings": { "site_name": "...", "mail_port": 587, ... } }
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = ['settings' => ['required', 'array', 'min:1']];

        foreach (array_keys((array) $this->input('settings')) as $key) {
            if (is_string($key) && SettingRegistry::has($key)) {
                $rules["settings.{$key}"] = SettingRegistry::rulesFor($key);
            }
        }

        return $rules;
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach (array_keys((array) $this->input('settings')) as $key) {
                    if (! is_string($key) || ! SettingRegistry::has($key)) {
                        $validator->errors()->add("settings.{$key}", "Unknown setting [{$key}].");
                    }
                }
            },
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function settings(): array
    {
        return (array) $this->validated('settings');
    }
}
