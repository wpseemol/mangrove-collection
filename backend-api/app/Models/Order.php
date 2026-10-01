<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

#[Fillable([
    'order_number', 'user_id', 'customer_name', 'customer_email', 'customer_phone', 'shipping_address',
    'shipping_method_id', 'shipping_method_title', 'currency', 'subtotal', 'shipping_cost', 'discount', 'total',
    'payment_method', 'payment_status', 'transaction_id', 'payment_sender_number', 'status',
    'customer_note', 'admin_note', 'cancelled_at', 'delivered_at',
])]
class Order extends Model
{
    use Notifiable;

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'subtotal' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'status' => OrderStatus::class,
            'cancelled_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public static function generateOrderNumber(): string
    {
        do {
            $number = 'MC'.now()->format('ymd').Str::upper(Str::random(6));
        } while (static::query()->where('order_number', $number)->exists());

        return $number;
    }

    public function routeNotificationForMail(): ?string
    {
        return $this->customer_email;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return BelongsTo<ShippingMethod, $this>
     */
    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }
}
