<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Models\Address;
use App\Rules\PhoneNumber;
use App\Rules\SafeText;
use App\Rules\TransactionId;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CheckoutRequest extends FormRequest
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
        $usingSavedAddress = $this->filled('address_id');

        return [
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.variant_id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],

            'shipping_method_id' => ['required', 'integer'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            ...$this->walletRules(),
            'customer_note' => ['nullable', 'string', 'max:1000', new SafeText],

            'address_id' => ['nullable', 'integer'],
            'address' => [$usingSavedAddress ? 'nullable' : 'required', 'array'],
            'address.name' => [$usingSavedAddress ? 'nullable' : 'required', 'string', 'max:255', new SafeText],
            'address.email' => ['nullable', 'email', 'max:255'],
            'address.phone' => [$usingSavedAddress ? 'nullable' : 'required', 'string', 'max:32', new PhoneNumber],
            'address.region' => ['nullable', 'string', 'max:255', new SafeText],
            'address.city' => ['nullable', 'string', 'max:255', new SafeText],
            'address.zone' => ['nullable', 'string', 'max:255', new SafeText],
            'address.landmark' => ['nullable', 'string', 'max:255', new SafeText],
            'address.full_address' => [$usingSavedAddress ? 'nullable' : 'required', 'string', 'max:1000', new SafeText],
            'save_address' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, list<mixed>>
     */
    protected function walletRules(): array
    {
        $wallet = PaymentMethod::tryFrom((string) $this->input('payment_method'))?->isWallet() ?? false;
        $required = $wallet ? 'required' : 'nullable';

        return [
            'payment_account_id' => ['nullable', 'integer'],
            'transaction_id' => [$required, 'string', new TransactionId],
            'payment_sender_number' => [$required, 'string', 'max:32', new PhoneNumber],
        ];
    }

    protected function prepareForValidation(): void
    {
        $wallet = PaymentMethod::tryFrom((string) $this->input('payment_method'))?->isWallet() ?? false;

        if (! $wallet) {
            $this->merge(['payment_account_id' => null, 'transaction_id' => null, 'payment_sender_number' => null]);

            return;
        }

        $this->merge([
            'transaction_id' => TransactionId::normalize($this->input('transaction_id')),
            'payment_sender_number' => is_string($this->input('payment_sender_number')) ? trim($this->input('payment_sender_number')) : $this->input('payment_sender_number'),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'items.*.variant_id' => 'product',
            'items.*.quantity' => 'quantity',
            'shipping_method_id' => 'delivery method',
            'payment_account_id' => 'payment account',
            'transaction_id' => 'transaction ID',
            'payment_sender_number' => 'sender number',
            'address.name' => 'name',
            'address.email' => 'email',
            'address.phone' => 'phone number',
            'address.region' => 'division',
            'address.city' => 'district / city',
            'address.zone' => 'area',
            'address.landmark' => 'landmark',
            'address.full_address' => 'full address',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->filled('address_id') && ! $this->savedAddress()) {
                    $validator->errors()->add('address_id', 'The selected address is invalid.');
                }
            },
        ];
    }

    public function savedAddress(): ?Address
    {
        $user = $this->user('sanctum');

        if (! $user || ! $this->filled('address_id')) {
            return null;
        }

        return $user->addresses()->find($this->integer('address_id'));
    }

    /**
     * @return array<string, string|null>
     */
    public function shippingAddress(): array
    {
        if ($address = $this->savedAddress()) {
            return $address->toShippingArray();
        }

        $address = (array) $this->validated('address');

        return [
            'name' => $address['name'],
            'email' => $address['email'] ?? null,
            'phone' => $address['phone'],
            'region' => $address['region'] ?? null,
            'city' => $address['city'] ?? null,
            'zone' => $address['zone'] ?? null,
            'landmark' => $address['landmark'] ?? null,
            'full_address' => $address['full_address'],
        ];
    }
}
