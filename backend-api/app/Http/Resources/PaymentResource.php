<?php

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Payment */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isStaff = (bool) $request->user()?->isStaff();

        return [
            'id' => $this->id,
            'method' => $this->method,
            'account_type' => $this->account_type,
            'action' => $this->account_type?->action(),
            'account_number' => $this->account_number,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'sender_number' => $this->sender_number,
            'transaction_id' => $this->transaction_id,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'reviewed_at' => $this->reviewed_at,
            'reviewer' => $this->when($isStaff && $this->relationLoaded('reviewer'), fn () => $this->reviewer?->only(['id', 'name'])),
            'order' => $this->when($isStaff && $this->relationLoaded('order'), fn () => [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'customer_name' => $this->order->customer_name,
                'customer_phone' => $this->order->customer_phone,
                'total' => (float) $this->order->total,
                'currency' => $this->order->currency,
                'status' => $this->order->status,
                'payment_status' => $this->order->payment_status,
                'created_at' => $this->order->created_at,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
