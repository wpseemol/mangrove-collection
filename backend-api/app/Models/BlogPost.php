<?php

namespace App\Models;

use App\Casts\MediaHtml;
use App\Casts\MediaUrl;
use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlogPost extends Model
{
    use HasUniqueSlug;

    protected $fillable = [
        'blog_category_id', 'author_id', 'title', 'slug', 'excerpt', 'content', 'cover_image', 'tags',
        'status', 'is_featured', 'published_at', 'views', 'meta_title', 'meta_description',
    ];

    public const STATUSES = ['draft', 'published'];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'content' => MediaHtml::class,
            'cover_image' => MediaUrl::class,
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'views' => 'integer',
        ];
    }

    protected function slugSource(): ?string
    {
        return $this->title;
    }

    /**
     * Published posts whose date has come, outside hidden categories.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', 'published')
            ->where('published_at', '<=', now())
            ->where(fn (Builder $q) => $q
                ->whereNull('blog_category_id')
                ->orWhereHas('category', fn (Builder $q) => $q->where('is_active', true)));
    }

    /**
     * @return BelongsTo<BlogCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * @return HasMany<BlogPostMedia, $this>
     */
    public function media(): HasMany
    {
        return $this->hasMany(BlogPostMedia::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * @return HasMany<BlogComment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(BlogComment::class);
    }

    /**
     * @return HasMany<BlogPostLike, $this>
     */
    public function likes(): HasMany
    {
        return $this->hasMany(BlogPostLike::class);
    }
}
