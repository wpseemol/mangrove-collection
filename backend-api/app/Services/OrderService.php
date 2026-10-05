<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Notifications\NewOrderReceived;
use App\Notifications\OrderPlaced;
use Closure;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderService
{
    public function __construct(
        protected SettingsService $settings,
        protected SmsService $sms,
        protected PaymentService $payments,
    ) {}

    /**
     * @param  array{
     *     items: list<array{variant_id: int, quantity: int}>,
     *     shipping_method_id: int,
     *     address: array<string, string|null>,
     *     payment_method: string,
     *     payment_account_id?: int|null,
     *     transaction_id?: string|null,
     *     payment_sender_number?: string|null,
     *     customer_note?: string|null,
     * }  $data
     */
    public function place(array $data, ?User $user = null): Order
    {
        $paymentMethod = PaymentMethod::from($data['payment_method']);

        if (! $this->payments->isAvailable($paymentMethod)) {
            throw ValidationException::withMessages(['payment_method' => 'This payment method is not available.']);
        }

        $paymentAccount = $paymentMethod->isWallet()
            ? $this->payments->resolveAccount($paymentMethod, $data['payment_account_id'] ?? null)
            : null;

        $shippingMethod = ShippingMethod::query()->active()->find($data['shipping_method_id']);

        if (! $shippingMethod) {
            throw ValidationException::withMessages(['shipping_method_id' => 'The selected shipping method is not available.']);
        }

        $currency = (string) $this->settings->get('currency', 'BDT');

        $order = DB::transaction(function () use ($data, $user, $paymentMethod, $paymentAccount, $shippingMethod, $currency) {
            ['lines' => $lines, 'subtotal' => $subtotal, 'extra_shipping' => $extraShipping] = $this->priceLines($data['items']);
            $shippingCost = $this->shippingCostFor($shippingMethod, $subtotal, $extraShipping);

            $order = $this->createOrder($lines, [
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user?->id,
                'customer_name' => $data['address']['name'],
                'customer_email' => $data['address']['email'] ?? $user?->email,
                'customer_phone' => $data['address']['phone'],
                'shipping_address' => $data['address'],
                'shipping_method_id' => $shippingMethod->id,
                'shipping_method_title' => $shippingMethod->title,
                'currency' => $currency,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => 0,
                'total' => round($subtotal + $shippingCost, 2),
                'payment_method' => $paymentMethod,
                'payment_status' => PaymentStatus::Pending,
                'status' => OrderStatus::Pending,
                'customer_note' => $data['customer_note'] ?? null,
            ]);

            if ($paymentAccount) {
                $this->payments->submit($order, $paymentAccount, (string) $data['transaction_id'], (string) $data['payment_sender_number']);
            }

            return $order;
        });

        $this->notifyPlaced($order);

        return $order->load(['items', 'latestPayment']);
    }

    /**
     * Orders taken by staff (phone, Facebook, walk-in): catalog prices, optional discount and
     * delivery charge override. Staff skip the storefront's payment-method availability check:
     * the customer already agreed how to pay.
     *
     * @param  array{
     *     items: list<array{variant_id: int, quantity: int}>,
     *     shipping_method_id: int,
     *     address: array<string, string|null>,
     *     payment_method: string,
     *     payment_status: string,
     *     status: string,
     *     shipping_cost?: float|null,
     *     discount?: float|null,
     *     customer_note?: string|null,
     *     admin_note?: string|null,
     *     user_id?: int|null,
     * }  $data
     */
    public function placeByStaff(array $data): Order
    {
        $shippingMethod = ShippingMethod::query()->find($data['shipping_method_id']);

        if (! $shippingMethod) {
            throw ValidationException::withMessages(['shipping_method_id' => 'The selected shipping method is invalid.']);
        }

        $currency = (string) $this->settings->get('currency', 'BDT');
        $customer = isset($data['user_id']) ? User::query()->find($data['user_id']) : null;
        $status = OrderStatus::from($data['status']);

        $order = DB::transaction(function () use ($data, $shippingMethod, $currency, $customer, $status) {
            ['lines' => $lines, 'subtotal' => $subtotal, 'extra_shipping' => $extraShipping] = $this->priceLines($data['items']);
            $shippingCost = isset($data['shipping_cost']) ? (float) $data['shipping_cost'] : $this->shippingCostFor($shippingMethod, $subtotal, $extraShipping);
            $discount = round(min((float) ($data['discount'] ?? 0), $subtotal + $shippingCost), 2);

            return $this->createOrder($lines, [
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $customer?->id,
                'customer_name' => $data['address']['name'],
                'customer_email' => $data['address']['email'] ?? $customer?->email,
                'customer_phone' => $data['address']['phone'],
                'shipping_address' => $data['address'],
                'shipping_method_id' => $shippingMethod->id,
                'shipping_method_title' => $shippingMethod->title,
                'currency' => $currency,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => $discount,
                'total' => round($subtotal + $shippingCost - $discount, 2),
                'payment_method' => PaymentMethod::from($data['payment_method']),
                'payment_status' => PaymentStatus::from($data['payment_status']),
                'status' => $status,
                'customer_note' => $data['customer_note'] ?? null,
                'admin_note' => $data['admin_note'] ?? null,
                'delivered_at' => $status === OrderStatus::Delivered ? now() : null,
            ]);
        });

        $this->notifyPlaced($order, notifyStaff: false);

        return $order;
    }

    /**
     * Deleting an unwanted order puts its stock back without texting the customer about a cancellation.
     */
    public function remove(Order $order): void
    {
        DB::transaction(function () use ($order) {
            if ($order->status !== OrderStatus::Cancelled) {
                $this->restock($order);
            }

            $order->delete();
        });
    }

    /**
     * Live prices for a cart, so checkout shows exactly what the order will charge.
     * Unavailable lines are flagged instead of rejected; placing the order reports them.
     *
     * @param  list<array{variant_id: int, quantity: int}>  $items
     * @return array<string, mixed>
     */
    public function quote(array $items): array
    {
        $quantities = $this->quantities($items);
        $variants = ProductVariant::query()->with('product')->whereIn('id', $quantities->keys())->get()->keyBy('id');

        $lines = [];
        $subtotal = 0.0;
        $extraShipping = 0.0;

        foreach ($quantities as $variantId => $quantity) {
            $variant = $variants->get($variantId);
            $product = $variant?->product;
            $available = $variant && $product && $product->status === ProductStatus::Published && $variant->hasStockFor($quantity);

            if ($available) {
                $subtotal += round((float) $variant->price * $quantity, 2);
                $extraShipping += $this->extraShippingFor($product, $quantity);
            }

            $lines[] = [
                'variant_id' => (int) $variantId,
                'available' => $available,
                'unit_price' => $variant ? (float) $variant->price : null,
                'shipping_cost' => (float) ($product?->shipping_cost ?? 0),
            ];
        }

        $subtotal = round($subtotal, 2);

        return [
            'subtotal' => $subtotal,
            'extra_shipping' => round($extraShipping, 2),
            'free_shipping' => $this->qualifiesForFreeShipping($subtotal),
            'items' => $lines,
            'shipping' => ShippingMethod::query()->active()->orderBy('sort_order')->get()
                ->map(fn (ShippingMethod $method) => ['id' => $method->id, 'cost' => $this->shippingCostFor($method, $subtotal, $extraShipping)])
                ->values()
                ->all(),
        ];
    }

    /**
     * The method's base rate plus each product's extra charge, or nothing once the order reaches the free-shipping threshold.
     */
    public function shippingCostFor(ShippingMethod $method, float $subtotal, float $extraShipping = 0): float
    {
        if ($this->qualifiesForFreeShipping($subtotal)) {
            return 0.0;
        }

        return round((float) $method->price + $extraShipping, 2);
    }

    /**
     * `guard` runs on the freshly locked row, so two concurrent requests can never both cancel (and restock) the same order.
     *
     * @param  (Closure(Order): void)|null  $guard
     */
    public function updateStatus(Order $order, OrderStatus $status, ?Closure $guard = null): Order
    {
        if ($order->status === $status) {
            return $order;
        }

        $changed = false;

        $updated = DB::transaction(function () use ($order, $status, $guard, &$changed) {
            /** @var Order $current */
            $current = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ($guard) {
                $guard($current);
            }

            if ($current->status === $status) {
                return $current;
            }

            $changed = true;

            if ($status === OrderStatus::Cancelled) {
                $this->restock($current);
                $current->cancelled_at = now();
            }

            if ($status === OrderStatus::Delivered) {
                $current->delivered_at = now();

                if ($current->payment_method === PaymentMethod::CashOnDelivery) {
                    $current->payment_status = PaymentStatus::Paid;
                }
            }

            $current->status = $status;
            $current->save();

            return $current;
        });

        $order->setRawAttributes($updated->getAttributes(), true);

        if ($changed) {
            $this->notifyStatusChanged($order);
        }

        return $order;
    }

    public function cancel(Order $order): Order
    {
        $cancellable = function (Order $current) {
            if (! $current->status->isCancellableByCustomer()) {
                throw ValidationException::withMessages(['order' => 'This order can no longer be cancelled.']);
            }
        };

        $cancellable($order);

        return $this->updateStatus($order, OrderStatus::Cancelled, $cancellable);
    }

    /**
     * @param  list<array{variant_id: int, quantity: int}>  $items
     * @return Collection<int, int>
     */
    protected function quantities(array $items): Collection
    {
        return collect($items)
            ->groupBy(fn ($item) => (int) $item['variant_id'])
            ->map(fn ($rows) => (int) $rows->sum('quantity'));
    }

    protected function extraShippingFor(Product $product, int $quantity): float
    {
        return round((float) ($product->shipping_cost ?? 0) * $quantity, 2);
    }

    protected function qualifiesForFreeShipping(float $subtotal): bool
    {
        $threshold = $this->settings->get('free_shipping_threshold');

        return $threshold !== null && $threshold > 0 && $subtotal >= $threshold;
    }

    /**
     * Locks the variants, rejects unavailable or under-stocked lines, and prices the rest at catalog prices.
     *
     * @param  list<array{variant_id: int, quantity: int}>  $items
     * @return array{lines: list<array{variant: ProductVariant, quantity: int, line_total: float}>, subtotal: float, extra_shipping: float}
     */
    protected function priceLines(array $items): array
    {
        $quantities = $this->quantities($items);

        $variants = ProductVariant::query()
            ->with('product')
            ->whereIn('id', $quantities->keys())
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $errors = [];
        $lines = [];
        $subtotal = 0.0;
        $extraShipping = 0.0;

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
            $extraShipping += $this->extraShippingFor($product, $quantity);
            $lines[] = ['variant' => $variant, 'quantity' => $quantity, 'line_total' => $lineTotal];
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        return ['lines' => $lines, 'subtotal' => round($subtotal, 2), 'extra_shipping' => $extraShipping];
    }

    /**
     * @param  list<array{variant: ProductVariant, quantity: int, line_total: float}>  $lines
     * @param  array<string, mixed>  $attributes
     */
    protected function createOrder(array $lines, array $attributes): Order
    {
        $order = Order::query()->create($attributes);

        foreach ($lines as ['variant' => $variant, 'quantity' => $quantity, 'line_total' => $lineTotal]) {
            $order->items()->create([
                'product_id' => $variant->product->id,
                'product_variant_id' => $variant->id,
                'product_name' => $variant->product->name,
                'product_slug' => $variant->product->slug,
                'variant_title' => $variant->title,
                'image' => $variant->product->thumbnail,
                'unit_price' => $variant->price,
                'quantity' => $quantity,
                'line_total' => $lineTotal,
            ]);

            if ($variant->stock !== null) {
                $variant->decrement('stock', $quantity);
            }

            $variant->product->increment('popularity', $quantity);
        }

        return $order;
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

    protected function notifyPlaced(Order $order, bool $notifyStaff = true): void
    {
        $this->safely(function () use ($order) {
            if ($order->customer_email) {
                $order->notify(new OrderPlaced($order));
            }
        });

        $this->safely(function () use ($order, $notifyStaff) {
            if ($notifyStaff && ($email = $this->settings->get('order_notification_email'))) {
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
