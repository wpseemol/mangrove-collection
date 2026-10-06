<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCatalogAndOrdersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->manager()->create());
    }

    public function test_manager_can_create_and_update_a_product_with_variants(): void
    {
        $category = Category::factory()->create();

        $response = $this->postJson('/v1/admin/products', [
            'category_id' => $category->id,
            'name' => 'Nakshi Kantha',
            'status' => 'published',
            'tags' => ['handmade'],
            'images' => [['url' => 'https://cdn.example.com/1.jpg']],
            'variants' => [
                ['title' => 'Small', 'price' => 1200, 'stock' => 4, 'sku' => 'NK-S'],
                ['title' => 'Large', 'price' => 2200, 'stock' => 2, 'sku' => 'NK-L', 'is_default' => true],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'nakshi-kantha')
            ->assertJsonPath('data.price', 2200)
            ->assertJsonCount(2, 'data.variants')
            ->assertJsonCount(1, 'data.images');

        $productId = $response->json('data.id');
        $small = collect($response->json('data.variants'))->firstWhere('title', 'Small');

        $this->putJson("/v1/admin/products/{$productId}", [
            'variants' => [
                ['id' => $small['id'], 'title' => 'Small', 'price' => 1300, 'stock' => 4, 'sku' => 'NK-S'],
            ],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'data.variants')
            ->assertJsonPath('data.variants.0.id', $small['id'])
            ->assertJsonPath('data.variants.0.is_default', true)
            ->assertJsonPath('data.price', 1300);

        $this->getJson('/v1/products/nakshi-kantha')->assertOk();
    }

    public function test_duplicate_sku_across_products_is_rejected(): void
    {
        $existing = Product::factory()->create();
        $existing->variants()->create(['title' => 'One', 'price' => 10, 'sku' => 'DUP-1', 'is_default' => true]);

        $this->postJson('/v1/admin/products', [
            'category_id' => $existing->category_id,
            'name' => 'Another',
            'variants' => [['title' => 'One', 'price' => 10, 'sku' => 'DUP-1']],
        ])->assertUnprocessable()->assertJsonValidationErrors('variants.0.sku');
    }

    public function test_deleting_a_product_is_a_soft_delete_and_can_be_restored(): void
    {
        $product = Product::factory()->withVariant()->create();

        $this->deleteJson("/v1/admin/products/{$product->id}")->assertNoContent();
        $this->assertSoftDeleted($product);
        $this->getJson("/v1/products/{$product->slug}")->assertNotFound();

        $this->postJson("/v1/admin/products/{$product->id}/restore")->assertOk();
        $this->assertNotSoftDeleted($product);
    }

    public function test_category_with_products_cannot_be_deleted(): void
    {
        $product = Product::factory()->withVariant()->create();

        $this->deleteJson("/v1/admin/categories/{$product->category_id}")->assertStatus(409);
    }

    public function test_category_with_only_trashed_products_can_be_deleted_and_they_restore_into_a_new_one(): void
    {
        $product = Product::factory()->withVariant()->create();
        $product->delete();
        $oldCategory = $product->category;

        $this->deleteJson("/v1/admin/categories/{$oldCategory->id}")->assertNoContent();
        $this->assertModelMissing($oldCategory);
        $this->assertNull($product->fresh()->category_id);

        $this->postJson("/v1/admin/products/{$product->id}/restore")->assertUnprocessable()->assertJsonValidationErrors('category_id');

        $category = Category::factory()->create();
        $this->postJson("/v1/admin/products/{$product->id}/restore", ['category_id' => $category->id])
            ->assertOk()
            ->assertJsonPath('data.category.id', $category->id);
        $this->assertNotSoftDeleted($product);
    }

    public function test_cancelling_an_order_restocks_and_delivering_cod_marks_paid(): void
    {
        $variant = Product::factory()->withVariant(100, 5)->create()->variants->first();
        $shipping = ShippingMethod::factory()->create();

        $place = fn () => app(OrderService::class)->place([
            'items' => [['variant_id' => $variant->id, 'quantity' => 2]],
            'shipping_method_id' => $shipping->id,
            'payment_method' => 'cod',
            'address' => ['name' => 'A', 'phone' => '017', 'full_address' => 'X'],
        ]);

        $first = $place();
        $second = $place();
        $this->assertSame(1, $variant->fresh()->stock);

        $this->patchJson("/v1/admin/orders/{$first->id}", ['status' => 'cancelled'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
        $this->assertSame(3, $variant->fresh()->stock);

        $this->patchJson("/v1/admin/orders/{$first->id}", ['status' => 'processing'])->assertStatus(409);

        $this->patchJson("/v1/admin/orders/{$second->id}", ['status' => 'delivered', 'admin_note' => 'Handed over'])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatus::Paid->value)
            ->assertJsonPath('data.admin_note', 'Handed over');
    }

    public function test_dashboard_returns_stats(): void
    {
        $this->getJson('/v1/admin/dashboard?days=7')
            ->assertOk()
            ->assertJsonStructure(['data' => ['totals', 'orders_by_status', 'sales_chart', 'low_stock', 'recent_orders']])
            ->assertJsonCount(7, 'data.sales_chart');
    }

    public function test_media_upload_stores_images_on_the_public_disk(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/v1/admin/media', [
            'file' => UploadedFile::fake()->image('banner.jpg', 1200, 600),
        ])->assertCreated();

        Storage::disk('public')->assertExists($response->json('data.0.path'));

        $this->postJson('/v1/admin/media', [
            'file' => UploadedFile::fake()->create('evil.svg', 1, 'image/svg+xml'),
        ])->assertUnprocessable();
    }

    public function test_pages_can_be_upserted_and_read_publicly(): void
    {
        $this->putJson('/v1/admin/pages/about', [
            'title' => 'About Mangrove',
            'content' => '<p>Our story</p>',
            'sections' => [['id' => 'intro', 'title' => 'Intro', 'description' => 'Hello']],
        ])->assertCreated();

        $this->getJson('/v1/pages/about')
            ->assertOk()
            ->assertJsonPath('data.title', 'About Mangrove')
            ->assertJsonPath('data.sections.0.id', 'intro');
    }
}
