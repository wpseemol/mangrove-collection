<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Models\Concerns\HasUniqueSlug;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'category_id', 'name', 'slug', 'unit', 'size', 'currency', 'short_description', 'description',
    'thumbnail', 'tags', 'status', 'is_featured', 'popularity', 'meta_title', 'meta_description', 'created_by',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasUniqueSlug, SoftDeletes;

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'status' => ProductStatus::class,
            'is_featured' => 'boolean',
            'popularity' => 'integer',
        ];
    }

    /**
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', ProductStatus::Published)
            ->whereHas('category', fn (Builder $q) => $q->where('is_active', true));
    }

    /**
     * Adds `min_price` (cheapest variant) as a selectable, sortable column.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function withMinPrice(Builder $query): void
    {
        $query->addSelect(['min_price' => ProductVariant::query()
            ->selectRaw('MIN(price)')
            ->whereColumn('product_variants.product_id', 'products.id'),
        ]);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * @return HasOne<ProductVariant, $this>
     */
    public function defaultVariant(): HasOne
    {
        return $this->hasOne(ProductVariant::class)->where('is_default', true);
    }

    /**
     * @return HasMany<ProductImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
