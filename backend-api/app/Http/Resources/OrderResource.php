<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isStaff = (bool) $request->user()?->isStaff();

        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'transaction_id' => $this->transaction_id,
            'payment_sender_number' => $this->payment_sender_number,
            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
            ],
            'shipping_address' => $this->shipping_address,
            'shipping_method' => $this->shipping_method_title,
            'currency' => $this->currency,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'discount' => (float) $this->discount,
            'total' => (float) $this->total,
            'customer_note' => $this->customer_note,
            'admin_note' => $this->when($isStaff, $this->admin_note),
            'user' => $this->when($isStaff, fn () => new UserResource($this->whenLoaded('user'))),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'product_name' => $item->product_name,
                'product_slug' => $item->product_slug,
                'variant_title' => $item->variant_title,
                'image' => $item->image,
                'unit_price' => (float) $item->unit_price,
                'quantity' => $item->quantity,
                'line_total' => (float) $item->line_total,
            ])),
            'items_count' => $this->whenCounted('items'),
            'can_cancel' => $this->status->isCancellableByCustomer(),
            'cancelled_at' => $this->cancelled_at,
            'delivered_at' => $this->delivered_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
