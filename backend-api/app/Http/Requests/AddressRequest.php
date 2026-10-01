<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
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
            'label' => ['nullable', 'string', 'max:50'],
            'name' => [$required, 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => [$required, 'string', 'max:32'],
            'region' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'zone' => ['nullable', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'full_address' => [$required, 'string', 'max:1000'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
