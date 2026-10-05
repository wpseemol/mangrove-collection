<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use App\Services\ReviewImageService;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    protected $fillable = [
        'product_id', 'order_id', 'user_id', 'reviewer_name', 'reviewer_phone', 'reviewer_email',
        'rating', 'comment', 'images', 'status', 'edited_at',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'images' => 'array',
            'status' => ReviewStatus::class,
            'edited_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', ReviewStatus::Published);
    }

    /**
     * @return list<string>
     */
    public function imageUrls(): array
    {
        return array_values(array_map(fn (string $path) => ReviewImageService::url($path), $this->images ?? []));
    }

    /** "Rahim Uddin" → "Rahim U." so buyers' full names are never published. */
    public function displayName(): string
    {
        $parts = preg_split('/\s+/u', trim($this->reviewer_name)) ?: [];
        $first = $parts[0] ?? '';

        if ($first === '') {
            return 'Verified buyer';
        }

        return count($parts) > 1 ? $first.' '.mb_strtoupper(mb_substr((string) end($parts), 0, 1)).'.' : $first;
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
