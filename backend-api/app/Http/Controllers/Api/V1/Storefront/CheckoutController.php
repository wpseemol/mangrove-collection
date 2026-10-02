<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Rules\PhoneNumber;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    /**
     * Guests and signed-in customers can both check out; a Bearer token,
     * when present, links the order to the account.
     */
    public function store(CheckoutRequest $request, OrderService $orders): JsonResponse
    {
        $user = $request->user('sanctum');
        $address = $request->shippingAddress();

        $order = $orders->place([
            ...$request->safe()->only(['items', 'shipping_method_id', 'payment_method', 'transaction_id', 'payment_sender_number', 'customer_note']),
            'address' => $address,
        ], $user);

        if ($user && $request->boolean('save_address') && ! $request->filled('address_id')) {
            $user->addresses()->create([
                ...$address,
                'is_default' => ! $user->addresses()->exists(),
            ]);
        }

        return (new OrderResource($order))->response()->setStatusCode(201);
    }

    /**
     * Guest order tracking: requires both the order number and the phone used.
     */
    public function track(Request $request): OrderResource
    {
        $data = $request->validate([
            'order_number' => ['required', 'string', 'max:32', 'regex:/^[A-Za-z0-9\-]+$/'],
            'phone' => ['required', 'string', 'max:32', new PhoneNumber],
        ]);

        $order = Order::query()
            ->where('order_number', $data['order_number'])
            ->where('customer_phone', $data['phone'])
            ->with('items')
            ->firstOrFail();

        return new OrderResource($order);
    }
}
