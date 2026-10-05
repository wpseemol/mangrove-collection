<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

/**
 * Local/demo data only: php artisan db:seed --class=DemoCatalogSeeder
 */
class DemoCatalogSeeder extends Seeder
{
    public function run(): void
    {
        Category::factory()
            ->count(4)
            ->create()
            ->each(function (Category $category) {
                Product::factory()
                    ->count(6)
                    ->for($category)
                    ->create()
                    ->each(function (Product $product) {
                        ProductVariant::factory()->for($product)->create(['title' => 'Standard', 'is_default' => true]);
                        ProductVariant::factory()->for($product)->create(['title' => 'Large']);
                    });
            });
    }
}
