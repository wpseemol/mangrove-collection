<?php

namespace App\Models;

use App\Casts\MediaUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogPostMedia extends Model
{
    protected $fillable = ['blog_post_id', 'type', 'provider', 'url', 'caption', 'sort_order'];

    protected $table = 'blog_post_media';

    protected function casts(): array
    {
        return [
            'url' => MediaUrl::class,
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<BlogPost, $this>
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(BlogPost::class, 'blog_post_id');
    }
}
