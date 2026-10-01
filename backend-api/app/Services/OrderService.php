<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Notifications\NewOrderReceived;
use App\Notifications\OrderPlaced;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderService
{
    public function __construct(
        protected SettingsService $settings,
        protected SmsService $sms,
    ) {}

    /**
     * @param  array{
     *     items: list<array{variant_id: int, quantity: int}>,
     *     shipping_method_id: int,
     *     address: array<string, string|null>,
     *     payment_method: string,
     *     transaction_id?: string|null,
     *     payment_sender_number?: string|null,
     *     customer_note?: string|null,
     * }  $data
     */
    public function place(array $data, ?User $user = null): Order
    {
        $paymentMethod = PaymentMethod::from($data['payment_method']);

        if (! in_array($paymentMethod->value, (array) $this->settings->get('payment_methods', ['cod']), true)) {
            throw ValidationException::withMessages(['payment_method' => 'This payment method is not available.']);
        }

        $shippingMethod = ShippingMethod::query()->active()->find($data['shipping_method_id']);

        if (! $shippingMethod) {
            throw ValidationException::withMessages(['shipping_method_id' => 'The selected shipping method is not available.']);
        }

        $order = DB::transaction(function () use ($data, $user, $paymentMethod, $shippingMethod) {
            $quantities = collect($data['items'])
                ->groupBy('variant_id')
                ->map(fn ($rows) => (int) $rows->sum('quantity'));

            $variants = ProductVariant::query()
                ->with('product')
                ->whereIn('id', $quantities->keys())
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $errors = [];
            $lines = [];
            $subtotal = 0.0;

            foreach ($quantities as $variantId => $quantity) {
                $variant = $variants->get($variantId);
                $product = $variant?->product;

                if (! $variant || ! $product || $product->status !== ProductStatus::Published) {
                    $errors["items.{$variantId}"] = 'One of the products in your cart is no longer available.';

                    continue;
                }

                if (! $variant->hasStockFor($quantity)) {
                    $errors["items.{$variantId}"] = "Only {$variant->stock} unit(s) of {$product->name} ({$variant->title}) are in stock.";

                    continue;
                }

                $lineTotal = round((float) $variant->price * $quantity, 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'variant' => $variant,
                    'attributes' => [
                        'product_id' => $product->id,
                        'product_variant_id' => $variant->id,
                        'product_name' => $product->name,
                        'product_slug' => $product->slug,
                        'variant_title' => $variant->title,
                        'image' => $product->thumbnail,
                        'unit_price' => $variant->price,
                        'quantity' => $quantity,
                        'line_total' => $lineTotal,
                    ],
                ];
            }

            if ($errors !== []) {
                throw ValidationException::withMessages($errors);
            }

            $shippingCost = $this->shippingCostFor($shippingMethod, $subtotal);

            $order = Order::query()->create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user?->id,
                'customer_name' => $data['address']['name'],
                'customer_email' => $data['address']['email'] ?? $user?->email,
                'customer_phone' => $data['address']['phone'],
                'shipping_address' => $data['address'],
                'shipping_method_id' => $shippingMethod->id,
                'shipping_method_title' => $shippingMethod->title,
                'currency' => (string) $this->settings->get('currency', 'BDT'),
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => 0,
                'total' => round($subtotal + $shippingCost, 2),
                'payment_method' => $paymentMethod,
                'payment_status' => PaymentStatus::Pending,
                'transaction_id' => $data['transaction_id'] ?? null,
                'payment_sender_number' => $data['payment_sender_number'] ?? null,
                'status' => OrderStatus::Pending,
                'customer_note' => $data['customer_note'] ?? null,
            ]);

            foreach ($lines as $line) {
                $order->items()->create($line['attributes']);

                if ($line['variant']->stock !== null) {
                    $line['variant']->decrement('stock', $line['attributes']['quantity']);
                }

                $line['variant']->product->increment('popularity', $line['attributes']['quantity']);
            }

            return $order;
        });

        $this->notifyPlaced($order);

        return $order->load('items');
    }

    public function shippingCostFor(ShippingMethod $method, float $subtotal): float
    {
        $threshold = $this->settings->get('free_shipping_threshold');

        if ($threshold !== null && $threshold > 0 && $subtotal >= $threshold) {
            return 0.0;
        }

        return (float) $method->price;
    }

    public function updateStatus(Order $order, OrderStatus $status): Order
    {
        if ($order->status === $status) {
            return $order;
        }

        DB::transaction(function () use ($order, $status) {
            if ($status === OrderStatus::Cancelled) {
                $this->restock($order);
                $order->cancelled_at = now();
            }

            if ($status === OrderStatus::Delivered) {
                $order->delivered_at = now();

                if ($order->payment_method === PaymentMethod::CashOnDelivery) {
                    $order->payment_status = PaymentStatus::Paid;
                }
            }

            $order->status = $status;
            $order->save();
        });

        $this->notifyStatusChanged($order);

        return $order;
    }

    public function cancel(Order $order): Order
    {
        if (! $order->status->isCancellableByCustomer()) {
            throw ValidationException::withMessages(['order' => 'This order can no longer be cancelled.']);
        }

        return $this->updateStatus($order, OrderStatus::Cancelled);
    }

    protected function restock(Order $order): void
    {
        $order->loadMissing('items.variant');

        foreach ($order->items as $item) {
            if ($item->variant && $item->variant->stock !== null) {
                $item->variant->increment('stock', $item->quantity);
            }
        }
    }

    protected function notifyPlaced(Order $order): void
    {
        $this->safely(function () use ($order) {
            if ($order->customer_email) {
                $order->notify(new OrderPlaced($order));
            }
        });

        $this->safely(function () use ($order) {
            if ($email = $this->settings->get('order_notification_email')) {
                Notification::route('mail', $email)->notify(new NewOrderReceived($order));
            }
        });

        $this->safely(function () use ($order) {
            if ($this->sms->enabled()) {
                $this->sms->send($order->customer_phone, $this->sms->render('sms_order_placed_template', [
                    'name' => $order->customer_name,
                    'order_number' => $order->order_number,
                    'total' => number_format((float) $order->total, 2),
                    'currency' => $order->currency,
                ]));
            }
        });
    }

    protected function notifyStatusChanged(Order $order): void
    {
        $this->safely(function () use ($order) {
            if ($this->sms->enabled()) {
                $this->sms->send($order->customer_phone, $this->sms->render('sms_order_status_template', [
                    'name' => $order->customer_name,
                    'order_number' => $order->order_number,
                    'status' => $order->status->value,
                ]));
            }
        });
    }

    /**
     * Notification failures (bad SMTP/SMS credentials) must never fail an order.
     */
    protected function safely(callable $callback): void
    {
        try {
            $callback();
        } catch (Throwable $e) {
            report($e);
        }
    }
}
