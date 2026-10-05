<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitPaymentRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PaymentAccountResource;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    /**
     * Payment options for checkout: cash on delivery (when enabled) and every
     * wallet that has at least one active account to send money to.
     */
    public function methods(PaymentService $payments): JsonResponse
    {
        return response()->json([
            'data' => $payments->availableMethods()->map(fn (array $option) => [
                'method' => $option['method'],
                'label' => $option['method']->label(),
                'accounts' => PaymentAccountResource::collection($option['accounts']),
            ]),
        ]);
    }

    /**
     * Submit (or re-submit after a rejection) a wallet transaction ID for an order.
     * The order owner may submit while signed in; guests must give the order phone number.
     */
    public function store(SubmitPaymentRequest $request, string $orderNumber, PaymentService $payments): OrderResource
    {
        $order = Order::query()->where('order_number', $orderNumber)->first();
        $user = $request->user('sanctum');

        $authorized = $order && (
            ($user && $order->user_id === $user->id)
            || ($request->filled('phone') && $order->customer_phone === $request->string('phone')->toString())
        );

        abort_unless($authorized, 404);

        $payments->resubmit(
            $order,
            $request->integer('payment_account_id'),
            $request->string('transaction_id')->toString(),
            $request->string('payment_sender_number')->toString(),
        );

        return new OrderResource($order->fresh(['items', 'latestPayment']));
    }
}
