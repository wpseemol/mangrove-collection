<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

/**
 * Starter catalog with real product photos: php artisan db:seed --class=SundarbanCatalogSeeder
 *
 * Idempotent: products whose slug already exists are skipped.
 */
class SundarbanCatalogSeeder extends Seeder
{
    /** Storefront product frames are square, so every photo is center-cropped to exactly this size. */
    public const IMAGE_SIZE = 1000;

    public function run(): void
    {
        $adminId = User::query()->where('role', UserRole::Admin)->value('id');

        $categories = [
            'honey' => $this->category('honey', 'Mangrove Raw Honey', $adminId),
            'fish' => $this->category('seawater-fish', 'Seawater Fish', $adminId),
        ];

        foreach ($this->products() as $data) {
            if (Product::withTrashed()->where('slug', $data['slug'])->exists()) {
                $this->command?->line("  Skipped {$data['name']} (already exists)");

                continue;
            }

            $media = $this->storeSquareImage($data['image'], $data['slug'], $adminId);

            try {
                $this->createProduct($data, $categories[$data['category']], $media->url(), $adminId);
            } catch (Throwable $e) {
                Storage::disk($media->disk)->delete($media->path);
                $media->delete();

                throw $e;
            }

            $this->command?->info("  Created {$data['name']}");
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function createProduct(array $data, Category $category, string $url, ?int $adminId): void
    {
        DB::transaction(function () use ($data, $category, $url, $adminId) {
            $product = Product::query()->create([
                'category_id' => $category->id,
                'name' => $data['name'],
                'slug' => $data['slug'],
                'unit' => $data['unit'],
                'size' => $data['size'],
                'currency' => 'BDT',
                'short_description' => $data['short_description'],
                'description' => $data['description'],
                'thumbnail' => $url,
                'tags' => $data['tags'],
                'status' => ProductStatus::Published,
                'is_featured' => $data['featured'],
                'popularity' => $data['popularity'],
                'meta_title' => $data['name'].' | Mangrove Collection',
                'meta_description' => $data['short_description'],
                'created_by' => $adminId,
            ]);

            $product->images()->create(['url' => $url, 'alt' => $data['name'], 'sort_order' => 0]);

            foreach ($data['variants'] as $index => $variant) {
                $product->variants()->create([
                    ...$variant,
                    'is_default' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        });
    }

    protected function category(string $slug, string $name, ?int $adminId): Category
    {
        return Category::query()->firstOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'is_active' => true, 'created_by' => $adminId],
        );
    }

    /**
     * Center-crops to 1:1, resizes to IMAGE_SIZE and stores a JPEG in the media library.
     */
    protected function storeSquareImage(string $file, string $slug, ?int $adminId): Media
    {
        $source = database_path("seeders/images/products/{$file}");
        $image = is_file($source) ? imagecreatefromstring((string) file_get_contents($source)) : false;

        if ($image === false) {
            throw new RuntimeException("Seed image missing or unreadable: {$source}");
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $side = min($width, $height);

        $square = imagecreatetruecolor(self::IMAGE_SIZE, self::IMAGE_SIZE);
        imagecopyresampled(
            $square, $image,
            0, 0, intdiv($width - $side, 2), intdiv($height - $side, 2),
            self::IMAGE_SIZE, self::IMAGE_SIZE, $side, $side,
        );

        ob_start();
        imagejpeg($square, null, 85);
        $jpeg = (string) ob_get_clean();

        $path = 'uploads/'.now()->format('Y/m')."/{$slug}-".Str::lower(Str::random(8)).'.jpg';
        Storage::disk('public')->put($path, $jpeg);

        return Media::query()->create([
            'disk' => 'public',
            'path' => $path,
            'original_name' => $file,
            'mime_type' => 'image/jpeg',
            'size' => strlen($jpeg),
            'uploaded_by' => $adminId,
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function products(): array
    {
        return [
            [
                'category' => 'honey',
                'name' => 'Sundarban Khalisha Flower Honey',
                'slug' => 'sundarban-khalisha-flower-honey',
                'image' => 'sundarban-khalisha-honey.jpg',
                'unit' => 'jar',
                'size' => '500 g',
                'short_description' => 'Light, golden and mildly floral raw honey collected by Mouals from Khalisha blossoms deep in the Sundarbans.',
                'description' => '<p>Khalisha honey is the first and most prized harvest of the Sundarban season. It is light golden, smooth and delicately floral.</p><ul><li>100% raw and unprocessed, never heated</li><li>No added sugar, syrup or preservatives</li><li>Collected by traditional Moual honey hunters</li></ul><p>Natural honey may crystallise in cool weather. Place the jar in warm water to make it runny again.</p>',
                'tags' => ['honey', 'raw honey', 'khalisha', 'sundarban'],
                'featured' => true,
                'popularity' => 95,
                'variants' => [
                    ['title' => '500 g', 'type' => 'Weight', 'sku' => 'HNY-KHL-500', 'price' => 750, 'compare_price' => 850, 'stock' => 60],
                    ['title' => '1 kg', 'type' => 'Weight', 'sku' => 'HNY-KHL-1000', 'price' => 1400, 'compare_price' => 1600, 'stock' => 40],
                ],
            ],
            [
                'category' => 'honey',
                'name' => 'Sundarban Goran Flower Honey',
                'slug' => 'sundarban-goran-flower-honey',
                'image' => 'sundarban-goran-honey.jpg',
                'unit' => 'jar',
                'size' => '500 g',
                'short_description' => 'Dark amber honey from Goran mangrove flowers, rich and bold with a gentle bitter-sweet finish.',
                'description' => '<p>Goran honey comes from the small white flowers of the Goran mangrove. It is darker and stronger than Khalisha, with a deep caramel taste.</p><ul><li>Raw, unfiltered and never heated</li><li>Naturally rich in minerals</li><li>Great with tea, lemon water or warm milk</li></ul>',
                'tags' => ['honey', 'raw honey', 'goran', 'sundarban'],
                'featured' => false,
                'popularity' => 70,
                'variants' => [
                    ['title' => '500 g', 'type' => 'Weight', 'sku' => 'HNY-GRN-500', 'price' => 650, 'compare_price' => null, 'stock' => 50],
                    ['title' => '1 kg', 'type' => 'Weight', 'sku' => 'HNY-GRN-1000', 'price' => 1200, 'compare_price' => 1300, 'stock' => 30],
                ],
            ],
            [
                'category' => 'fish',
                'name' => 'Fresh Padma-Meghna Hilsa (Ilish)',
                'slug' => 'fresh-hilsa-ilish',
                'image' => 'fresh-hilsa.jpg',
                'unit' => 'kg',
                'size' => '1–1.2 kg per fish',
                'short_description' => 'Large, oily river-sea hilsa with bright silver scales, cleaned on request and delivered chilled.',
                'description' => '<p>Big, fatty hilsa caught at the river mouth where the Meghna meets the Bay of Bengal. Each fish weighs roughly 1 to 1.2 kg.</p><ul><li>Packed on ice the same day it is landed</li><li>Free scaling and cutting on request</li><li>Best for shorshe ilish, bhapa and fry</li></ul>',
                'tags' => ['fish', 'hilsa', 'ilish', 'sea fish'],
                'featured' => true,
                'popularity' => 100,
                'variants' => [
                    ['title' => '1 kg', 'type' => 'Weight', 'sku' => 'FSH-HLS-1000', 'price' => 1800, 'compare_price' => 2000, 'stock' => 25],
                    ['title' => '2 kg', 'type' => 'Weight', 'sku' => 'FSH-HLS-2000', 'price' => 3500, 'compare_price' => 4000, 'stock' => 15],
                ],
            ],
            [
                'category' => 'fish',
                'name' => 'Fresh Bhetki (Sea Bass)',
                'slug' => 'fresh-bhetki-sea-bass',
                'image' => 'fresh-bhetki.jpg',
                'unit' => 'kg',
                'size' => '2–3 kg per fish',
                'short_description' => 'Firm, white and mild Bhetki from the Sundarban estuary, perfect for fillets, paturi and fish fry.',
                'description' => '<p>Bhetki (Asian sea bass) has thick, boneless white flesh with a clean, mild taste. Each fish weighs about 2 to 3 kg.</p><ul><li>Whole fish, or cut into fillets or steaks on request</li><li>Delivered chilled in insulated packing</li></ul>',
                'tags' => ['fish', 'bhetki', 'sea bass', 'sea fish'],
                'featured' => true,
                'popularity' => 80,
                'variants' => [
                    ['title' => '1 kg', 'type' => 'Weight', 'sku' => 'FSH-BHT-1000', 'price' => 950, 'compare_price' => null, 'stock' => 30],
                    ['title' => '2 kg', 'type' => 'Weight', 'sku' => 'FSH-BHT-2000', 'price' => 1850, 'compare_price' => 1900, 'stock' => 20],
                ],
            ],
            [
                'category' => 'fish',
                'name' => 'Fresh Silver Pomfret (Rupchanda)',
                'slug' => 'fresh-silver-pomfret-rupchanda',
                'image' => 'fresh-pomfret.jpg',
                'unit' => 'kg',
                'size' => '3–4 fish per kg',
                'short_description' => 'Shiny, soft-fleshed Rupchanda from the Bay of Bengal, a family favourite for fry and curry.',
                'description' => '<p>Silver pomfret is prized for its soft, sweet white flesh and very few bones. About 3 to 4 fish make up one kilogram.</p><ul><li>Caught by local fishing boats and sent on ice</li><li>Ideal for fry, curry or grilling</li></ul>',
                'tags' => ['fish', 'pomfret', 'rupchanda', 'sea fish'],
                'featured' => false,
                'popularity' => 75,
                'variants' => [
                    ['title' => '1 kg', 'type' => 'Weight', 'sku' => 'FSH-PMF-1000', 'price' => 1300, 'compare_price' => 1450, 'stock' => 20],
                    ['title' => '2 kg', 'type' => 'Weight', 'sku' => 'FSH-PMF-2000', 'price' => 2550, 'compare_price' => 2900, 'stock' => 10],
                ],
            ],
            [
                'category' => 'fish',
                'name' => 'Fresh Parshe (Gold-spot Mullet)',
                'slug' => 'fresh-parshe-mullet',
                'image' => 'fresh-parshe.jpg',
                'unit' => 'kg',
                'size' => '10–14 fish per kg',
                'short_description' => 'Small, tender Parshe from Sundarban brackish water, delicious in light jhol or crispy fry.',
                'description' => '<p>Parshe is a small mullet from the brackish rivers of the Sundarbans, known for its soft, sweet flesh. About 10 to 14 fish make up one kilogram.</p><ul><li>Cleaned and gutted on request</li><li>Delivered chilled on ice</li></ul>',
                'tags' => ['fish', 'parshe', 'mullet', 'sundarban'],
                'featured' => false,
                'popularity' => 60,
                'variants' => [
                    ['title' => '1 kg', 'type' => 'Weight', 'sku' => 'FSH-PRS-1000', 'price' => 850, 'compare_price' => null, 'stock' => 25],
                    ['title' => '500 g', 'type' => 'Weight', 'sku' => 'FSH-PRS-500', 'price' => 450, 'compare_price' => null, 'stock' => 30],
                ],
            ],
        ];
    }
}
