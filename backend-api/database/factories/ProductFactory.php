<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'unit' => 'piece',
            'currency' => 'BDT',
            'short_description' => fake()->sentence(),
            'description' => '<p>'.fake()->paragraph().'</p>',
            'thumbnail' => fake()->imageUrl(),
            'tags' => fake()->words(2),
            'status' => ProductStatus::Published,
            'is_featured' => false,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => ProductStatus::Draft]);
    }

    /**
     * Attach a default variant with the given price and stock.
     */
    public function withVariant(float $price = 500, ?int $stock = 10): static
    {
        return $this->has(
            ProductVariant::factory()->state(['price' => $price, 'stock' => $stock, 'is_default' => true]),
            'variants',
        );
    }
}
