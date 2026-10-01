<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Notifications\OrderPlaced;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected ShippingMethod $shipping;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shipping = ShippingMethod::factory()->create(['price' => 80]);
    }

    public function test_guest_checkout_computes_totals_server_side_and_decrements_stock(): void
    {
        Notification::fake();
        $product = Product::factory()->withVariant(250, 5)->create();
        $variant = $product->variants->first();

        $response = $this->postJson('/v1/checkout', $this->payload($variant->id, 2, [
            'address' => $this->address(['email' => 'guest@example.com']),
        ]))
            ->assertCreated()
            ->assertJsonPath('data.subtotal', 500)
            ->assertJsonPath('data.shipping_cost', 80)
            ->assertJsonPath('data.total', 580)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.items.0.quantity', 2);

        $this->assertSame(3, $variant->fresh()->stock);
        $this->assertNull(Order::query()->first()->user_id);

        Notification::assertSentTo(Order::query()->first(), OrderPlaced::class);

        $this->getJson('/v1/orders/track?'.http_build_query([
            'order_number' => $response->json('data.order_number'),
            'phone' => '01700000000',
        ]))->assertOk();

        $this->getJson('/v1/orders/track?'.http_build_query([
            'order_number' => $response->json('data.order_number'),
            'phone' => '01999999999',
        ]))->assertNotFound();
    }

    public function test_checkout_rejects_insufficient_stock(): void
    {
        $variant = Product::factory()->withVariant(100, 1)->create()->variants->first();

        $this->postJson('/v1/checkout', $this->payload($variant->id, 2))->assertUnprocessable();

        $this->assertSame(1, $variant->fresh()->stock);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_rejects_disabled_payment_methods_and_requires_transaction_id(): void
    {
        $variant = Product::factory()->withVariant()->create()->variants->first();

        $this->postJson('/v1/checkout', $this->payload($variant->id, 1, ['payment_method' => 'bkash', 'transaction_id' => 'TX1']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('payment_method');

        app(SettingsService::class)->update(['payment_methods' => ['cod', 'bkash']]);

        $this->postJson('/v1/checkout', $this->payload($variant->id, 1, ['payment_method' => 'bkash']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('transaction_id');

        $this->postJson('/v1/checkout', $this->payload($variant->id, 1, ['payment_method' => 'bkash', 'transaction_id' => 'TX1']))
            ->assertCreated();
    }

    public function test_free_shipping_threshold_from_settings_is_applied(): void
    {
        app(SettingsService::class)->update(['free_shipping_threshold' => 1000]);
        $variant = Product::factory()->withVariant(600)->create()->variants->first();

        $this->postJson('/v1/checkout', $this->payload($variant->id, 2))
            ->assertCreated()
            ->assertJsonPath('data.shipping_cost', 0)
            ->assertJsonPath('data.total', 1200);
    }

    public function test_authenticated_customer_order_is_linked_and_can_be_cancelled(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $variant = Product::factory()->withVariant(100, 10)->create()->variants->first();

        $orderNumber = $this->postJson('/v1/checkout', $this->payload($variant->id, 3, ['save_address' => true]))
            ->assertCreated()
            ->json('data.order_number');

        $this->assertSame(7, $variant->fresh()->stock);
        $this->assertSame(1, $user->addresses()->count());

        $this->getJson('/v1/account/orders')->assertOk()->assertJsonCount(1, 'data');

        $this->postJson("/v1/account/orders/{$orderNumber}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(10, $variant->fresh()->stock);

        $this->postJson("/v1/account/orders/{$orderNumber}/cancel")->assertUnprocessable();
    }

    public function test_customers_cannot_see_other_customers_orders(): void
    {
        $variant = Product::factory()->withVariant()->create()->variants->first();
        Sanctum::actingAs(User::factory()->create());
        $orderNumber = $this->postJson('/v1/checkout', $this->payload($variant->id, 1))->json('data.order_number');

        Sanctum::actingAs(User::factory()->create());
        $this->getJson("/v1/account/orders/{$orderNumber}")->assertNotFound();
    }

    public function test_order_sms_is_sent_through_the_configured_gateway(): void
    {
        Http::fake();
        app(SettingsService::class)->update([
            'sms_enabled' => true,
            'sms_driver' => 'http',
            'sms_api_url' => 'https://sms.example.com/send',
            'sms_api_key' => 'k',
        ]);
        $variant = Product::factory()->withVariant()->create()->variants->first();

        $orderNumber = $this->postJson('/v1/checkout', $this->payload($variant->id, 1))->json('data.order_number');

        Http::assertSent(fn ($request) => $request['number'] === '01700000000'
            && str_contains($request['message'], $orderNumber));
    }

    public function test_failing_notifications_do_not_break_checkout(): void
    {
        Http::fake(['*' => Http::response('down', 500)]);
        app(SettingsService::class)->update([
            'sms_enabled' => true,
            'sms_driver' => 'http',
            'sms_api_url' => 'https://sms.example.com/send',
            'sms_api_key' => 'k',
        ]);
        $variant = Product::factory()->withVariant()->create()->variants->first();

        $this->postJson('/v1/checkout', $this->payload($variant->id, 1))->assertCreated();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    protected function payload(int $variantId, int $quantity, array $overrides = []): array
    {
        return [
            'items' => [['variant_id' => $variantId, 'quantity' => $quantity]],
            'shipping_method_id' => $this->shipping->id,
            'payment_method' => 'cod',
            'address' => $this->address(),
            ...$overrides,
        ];
    }

    /**
     * @param  array<string, string>  $overrides
     * @return array<string, string>
     */
    protected function address(array $overrides = []): array
    {
        return [
            'name' => 'Rahim Uddin',
            'phone' => '01700000000',
            'city' => 'Dhaka',
            'full_address' => 'House 1, Road 2, Dhanmondi',
            ...$overrides,
        ];
    }
}
