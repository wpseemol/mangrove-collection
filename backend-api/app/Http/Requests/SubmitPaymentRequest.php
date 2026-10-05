<?php

namespace App\Http\Requests;

use App\Rules\PhoneNumber;
use App\Rules\TransactionId;
use Illuminate\Foundation\Http\FormRequest;

class SubmitPaymentRequest extends FormRequest
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
        return [
            'payment_account_id' => ['required', 'integer'],
            'transaction_id' => ['required', 'string', new TransactionId],
            'payment_sender_number' => ['required', 'string', 'max:32', new PhoneNumber],
            // Guests prove ownership with the phone number used on the order.
            'phone' => ['nullable', 'string', 'max:32', new PhoneNumber],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'payment_account_id' => 'payment account',
            'transaction_id' => 'transaction ID',
            'payment_sender_number' => 'sender number',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'transaction_id' => TransactionId::normalize($this->input('transaction_id')),
            'payment_sender_number' => is_string($this->input('payment_sender_number')) ? trim($this->input('payment_sender_number')) : $this->input('payment_sender_number'),
        ]);
    }
}
