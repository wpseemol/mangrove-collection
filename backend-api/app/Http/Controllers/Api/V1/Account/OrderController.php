<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()->orders()
            ->with('items')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(min((int) $request->query('per_page', 10), 50));

        return OrderResource::collection($orders);
    }

    public function show(Request $request, string $orderNumber): OrderResource
    {
        return new OrderResource($this->find($request, $orderNumber)->load('items'));
    }

    public function cancel(Request $request, string $orderNumber, OrderService $orders): OrderResource
    {
        $order = $orders->cancel($this->find($request, $orderNumber));

        return new OrderResource($order->load('items'));
    }

    protected function find(Request $request, string $orderNumber): Order
    {
        return $request->user()->orders()->where('order_number', $orderNumber)->firstOrFail();
    }
}
