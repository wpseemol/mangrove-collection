<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_published_products_in_active_categories_are_listed(): void
    {
        $visible = Product::factory()->withVariant(300)->create();
        Product::factory()->draft()->withVariant()->create();
        Product::factory()->withVariant()->for(Category::factory()->inactive())->create();

        $this->getJson('/v1/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $visible->slug)
            ->assertJsonPath('data.0.price', 300)
            ->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_products_can_be_filtered_and_sorted(): void
    {
        $shirts = Category::factory()->create(['name' => 'Shirts']);
        Product::factory()->withVariant(900)->for($shirts)->create(['name' => 'Linen Shirt']);
        Product::factory()->withVariant(400)->for($shirts)->create(['name' => 'Cotton Shirt']);
        Product::factory()->withVariant(100)->create(['name' => 'Cap']);

        $this->getJson('/v1/products?category=shirts&sort=price_asc')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Cotton Shirt')
            ->assertJsonPath('data.1.name', 'Linen Shirt');

        $this->getJson('/v1/products?category=shirts,'.Product::query()->where('name', 'Cap')->first()->category->slug)
            ->assertJsonCount(3, 'data');
        $this->getJson('/v1/products?q=linen')->assertJsonCount(1, 'data');
        $this->getJson('/v1/products?max_price=450')->assertJsonCount(2, 'data');
    }

    public function test_product_detail_by_slug_and_drafts_are_hidden(): void
    {
        $product = Product::factory()->withVariant()->create(['name' => 'Jamdani Saree']);
        $draft = Product::factory()->draft()->withVariant()->create();

        $this->getJson('/v1/products/jamdani-saree')
            ->assertOk()
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonStructure(['data' => ['variants', 'images', 'category', 'description']]);

        $this->getJson("/v1/products/{$draft->slug}")
            ->assertNotFound()
            ->assertJson(['message' => 'Resource not found.']);
    }

    public function test_categories_list_with_published_product_counts(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(2)->withVariant()->for($category)->create();
        Product::factory()->draft()->withVariant()->for($category)->create();

        $this->getJson('/v1/categories')
            ->assertOk()
            ->assertJsonPath('data.0.products_count', 2);
    }
}
