<?php

namespace App\Http\Requests\Admin;

use App\Enums\PaymentAccountType;
use App\Enums\PaymentMethod;
use App\Models\PaymentAccount;
use App\Rules\SafeText;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentAccountRequest extends FormRequest
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

        /** @var PaymentAccount|null $account */
        $account = $this->route('payment_account');
        $method = $this->input('method', $account?->method->value);

        // bKash and Nagad wallets are 11-digit BD mobile numbers; Rocket adds a 12th check digit.
        $numberPattern = $method === PaymentMethod::Rocket->value ? '/^01[3-9]\d{8}\d?$/' : '/^01[3-9]\d{8}$/';

        return [
            'method' => [$required, Rule::in(PaymentMethod::walletValues())],
            'account_type' => [$required, Rule::enum(PaymentAccountType::class)],
            'account_number' => [
                $required, 'string', "regex:{$numberPattern}",
                Rule::unique('payment_accounts', 'account_number')->where('method', $method)->ignore($account),
            ],
            'account_name' => ['nullable', 'string', 'max:100', new SafeText],
            'instructions' => ['nullable', 'string', 'max:1000', new SafeText],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'account_number.regex' => 'Enter the wallet number as an 11-digit mobile number, e.g. 01712345678 (Rocket may have a 12th digit).',
            'account_number.unique' => 'This number is already added for this wallet.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($number = $this->input('account_number'))) {
            $digits = (string) preg_replace('/[\s\-().]/', '', $number);

            $this->merge(['account_number' => preg_replace('/^(\+?88)(?=01)/', '', $digits)]);
        }
    }
}
