<?php

namespace App\Http\Requests;

use App\Rules\PhoneNumber;
use App\Rules\SafeText;
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
            'label' => ['nullable', 'string', 'max:50', new SafeText],
            'name' => [$required, 'string', 'max:255', new SafeText],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => [$required, 'string', 'max:32', new PhoneNumber],
            'region' => ['nullable', 'string', 'max:255', new SafeText],
            'city' => ['nullable', 'string', 'max:255', new SafeText],
            'zone' => ['nullable', 'string', 'max:255', new SafeText],
            'landmark' => ['nullable', 'string', 'max:255', new SafeText],
            'full_address' => [$required, 'string', 'max:1000', new SafeText],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
