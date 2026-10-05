<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use App\Support\ReviewerIdentity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('uploads');
        $this->product = Product::factory()->withVariant(500, 20)->create();
    }

    public function test_only_customers_with_a_delivered_order_can_review(): void
    {
        $this->verify('01712345678')->assertOk()
            ->assertJsonPath('data.status', 'no_order')
            ->assertJsonPath('data.eligible', false)
            ->assertJsonPath('data.token', null);

        $order = $this->order(['status' => OrderStatus::Shipped]);
        $this->verify('01712345678')->assertOk()->assertJsonPath('data.status', 'not_delivered');

        $order->update(['status' => OrderStatus::Cancelled]);
        $this->verify('01712345678')->assertOk()->assertJsonPath('data.status', 'no_order');

        $order->update(['status' => OrderStatus::Delivered, 'delivered_at' => now()]);
        $this->verify('01712345678')->assertOk()
            ->assertJsonPath('data.status', 'can_review')
            ->assertJsonPath('data.eligible', true)
            ->assertJsonPath('data.reviewer_name', 'Rahim U.');
    }

    public function test_phone_in_any_format_or_email_finds_the_order(): void
    {
        $this->order(['customer_phone' => '+880 1712-345678', 'customer_email' => 'Rahim@Example.com']);

        foreach (['01712345678', '+8801712345678', '8801712345678', '1712345678', '017-1234 5678', 'rahim@example.COM'] as $contact) {
            $this->verify($contact)->assertOk()->assertJsonPath('data.status', 'can_review');
        }

        $this->verify('01812345678')->assertOk()->assertJsonPath('data.status', 'no_order');
        $this->verify('other@example.com')->assertOk()->assertJsonPath('data.status', 'no_order');
    }

    public function test_contact_input_is_validated(): void
    {
        foreach (['', '12345', 'not-an-email@', '<script>alert(1)</script>', "1' OR '1'='1"] as $contact) {
            $this->verify($contact)->assertUnprocessable()->assertJsonValidationErrors('contact');
        }
    }

    public function test_buyer_writes_a_review_with_photos(): void
    {
        $this->order();
        $token = $this->tokenFor('01712345678');

        $response = $this->writeReview($token, [
            'rating' => 4,
            'comment' => "  Lovely fabric and the colour is exactly as shown.\n\n\n\nWould buy again.  ",
            'images' => [UploadedFile::fake()->image('a.jpg', 1200, 900), UploadedFile::fake()->image('b.png', 400, 400)],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.rating', 4)
            ->assertJsonPath('data.comment', "Lovely fabric and the colour is exactly as shown.\n\nWould buy again.")
            ->assertJsonPath('data.reviewer_name', 'Rahim U.')
            ->assertJsonPath('data.verified_purchase', true)
            ->assertJsonCount(2, 'data.images')
            ->assertJsonMissingPath('data.reviewer');

        $review = ProductReview::query()->firstOrFail();
        $this->assertSame('01712345678', $review->reviewer_phone);
        foreach ($review->images as $path) {
            $this->assertMatchesRegularExpression('#^reviews/\d{6}/[a-z0-9]{24}\.webp$#', $path);
            Storage::disk('uploads')->assertExists($path);
        }

        $this->product->refresh();
        $this->assertSame(4.0, $this->product->rating_avg);
        $this->assertSame(1, $this->product->rating_count);

        $this->writeReview($token, ['rating' => 5, 'comment' => 'Second review should be blocked.'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('review');

        $this->verify('01712345678')->assertOk()
            ->assertJsonPath('data.status', 'already_reviewed')
            ->assertJsonPath('data.review.id', $review->id);
    }

    public function test_review_fields_are_validated(): void
    {
        $this->order();
        $token = $this->tokenFor('01712345678');

        $this->writeReview($token, ['rating' => 6, 'comment' => 'short'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['rating', 'comment']);

        $this->writeReview($token, ['rating' => 5, 'comment' => 'Great product <script>alert(1)</script>'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('comment');

        $this->writeReview($token, [
            'rating' => 5,
            'comment' => 'Five photos is one too many here.',
            'images' => array_map(fn ($i) => UploadedFile::fake()->image("p{$i}.jpg", 400, 400), range(1, 5)),
        ])->assertUnprocessable()->assertJsonValidationErrors('images');

        $this->writeReview($token, [
            'rating' => 5,
            'comment' => 'This attachment is not an image.',
            'images' => [UploadedFile::fake()->create('evil.php', 10, 'application/x-php')],
        ])->assertUnprocessable()->assertJsonValidationErrors('images.0');

        $this->assertDatabaseCount('product_reviews', 0);
        $this->assertSame([], Storage::disk('uploads')->allFiles());
    }

    public function test_review_token_is_required_and_bound_to_the_product(): void
    {
        $this->order();
        $other = Product::factory()->withVariant(300, 5)->create();
        $body = ['rating' => 5, 'comment' => 'Trying without a valid check.'];

        $this->writeReview(null, $body)->assertForbidden();
        $this->writeReview('garbage', $body)->assertForbidden();

        $otherToken = ReviewerIdentity::fromContact('01712345678')->toToken($other->id);
        $this->writeReview($otherToken, $body)->assertForbidden();

        $expired = Crypt::encryptString(json_encode(['p' => $this->product->id, 'u' => null, 'ph' => '01712345678', 'em' => null, 'exp' => now()->subMinute()->timestamp]));
        $this->writeReview($expired, $body)->assertForbidden();

        $this->assertDatabaseCount('product_reviews', 0);
    }

    public function test_browsers_may_send_the_review_token_header(): void
    {
        $preflight = $this->call('OPTIONS', "/v1/products/{$this->product->slug}/reviews", server: [
            'HTTP_ORIGIN' => 'http://localhost:3000',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'x-review-token',
        ]);

        $preflight->assertNoContent();
        $this->assertStringContainsString('x-review-token', strtolower((string) $preflight->headers->get('Access-Control-Allow-Headers')));
    }

    public function test_buyer_edits_and_deletes_their_review(): void
    {
        $this->order(['customer_email' => 'rahim@example.com']);
        $token = $this->tokenFor('01712345678');

        $created = $this->writeReview($token, [
            'rating' => 2,
            'comment' => 'Arrived late but the quality is fine.',
            'images' => [UploadedFile::fake()->image('a.jpg', 600, 600), UploadedFile::fake()->image('b.jpg', 600, 600)],
        ])->assertCreated();

        [$keep, $drop] = array_column($created->json('data.images'), 'path');
        $id = $created->json('data.id');

        $emailToken = $this->tokenFor('rahim@example.com');
        $this->withHeader('X-Review-Token', $emailToken)
            ->post("/v1/reviews/{$id}", [
                '_method' => 'PUT',
                'rating' => 5,
                'comment' => 'Changed my mind, it is excellent.',
                'keep_images' => [$keep],
                'images' => [UploadedFile::fake()->image('c.jpg', 600, 600)],
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.rating', 5)
            ->assertJsonCount(2, 'data.images')
            ->assertJsonPath('data.images.0.path', $keep);

        Storage::disk('uploads')->assertExists($keep);
        Storage::disk('uploads')->assertMissing($drop);
        $this->assertNotNull(ProductReview::query()->find($id)->edited_at);
        $this->assertSame(5.0, $this->product->refresh()->rating_avg);

        $this->withHeader('X-Review-Token', $emailToken)
            ->putJson("/v1/reviews/{$id}", ['rating' => 5, 'comment' => 'Trying to point at other files.', 'keep_images' => ['../../.env']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('keep_images.0');

        $paths = ProductReview::query()->find($id)->images;
        $foreign = 'reviews/202601/'.str_repeat('a', 24).'.webp';
        $this->withHeader('X-Review-Token', $emailToken)
            ->putJson("/v1/reviews/{$id}", ['rating' => 5, 'comment' => 'A path I do not own is ignored.', 'keep_images' => [...$paths, $foreign]])
            ->assertOk()
            ->assertJsonCount(2, 'data.images');
        $this->withHeader('X-Review-Token', $emailToken)->deleteJson("/v1/reviews/{$id}")->assertNoContent();

        $this->assertDatabaseMissing('product_reviews', ['id' => $id]);
        foreach ($paths as $path) {
            Storage::disk('uploads')->assertMissing($path);
        }
        $this->assertSame(0, $this->product->refresh()->rating_count);
        $this->verify('01712345678')->assertOk()->assertJsonPath('data.status', 'can_review');
    }

    public function test_someone_else_cannot_edit_or_delete_a_review(): void
    {
        $this->order();
        $review = $this->writeReview($this->tokenFor('01712345678'), ['rating' => 5, 'comment' => 'My own honest review.'])->json('data.id');

        $this->order(['customer_phone' => '01812345678', 'customer_name' => 'Karim']);
        $strangerToken = $this->tokenFor('01812345678');

        $this->withHeader('X-Review-Token', $strangerToken)
            ->putJson("/v1/reviews/{$review}", ['rating' => 1, 'comment' => 'Hijacking this review.'])
            ->assertNotFound();
        $this->withHeader('X-Review-Token', $strangerToken)->deleteJson("/v1/reviews/{$review}")->assertNotFound();

        $this->assertDatabaseHas('product_reviews', ['id' => $review, 'rating' => 5]);
    }

    public function test_signed_in_customer_can_check_without_typing_contact(): void
    {
        $user = User::factory()->create(['phone' => '01912345678']);
        $this->order(['user_id' => $user->id, 'customer_phone' => '01900000000', 'customer_email' => null]);

        $this->verify(null)->assertUnprocessable()->assertJsonValidationErrors('contact');

        Sanctum::actingAs($user);
        $token = $this->verify(null)->assertOk()->assertJsonPath('data.status', 'can_review')->json('data.token');

        $this->writeReview($token, ['rating' => 3, 'comment' => 'Decent for the price.'])
            ->assertCreated();
        $this->assertDatabaseHas('product_reviews', ['user_id' => $user->id]);
    }

    public function test_public_listing_shows_published_reviews_with_summary(): void
    {
        $this->order();
        $this->order(['customer_phone' => '01812345678', 'customer_name' => 'Karim']);
        $this->writeReview($this->tokenFor('01712345678'), [
            'rating' => 5, 'comment' => 'Beautiful, exactly as pictured.',
            'images' => [UploadedFile::fake()->image('a.jpg', 600, 600)],
        ])->assertCreated();
        $this->writeReview($this->tokenFor('01812345678'), ['rating' => 3, 'comment' => 'Good but runs a bit small.'])->assertCreated();

        $this->getJson("/v1/products/{$this->product->slug}/reviews")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('summary.average', 4)
            ->assertJsonPath('summary.count', 2)
            ->assertJsonPath('summary.breakdown.5', 1)
            ->assertJsonPath('summary.breakdown.3', 1)
            ->assertJsonPath('summary.with_photos', 1)
            ->assertJsonMissingPath('data.0.reviewer');

        $this->getJson("/v1/products/{$this->product->slug}/reviews?with_photos=1")->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/v1/products/{$this->product->slug}/reviews?rating=3")->assertOk()->assertJsonPath('data.0.rating', 3);
        $this->getJson("/v1/products/{$this->product->slug}/reviews?sort=lowest")->assertOk()->assertJsonPath('data.0.rating', 3);
        $this->getJson("/v1/products/{$this->product->slug}/reviews?sort=drop")->assertUnprocessable();

        $this->getJson("/v1/products/{$this->product->slug}")
            ->assertOk()
            ->assertJsonPath('data.rating.average', 4)
            ->assertJsonPath('data.rating.count', 2);
    }

    public function test_staff_hide_and_delete_reviews(): void
    {
        $this->order();
        $this->order(['customer_phone' => '01812345678', 'customer_name' => 'Karim']);
        $keep = $this->writeReview($this->tokenFor('01712345678'), ['rating' => 5, 'comment' => 'Beautiful, exactly as pictured.'])->json('data.id');
        $spam = $this->writeReview($this->tokenFor('01812345678'), ['rating' => 1, 'comment' => 'Visit my shop for cheaper.'])->json('data.id');

        $this->getJson('/v1/admin/reviews')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/v1/admin/reviews')->assertForbidden();

        Sanctum::actingAs(User::factory()->manager()->create());

        $this->getJson('/v1/admin/reviews?q=Karim')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.reviewer.phone', '01812345678')
            ->assertJsonPath('data.0.product.slug', $this->product->slug)
            ->assertJsonPath('counts.published', 2);

        $this->patchJson("/v1/admin/reviews/{$spam}", ['status' => 'deleted'])->assertUnprocessable();
        $this->patchJson("/v1/admin/reviews/{$spam}", ['status' => 'hidden'])->assertOk()->assertJsonPath('data.status', 'hidden');

        $this->assertSame(5.0, $this->product->refresh()->rating_avg);
        $this->assertSame(1, $this->product->rating_count);
        $this->getJson("/v1/products/{$this->product->slug}/reviews")->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $keep);
        $this->getJson('/v1/admin/reviews?status=hidden')->assertJsonCount(1, 'data')->assertJsonPath('counts.hidden', 1);

        $this->deleteJson("/v1/admin/reviews/{$spam}")->assertNoContent();
        $this->assertDatabaseMissing('product_reviews', ['id' => $spam]);
    }

    public function test_admin_order_list_includes_status_counts(): void
    {
        $this->order();
        $this->order(['status' => OrderStatus::Pending]);
        $this->order(['status' => OrderStatus::Pending]);

        Sanctum::actingAs(User::factory()->manager()->create());

        $this->getJson('/v1/admin/orders')
            ->assertOk()
            ->assertJsonPath('counts.pending', 2)
            ->assertJsonPath('counts.delivered', 1)
            ->assertJsonPath('counts.cancelled', 0);
    }

    private function verify(?string $contact): TestResponse
    {
        return $this->postJson("/v1/products/{$this->product->slug}/reviews/verify", $contact === null ? [] : ['contact' => $contact]);
    }

    private function tokenFor(string $contact): string
    {
        return $this->verify($contact)->assertOk()->json('data.token');
    }

    private function writeReview(?string $token, array $body): TestResponse
    {
        return $this->withHeaders(array_filter(['X-Review-Token' => $token, 'Accept' => 'application/json']))
            ->post("/v1/products/{$this->product->slug}/reviews", $body);
    }

    private function order(array $attributes = []): Order
    {
        static $sequence = 0;
        $sequence++;
        $variant = $this->product->variants->first();

        $order = Order::query()->create([
            'order_number' => 'MCTEST'.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT),
            'customer_name' => 'Rahim Uddin',
            'customer_email' => null,
            'customer_phone' => '01712345678',
            'shipping_address' => ['address' => 'House 1, Road 2', 'city' => 'Dhaka'],
            'shipping_method_title' => 'Inside Dhaka',
            'currency' => 'BDT',
            'subtotal' => 500,
            'shipping_cost' => 60,
            'discount' => 0,
            'total' => 560,
            'payment_method' => 'cod',
            'payment_status' => 'paid',
            'status' => OrderStatus::Delivered,
            'delivered_at' => now(),
            ...$attributes,
        ]);

        $order->items()->create([
            'product_id' => $this->product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $this->product->name,
            'product_slug' => $this->product->slug,
            'unit_price' => 500,
            'quantity' => 1,
            'line_total' => 500,
        ]);

        return $order;
    }
}
