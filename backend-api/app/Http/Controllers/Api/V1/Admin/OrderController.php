<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\User;
use App\Rules\PhoneNumber;
use App\Rules\SafeText;
use App\Services\OrderService;
use App\Support\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private const DETAIL = ['items', 'user', 'latestPayment', 'payments.reviewer:id,name'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'status' => ['nullable', Rule::enum(OrderStatus::class)],
            'payment_status' => ['nullable', Rule::enum(PaymentStatus::class)],
            'payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $orders = Order::query()
            ->with('latestPayment')
            ->withCount('items')
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('order_number', 'like', Search::like($term))
                ->orWhere('customer_name', 'like', Search::like($term))
                ->orWhere('customer_phone', 'like', Search::like($term))
                ->orWhere('customer_email', 'like', Search::like($term))))
            ->when($request->query('status'), fn (Builder $q, $v) => $q->where('status', $v))
            ->when($request->query('payment_status'), fn (Builder $q, $v) => $q->where('payment_status', $v))
            ->when($request->query('payment_method'), fn (Builder $q, $v) => $q->where('payment_method', $v))
            ->when($request->query('from'), fn (Builder $q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->query('to'), fn (Builder $q, $v) => $q->whereDate('created_at', '<=', $v))
            ->latest()
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        $counts = Order::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return OrderResource::collection($orders)->additional([
            'counts' => collect(OrderStatus::cases())->mapWithKeys(fn (OrderStatus $s) => [$s->value => (int) ($counts[$s->value] ?? 0)]),
        ]);
    }

    /**
     * Orders taken over the phone, Facebook or in person.
     */
    public function store(Request $request, OrderService $orders): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.variant_id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000'],
            'shipping_method_id' => ['required', 'integer'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'discount' => ['nullable', 'numeric', 'min:0', 'max:10000000'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'payment_status' => ['sometimes', Rule::enum(PaymentStatus::class)],
            'status' => ['sometimes', Rule::in([
                OrderStatus::Pending->value, OrderStatus::Processing->value, OrderStatus::Shipped->value, OrderStatus::Delivered->value,
            ])],
            'customer_note' => ['nullable', 'string', 'max:1000', new SafeText],
            'admin_note' => ['nullable', 'string', 'max:5000', new SafeText],
            'user_id' => ['nullable', 'integer'],
            'address' => ['required', 'array'],
            'address.name' => ['required', 'string', 'max:255', new SafeText],
            'address.email' => ['nullable', 'email', 'max:255'],
            'address.phone' => ['required', 'string', 'max:32', new PhoneNumber],
            'address.region' => ['nullable', 'string', 'max:255', new SafeText],
            'address.city' => ['nullable', 'string', 'max:255', new SafeText],
            'address.zone' => ['nullable', 'string', 'max:255', new SafeText],
            'address.landmark' => ['nullable', 'string', 'max:255', new SafeText],
            'address.full_address' => ['required', 'string', 'max:1000', new SafeText],
        ], [], [
            'items.*.variant_id' => 'product',
            'items.*.quantity' => 'quantity',
            'shipping_method_id' => 'delivery method',
            'shipping_cost' => 'delivery charge',
            'address.name' => 'name',
            'address.email' => 'email',
            'address.phone' => 'phone number',
            'address.region' => 'division',
            'address.city' => 'district / city',
            'address.zone' => 'area',
            'address.landmark' => 'landmark',
            'address.full_address' => 'full address',
        ]);

        $address = $data['address'];

        $order = $orders->placeByStaff([
            ...$data,
            'payment_status' => $data['payment_status'] ?? PaymentStatus::Pending->value,
            'status' => $data['status'] ?? OrderStatus::Pending->value,
            'user_id' => $data['user_id'] ?? null,
            'address' => [
                'name' => $address['name'],
                'email' => $address['email'] ?? null,
                'phone' => $address['phone'],
                'region' => $address['region'] ?? null,
                'city' => $address['city'] ?? null,
                'zone' => $address['zone'] ?? null,
                'landmark' => $address['landmark'] ?? null,
                'full_address' => $address['full_address'],
            ],
        ]);

        return (new OrderResource($order->fresh(self::DETAIL)))->response()->setStatusCode(201);
    }

    /**
     * Prefills a phone order from the customer's account or their most recent order.
     */
    public function customerLookup(Request $request): JsonResponse
    {
        $phone = $request->validate(['phone' => ['required', 'string', 'max:32', new PhoneNumber]])['phone'];

        $user = User::query()->where('phone', $phone)->where('role', UserRole::Customer)->first();
        $previous = Order::query()->where('customer_phone', $phone)->latest()->first();

        return response()->json([
            'data' => [
                'user' => $user ? ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'phone' => $user->phone] : null,
                'address' => $previous?->shipping_address,
                'orders_count' => Order::query()->where('customer_phone', $phone)->count(),
            ],
        ]);
    }

    /**
     * Full orders (items included) for printing invoices and delivery sheets in one go.
     */
    public function print(Request $request): AnonymousResourceCollection
    {
        $ids = $request->query('ids');

        if (is_string($ids)) {
            $request->merge(['ids' => array_values(array_filter(explode(',', $ids), fn ($id) => $id !== ''))]);
        }

        $ids = $request->validate($this->idRules(), $this->idMessages($request))['ids'];

        return OrderResource::collection(Order::query()->with('items')->whereIn('id', $ids)->orderBy('id')->get());
    }

    public function bulkStatus(Request $request, OrderService $orders): JsonResponse
    {
        $data = $request->validate([...$this->idRules(), 'status' => ['required', Rule::enum(OrderStatus::class)]], $this->idMessages($request));
        $status = OrderStatus::from($data['status']);
        $rows = Order::query()->whereIn('id', $data['ids'])->get();

        $updated = 0;

        foreach ($rows as $order) {
            if ($order->status === $status || ($order->status === OrderStatus::Cancelled && $status !== OrderStatus::Cancelled)) {
                continue;
            }

            $orders->updateStatus($order, $status);
            $updated++;
        }

        return response()->json(['data' => ['updated' => $updated, 'skipped' => $rows->count() - $updated]]);
    }

    public function bulkDestroy(Request $request, OrderService $orders): JsonResponse
    {
        $ids = $request->validate($this->idRules(), $this->idMessages($request))['ids'];
        $rows = Order::query()->whereIn('id', $ids)->get();

        foreach ($rows as $order) {
            $orders->remove($order);
        }

        return response()->json(['data' => ['deleted' => $rows->count()]]);
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(self::DETAIL));
    }

    public function update(Request $request, Order $order, OrderService $orders): OrderResource
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::enum(OrderStatus::class)],
            'payment_status' => ['sometimes', Rule::enum(PaymentStatus::class)],
            'admin_note' => ['nullable', 'string', 'max:5000', new SafeText],
        ]);

        if ($order->status === OrderStatus::Cancelled && isset($data['status']) && $data['status'] !== OrderStatus::Cancelled->value) {
            abort(409, 'Cancelled orders cannot be reopened. Ask the customer to place a new order.');
        }

        $order->fill(collect($data)->except('status')->all())->save();

        if (isset($data['status'])) {
            $orders->updateStatus($order, OrderStatus::from($data['status']));
        }

        return new OrderResource($order->fresh(self::DETAIL));
    }

    public function destroy(Order $order, OrderService $orders): JsonResponse
    {
        $orders->remove($order);

        return response()->json(null, 204);
    }

    /** @return array<string, list<string>> */
    private function idRules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['required', 'integer'],
        ];
    }

    /** @return array<string, string> */
    private function idMessages(Request $request): array
    {
        return [
            ...(is_array($request->input('ids')) ? ['ids.required' => 'Select at least one order.'] : []),
            'ids.min' => 'Select at least one order.',
            'ids.max' => 'Select at most 200 orders at a time.',
        ];
    }
}
