<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\Concerns\StoresSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * Mangrove Collection catalog: 5 categories and the products in `database/seeders/data/catalog.json`,
 * each with its photo from `database/seeders/images/catalog/<slug>.jpg`.
 *
 *   php artisan db:seed --class=CatalogSeeder         adds missing products, skips slugs that already exist
 *   php artisan db:seed --class=FreshCatalogSeeder    removes every existing product and category first
 */
class CatalogSeeder extends Seeder
{
    use StoresSeedImages;

    /** Storefront product frames are square, so every photo is center-cropped to exactly this size. */
    public const IMAGE_SIZE = 1000;

    public const CATEGORIES = [
        [
            'slug' => 'sundarban-honey',
            'name' => 'Sundarban Honey',
            'icon' => 'droplet',
            'description' => 'Raw, unprocessed honey collected by Moual honey hunters from the Sundarban mangrove forest.',
        ],
        [
            'slug' => 'sea-fish',
            'name' => 'Sea & Estuary Fish',
            'icon' => 'fish',
            'description' => 'Fresh saltwater and estuary fish from the Bay of Bengal and Sundarban rivers: koral, pomfret, parshe, tengra and more.',
        ],
        [
            'slug' => 'shrimp-crab',
            'name' => 'Shrimp & Crab',
            'icon' => 'shrimp',
            'description' => 'Golda and bagda prawn, horina shrimp and live Sundarban mud crab, packed on ice.',
        ],
        [
            'slug' => 'river-fish',
            'name' => 'River Fish',
            'icon' => 'waves-horizontal',
            'description' => 'Rui, katla and mixed small river fish, fresh from local rivers and ponds.',
        ],
        [
            'slug' => 'fruits',
            'name' => 'Seasonal Fruits',
            'icon' => 'citrus',
            'description' => 'Chemical-free seasonal fruits straight from Satkhira orchards, like Himsagar and Gobindabhog mangoes.',
        ],
    ];

    protected bool $replace = false;

    public function run(): void
    {
        $adminId = User::query()->where('role', UserRole::Admin)->value('id');

        if ($this->replace) {
            $this->removeExistingCatalog();
        }

        $categories = [];
        foreach (self::CATEGORIES as $index => $data) {
            $fields = [...$data, 'is_active' => true, 'sort_order' => $index];
            $category = Category::query()->firstOrNew(['slug' => $data['slug']]);
            $category->fill($category->exists ? $fields : [...$fields, 'created_by' => $adminId])->save();
            $categories[$data['slug']] = $category;
        }

        $products = json_decode((string) file_get_contents(database_path('seeders/data/catalog.json')), true, flags: JSON_THROW_ON_ERROR);

        foreach ($products as $index => $data) {
            if (Product::withTrashed()->where('slug', $data['slug'])->exists()) {
                $this->command?->line("  Skipped {$data['name']} (already exists)");

                continue;
            }

            $media = $this->storeSeedImage(
                database_path("seeders/images/catalog/{$data['slug']}.jpg"),
                'uploads/'.now()->format('Y/m')."/{$data['slug']}-".Str::lower(Str::random(8)).'.jpg',
                self::IMAGE_SIZE, self::IMAGE_SIZE, 85, $adminId,
            );

            try {
                $this->createProduct($data, max(0, 100 - $index * 5), $categories[$data['category']], $media->url(), $adminId);
            } catch (Throwable $e) {
                Storage::disk($media->disk)->delete($media->path);
                $media->delete();

                throw $e;
            }

            $this->command?->info("  Created {$data['name']}");
        }
    }

    /**
     * Keeps order history intact: products that appear in orders are soft-deleted (and their slug and SKUs
     * freed), everything else is deleted. Old categories are deleted when empty, otherwise hidden.
     */
    protected function removeExistingCatalog(): void
    {
        $ordered = OrderItem::query()->whereNotNull('product_id')->distinct()->pluck('product_id')->flip();
        $deleted = 0;
        $archived = 0;

        foreach (Product::withTrashed()->get(['id', 'slug', 'deleted_at']) as $product) {
            if (! $ordered->has($product->id)) {
                $product->forceDelete();
                $deleted++;

                continue;
            }

            DB::transaction(function () use ($product) {
                ProductVariant::query()->where('product_id', $product->id)->update(['sku' => null]);
                Product::withTrashed()->whereKey($product->id)->update([
                    'deleted_at' => $product->deleted_at ?? now(),
                    'slug' => str_contains($product->slug, '-removed-') ? $product->slug : "{$product->slug}-removed-{$product->id}",
                    'is_featured' => false,
                ]);
            });
            $archived++;
        }

        $keep = array_column(self::CATEGORIES, 'slug');
        foreach (Category::query()->whereNotIn('slug', $keep)->withCount(['products' => fn ($q) => $q->withTrashed()])->get() as $category) {
            $category->products_count === 0 ? $category->delete() : $category->update(['is_active' => false]);
        }

        $this->command?->line("  Removed {$deleted} products, archived {$archived} that appear in orders");
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function createProduct(array $data, int $popularity, Category $category, string $url, ?int $adminId): void
    {
        DB::transaction(function () use ($data, $popularity, $category, $url, $adminId) {
            $product = Product::query()->create([
                'category_id' => $category->id,
                'name' => $data['name'],
                'slug' => $data['slug'],
                'unit' => $data['unit'],
                'currency' => 'BDT',
                'short_description' => $data['short_description'],
                'description' => $data['description'],
                'thumbnail' => $url,
                'tags' => $data['tags'],
                'status' => ProductStatus::Published,
                'is_featured' => $data['featured'],
                'popularity' => $popularity,
                'meta_title' => self::clip("{$data['name']} | Mangrove Collection", 255),
                'meta_description' => self::clip($data['short_description'], 160),
                'created_by' => $adminId,
            ]);

            $product->images()->create(['url' => $url, 'alt' => $data['name'], 'sort_order' => 0]);

            foreach ($data['variants'] as $index => $variant) {
                $product->variants()->create([
                    'title' => $variant['title'],
                    'type' => $variant['type'],
                    'sku' => 'MC-'.Str::upper($data['slug']).'-'.($index + 1),
                    'price' => $variant['price'],
                    'compare_price' => null,
                    'stock' => 100,
                    'is_default' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        });
    }

    /** Shortens at a word boundary so the result (with the ellipsis) stays within $max characters. */
    public static function clip(string $value, int $max): string
    {
        if (mb_strlen($value) <= $max) {
            return $value;
        }

        $cut = mb_strrpos(mb_substr($value, 0, $max - 1), ' ');

        return mb_substr($value, 0, $cut === false ? 0 : $cut).'…';
    }
}
