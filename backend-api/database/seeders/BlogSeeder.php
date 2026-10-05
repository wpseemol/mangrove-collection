<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Database\Seeders\Concerns\StoresSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Starter blog: 5 categories and 15 SEO-focused articles from `database/seeders/data/blog.json`
 * (php artisan db:seed --class=BlogSeeder). Each post has its own cover in `database/seeders/images/blog/<slug>.jpg`.
 * Idempotent: categories are matched by slug and posts whose slug already exists are skipped.
 */
class BlogSeeder extends Seeder
{
    use StoresSeedImages;

    /** Open Graph size, so shared links get a full-width preview. */
    public const COVER_WIDTH = 1200;

    public const COVER_HEIGHT = 630;

    public function run(): void
    {
        $data = json_decode((string) file_get_contents(database_path('seeders/data/blog.json')), true, flags: JSON_THROW_ON_ERROR);
        $adminId = User::query()->where('role', UserRole::Admin)->value('id');

        $categories = [];
        foreach ($data['categories'] as $index => $category) {
            $categories[$category['slug']] = BlogCategory::query()->firstOrCreate(
                ['slug' => $category['slug']],
                [...$category, 'is_active' => true, 'sort_order' => $index],
            )->id;
        }

        $today = now()->startOfSecond();
        $total = count($data['posts']);

        foreach ($data['posts'] as $index => $item) {
            if (BlogPost::query()->where('slug', $item['slug'])->exists()) {
                $this->command?->line("  Skipped {$item['title']} (already exists)");

                continue;
            }

            $cover = $this->storeSeedImage(
                database_path("seeders/images/blog/{$item['slug']}.jpg"),
                'uploads/'.now()->format('Y/m')."/blog-{$item['slug']}-".Str::lower(Str::random(6)).'.jpg',
                self::COVER_WIDTH, self::COVER_HEIGHT, 82, $adminId,
            );

            BlogPost::query()->create([
                'blog_category_id' => $categories[$item['category']],
                'author_id' => $adminId,
                'title' => $item['title'],
                'slug' => $item['slug'],
                'excerpt' => $item['excerpt'],
                'content' => $item['content'],
                'cover_image' => $cover->url(),
                'tags' => $item['tags'],
                'status' => 'published',
                'is_featured' => $item['featured'] ?? false,
                // Spread over the last weeks so "latest" ordering looks natural.
                'published_at' => $today->copy()->subDays(($total - $index) * 2),
                'meta_title' => $item['meta_title'],
                'meta_description' => $item['meta_description'],
            ]);

            $this->command?->info("  Created {$item['title']}");
        }
    }
}
