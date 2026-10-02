<?php

namespace App\Http\Requests\Admin;

use App\Enums\BannerType;
use App\Rules\SafeText;
use App\Rules\SafeUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'type' => [$required, Rule::enum(BannerType::class)],
            'title' => ['nullable', 'string', 'max:255', new SafeText],
            'subtitle' => ['nullable', 'string', 'max:255', new SafeText],
            'image' => [$required, 'string', 'max:2048', new SafeUrl],
            'link_url' => ['nullable', 'string', 'max:2048', new SafeUrl(allowRelative: true)],
            'link_enabled' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ];
    }
}
