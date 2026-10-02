<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentReviewStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request, SettingsService $settings): JsonResponse
    {
        $request->validate(['days' => ['nullable', 'integer', 'min:1', 'max:365']]);

        $days = (int) $request->query('days', 30);
        $from = now()->subDays($days - 1)->startOfDay();

        $revenueQuery = Order::query()->where('status', '!=', OrderStatus::Cancelled);

        $daily = Order::query()
            ->where('status', '!=', OrderStatus::Cancelled)
            ->where('created_at', '>=', $from)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as orders, SUM(total) as revenue')
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $chart = collect(range(0, $days - 1))->map(function (int $offset) use ($from, $daily) {
            $day = Carbon::parse($from)->addDays($offset)->toDateString();

            return [
                'date' => $day,
                'orders' => (int) ($daily[$day]->orders ?? 0),
                'revenue' => round((float) ($daily[$day]->revenue ?? 0), 2),
            ];
        });

        $lowStock = ProductVariant::query()
            ->with('product:id,name,slug')
            ->whereNotNull('stock')
            ->where('stock', '<=', (int) $settings->get('low_stock_threshold', 5))
            ->whereHas('product')
            ->orderBy('stock')
            ->limit(10)
            ->get()
            ->map(fn (ProductVariant $variant) => [
                'variant_id' => $variant->id,
                'product_id' => $variant->product_id,
                'product_name' => $variant->product->name,
                'variant_title' => $variant->title,
                'stock' => $variant->stock,
            ]);

        return response()->json(['data' => [
            'totals' => [
                'revenue' => round((float) (clone $revenueQuery)->sum('total'), 2),
                'revenue_period' => round((float) (clone $revenueQuery)->where('created_at', '>=', $from)->sum('total'), 2),
                'orders' => Order::query()->count(),
                'orders_period' => Order::query()->where('created_at', '>=', $from)->count(),
                'customers' => User::query()->where('role', UserRole::Customer)->count(),
                'products' => Product::query()->count(),
                'payments_awaiting' => Payment::query()->where('status', PaymentReviewStatus::Submitted)->count(),
            ],
            'orders_by_status' => collect(OrderStatus::cases())->mapWithKeys(fn (OrderStatus $status) => [
                $status->value => Order::query()->where('status', $status)->count(),
            ]),
            'sales_chart' => $chart,
            'low_stock' => $lowStock,
            'recent_orders' => OrderResource::collection(
                Order::query()->withCount('items')->latest()->limit(5)->get()
            ),
        ]]);
    }
}
