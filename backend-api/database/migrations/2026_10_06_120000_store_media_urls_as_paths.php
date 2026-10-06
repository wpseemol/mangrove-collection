<?php

use App\Support\MediaUrls;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Rows created on a dev machine stored absolute URLs like http://localhost:8080/storage/...;
 * rewrite them to the "/storage/..." paths the MediaUrl and MediaHtml casts now store.
 */
return new class extends Migration
{
    private const URL_COLUMNS = [
        'products' => ['thumbnail'],
        'product_images' => ['url'],
        'blog_posts' => ['cover_image'],
        'blog_post_media' => ['url'],
        'banners' => ['image'],
        'order_items' => ['image'],
        'users' => ['avatar'],
    ];

    private const HTML_COLUMNS = [
        'products' => ['description'],
        'blog_posts' => ['content'],
        'pages' => ['content'],
    ];

    public function up(): void
    {
        foreach (self::URL_COLUMNS as $table => $columns) {
            $this->rewrite($table, $columns, MediaUrls::toPath(...));
        }
        foreach (self::HTML_COLUMNS as $table => $columns) {
            $this->rewrite($table, $columns, MediaUrls::htmlToPaths(...));
        }
    }

    /**
     * @param  list<string>  $columns
     */
    private function rewrite(string $table, array $columns, Closure $convert): void
    {
        if (! Schema::hasTable($table)) {
            return;
        }

        DB::table($table)->select(['id', ...$columns])->orderBy('id')->chunkById(200, function ($rows) use ($table, $columns, $convert) {
            foreach ($rows as $row) {
                $changes = [];
                foreach ($columns as $column) {
                    $value = $row->{$column};
                    if (is_string($value) && ($converted = $convert($value)) !== $value) {
                        $changes[$column] = $converted;
                    }
                }
                if ($changes !== []) {
                    DB::table($table)->where('id', $row->id)->update($changes);
                }
            }
        });
    }

    public function down(): void
    {
        // Paths work under any APP_URL, so there is nothing to undo.
    }
};
