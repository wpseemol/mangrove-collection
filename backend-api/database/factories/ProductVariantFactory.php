<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'title' => fake()->randomElement(['Small', 'Medium', 'Large', 'Standard']),
            'type' => 'size',
            'price' => fake()->randomFloat(2, 100, 5000),
            'compare_price' => null,
            'stock' => 20,
            'is_default' => false,
        ];
    }
}
