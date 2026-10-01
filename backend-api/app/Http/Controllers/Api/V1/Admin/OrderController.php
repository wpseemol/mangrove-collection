<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(OrderStatus::class)],
            'payment_status' => ['nullable', Rule::enum(PaymentStatus::class)],
            'payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $orders = Order::query()
            ->withCount('items')
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('order_number', 'like', "%{$term}%")
                ->orWhere('customer_name', 'like', "%{$term}%")
                ->orWhere('customer_phone', 'like', "%{$term}%")
                ->orWhere('customer_email', 'like', "%{$term}%")))
            ->when($request->query('status'), fn (Builder $q, $v) => $q->where('status', $v))
            ->when($request->query('payment_status'), fn (Builder $q, $v) => $q->where('payment_status', $v))
            ->when($request->query('payment_method'), fn (Builder $q, $v) => $q->where('payment_method', $v))
            ->when($request->query('from'), fn (Builder $q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->query('to'), fn (Builder $q, $v) => $q->whereDate('created_at', '<=', $v))
            ->latest()
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(['items', 'user']));
    }

    public function update(Request $request, Order $order, OrderService $orders): OrderResource
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::enum(OrderStatus::class)],
            'payment_status' => ['sometimes', Rule::enum(PaymentStatus::class)],
            'transaction_id' => ['nullable', 'string', 'max:100'],
            'admin_note' => ['nullable', 'string', 'max:5000'],
        ]);

        if ($order->status === OrderStatus::Cancelled && isset($data['status']) && $data['status'] !== OrderStatus::Cancelled->value) {
            abort(409, 'Cancelled orders cannot be reopened. Ask the customer to place a new order.');
        }

        $order->fill(collect($data)->except('status')->all())->save();

        if (isset($data['status'])) {
            $orders->updateStatus($order, OrderStatus::from($data['status']));
        }

        return new OrderResource($order->fresh(['items', 'user']));
    }

    public function destroy(Order $order, OrderService $orders): JsonResponse
    {
        if ($order->status !== OrderStatus::Cancelled) {
            $orders->updateStatus($order, OrderStatus::Cancelled);
        }

        $order->delete();

        return response()->json(null, 204);
    }
}
