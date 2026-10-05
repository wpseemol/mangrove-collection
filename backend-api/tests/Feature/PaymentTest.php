<?php

namespace Tests\Feature;

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentAccount;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected ShippingMethod $shipping;

    protected ProductVariant $variant;

    protected PaymentAccount $bkash;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shipping = ShippingMethod::factory()->create(['price' => 60]);
        $this->variant = Product::factory()->withVariant(500, 20)->create()->variants->first();
        $this->bkash = PaymentAccount::factory()->create(['account_number' => '01711111111']);
    }

    public function test_public_methods_list_cod_and_only_active_wallet_accounts(): void
    {
        PaymentAccount::factory()->method(PaymentMethod::Nagad)->inactive()->create();
        PaymentAccount::factory()->method(PaymentMethod::Rocket)->create(['account_number' => '017222222225']);

        $response = $this->getJson('/v1/payment-methods')->assertOk();

        $this->assertSame(['cod', 'bkash', 'rocket'], array_column($response->json('data'), 'method'));
        $response
            ->assertJsonPath('data.1.accounts.0.account_number', '01711111111')
            ->assertJsonPath('data.1.accounts.0.action', 'Send Money')
            ->assertJsonMissingPath('data.1.accounts.0.is_active');
    }

    public function test_wallet_checkout_records_a_payment_for_review(): void
    {
        $order = $this->checkout(['transaction_id' => ' 9ab7 cd6e5f '])
            ->assertCreated()
            ->assertJsonPath('data.payment_status', 'verifying')
            ->assertJsonPath('data.payment.transaction_id', '9AB7CD6E5F')
            ->assertJsonPath('data.payment.account_number', '01711111111')
            ->assertJsonPath('data.payment.amount', 560)
            ->assertJsonPath('data.payment.status', 'submitted')
            ->assertJsonPath('data.can_submit_payment', false);

        $this->assertDatabaseHas('payments', [
            'order_id' => $order->json('data.id'),
            'payment_account_id' => $this->bkash->id,
            'sender_number' => '01811111111',
        ]);
    }

    public function test_wallet_checkout_validates_account_transaction_id_and_sender(): void
    {
        $nagad = PaymentAccount::factory()->method(PaymentMethod::Nagad)->create();
        $inactive = PaymentAccount::factory()->inactive()->create();

        $this->checkout(['transaction_id' => null, 'payment_sender_number' => null])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['transaction_id', 'payment_sender_number']);

        $this->checkout(['transaction_id' => "<script>alert('x')</script>"])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('transaction_id');

        $this->checkout(['payment_account_id' => $nagad->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('payment_account_id');

        $this->checkout(['payment_account_id' => $inactive->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('payment_account_id');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(20, $this->variant->fresh()->stock);
    }

    public function test_a_transaction_id_cannot_pay_for_two_orders(): void
    {
        $this->checkout(['transaction_id' => 'TRX1234567'])->assertCreated();

        $this->checkout(['transaction_id' => 'trx1234567'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('transaction_id');

        $this->assertDatabaseCount('orders', 1);
        $this->assertSame(19, $this->variant->fresh()->stock);
    }

    public function test_staff_verification_marks_the_order_paid_and_processing(): void
    {
        $orderId = $this->checkout()->json('data.id');
        $payment = Payment::query()->firstOrFail();
        $manager = User::factory()->manager()->create();
        Sanctum::actingAs($manager);

        $this->getJson('/v1/admin/payments?status=submitted')
            ->assertOk()
            ->assertJsonPath('counts.submitted', 1)
            ->assertJsonPath('data.0.order.id', $orderId);

        $this->postJson("/v1/admin/payments/{$payment->id}/verify")
            ->assertOk()
            ->assertJsonPath('data.status', 'verified')
            ->assertJsonPath('data.reviewer.name', $manager->name)
            ->assertJsonPath('data.order.payment_status', 'paid')
            ->assertJsonPath('data.order.status', 'processing');

        $this->postJson("/v1/admin/payments/{$payment->id}/verify")->assertStatus(409);
        $this->postJson("/v1/admin/payments/{$payment->id}/reject", ['reason' => 'Late change'])->assertStatus(409);
    }

    public function test_rejected_payment_can_be_resubmitted_by_the_guest_with_the_order_phone(): void
    {
        Http::fake();
        app(SettingsService::class)->update([
            'sms_enabled' => true, 'sms_driver' => 'http', 'sms_api_url' => 'https://sms.example.com/send', 'sms_api_key' => 'k',
        ]);

        $orderNumber = $this->checkout(['transaction_id' => 'WRONG12345'])->json('data.order_number');
        $payment = Payment::query()->firstOrFail();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson("/v1/admin/payments/{$payment->id}/reject", ['reason' => '<b>bad</b>'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        $this->postJson("/v1/admin/payments/{$payment->id}/reject", ['reason' => 'No payment with this transaction ID'])
            ->assertOk()
            ->assertJsonPath('data.order.payment_status', 'failed');

        Http::assertSent(fn ($request) => str_contains($request['message'], 'No payment with this transaction ID'));

        $this->app['auth']->forgetGuards();
        $resubmit = fn (array $overrides = []) => $this->postJson("/v1/orders/{$orderNumber}/payment", [
            'payment_account_id' => $this->bkash->id,
            'transaction_id' => 'RIGHT12345',
            'payment_sender_number' => '01811111111',
            'phone' => '01700000000',
            ...$overrides,
        ]);

        $resubmit(['phone' => '01999999999'])->assertNotFound();
        $resubmit(['phone' => null])->assertNotFound();

        $resubmit()
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'verifying')
            ->assertJsonPath('data.payment.transaction_id', 'RIGHT12345');

        $resubmit(['transaction_id' => 'AGAIN12345'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('transaction_id');

        $this->assertSame(2, Order::query()->firstOrFail()->payments()->count());
    }

    public function test_signed_in_owner_can_resubmit_but_other_customers_cannot(): void
    {
        $owner = User::factory()->create();
        Sanctum::actingAs($owner);
        $orderNumber = $this->checkout()->json('data.order_number');
        Payment::query()->firstOrFail()->forceFill(['status' => 'rejected'])->save();
        Order::query()->firstOrFail()->forceFill(['payment_status' => 'failed'])->save();

        $body = ['payment_account_id' => $this->bkash->id, 'transaction_id' => 'NEWTRX1234', 'payment_sender_number' => '01811111111'];

        Sanctum::actingAs(User::factory()->create());
        $this->postJson("/v1/orders/{$orderNumber}/payment", $body)->assertNotFound();

        Sanctum::actingAs($owner);
        $this->postJson("/v1/orders/{$orderNumber}/payment", $body)->assertOk();
    }

    public function test_only_admins_manage_payment_accounts(): void
    {
        Sanctum::actingAs(User::factory()->manager()->create());
        $this->getJson('/v1/admin/payment-accounts')->assertForbidden();
        $this->postJson('/v1/admin/payment-accounts', ['method' => 'bkash', 'account_type' => 'personal', 'account_number' => '01733333333'])
            ->assertForbidden();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/v1/admin/payments')->assertForbidden();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/v1/admin/payment-accounts', [
            'method' => 'cod',
            'account_type' => 'personal',
            'account_number' => '12345',
            'instructions' => '<script>steal()</script>',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['method', 'account_number', 'instructions']);

        $this->postJson('/v1/admin/payment-accounts', ['method' => 'bkash', 'account_type' => 'personal', 'account_number' => '017-1111-1111'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('account_number');

        $id = $this->postJson('/v1/admin/payment-accounts', [
            'method' => 'nagad',
            'account_type' => 'merchant',
            'account_number' => '+880 1733-333333',
            'account_name' => 'Mangrove Collection',
            'instructions' => 'Use your order number as the reference.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.account_number', '01733333333')
            ->assertJsonPath('data.action', 'Payment')
            ->json('data.id');

        $this->patchJson("/v1/admin/payment-accounts/{$id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson("/v1/admin/payment-accounts/{$id}")->assertNoContent();
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    protected function checkout(array $overrides = []): TestResponse
    {
        return $this->postJson('/v1/checkout', [
            'items' => [['variant_id' => $this->variant->id, 'quantity' => 1]],
            'shipping_method_id' => $this->shipping->id,
            'payment_method' => 'bkash',
            'payment_account_id' => $this->bkash->id,
            'transaction_id' => 'TXN9876543',
            'payment_sender_number' => '01811111111',
            'address' => ['name' => 'Rahim Uddin', 'phone' => '01700000000', 'full_address' => 'House 1, Road 2, Dhanmondi'],
            ...$overrides,
        ]);
    }
}
