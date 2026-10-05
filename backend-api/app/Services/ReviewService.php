<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\ReviewStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Support\ReviewerIdentity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Verified-buyer reviews: one review per product per customer, allowed once an
 * order containing the product has been delivered.
 */
class ReviewService
{
    public const MAX_IMAGES = 4;

    public function __construct(private readonly ReviewImageService $images) {}

    /**
     * @return array{status: 'can_review'|'already_reviewed'|'not_delivered'|'no_order', order: ?Order, review: ?ProductReview}
     */
    public function check(Product $product, ReviewerIdentity $identity): array
    {
        $review = $this->existingReview($product, $identity);

        if ($review) {
            return ['status' => 'already_reviewed', 'order' => null, 'review' => $review];
        }

        $order = $this->deliveredOrder($product, $identity);

        if ($order) {
            return ['status' => 'can_review', 'order' => $order, 'review' => null];
        }

        $hasOpenOrder = $this->ordersFor($product, $identity)
            ->where('status', '!=', OrderStatus::Cancelled)
            ->get()
            ->contains(fn (Order $o) => $identity->matchesOrder($o));

        return ['status' => $hasOpenOrder ? 'not_delivered' : 'no_order', 'order' => null, 'review' => null];
    }

    /**
     * @param  array{rating: int, comment: string}  $data
     * @param  list<UploadedFile>  $files
     */
    public function create(Product $product, ReviewerIdentity $identity, array $data, array $files): ProductReview
    {
        $check = $this->check($product, $identity);

        if ($check['status'] === 'already_reviewed') {
            throw ValidationException::withMessages(['review' => 'You have already reviewed this product. You can edit your review instead.']);
        }

        if (! $check['order']) {
            throw ValidationException::withMessages(['review' => 'Only customers who received this product can review it.']);
        }

        $order = $check['order'];
        $paths = $this->storeImages($files);

        try {
            $review = DB::transaction(function () use ($product, $order, $identity, $data, $paths) {
                $review = $product->reviews()->create([
                    'order_id' => $order->id,
                    'user_id' => $order->user_id ?? $identity->userId,
                    'reviewer_name' => $order->customer_name,
                    'reviewer_phone' => ReviewerIdentity::normalizePhone($order->customer_phone),
                    'reviewer_email' => ReviewerIdentity::normalizeEmail($order->customer_email),
                    'rating' => $data['rating'],
                    'comment' => $data['comment'],
                    'images' => $paths ?: null,
                    'status' => ReviewStatus::Published,
                ]);

                $this->refreshRating($product);

                return $review;
            });
        } catch (Throwable $e) {
            $this->images->deleteMany($paths);

            throw $e;
        }

        return $review;
    }

    /**
     * @param  array{rating: int, comment: string}  $data
     * @param  list<string>  $keepImages  stored paths the customer kept
     * @param  list<UploadedFile>  $files  newly added photos
     */
    public function update(ProductReview $review, array $data, array $keepImages, array $files): ProductReview
    {
        $current = $review->images ?? [];
        $kept = array_values(array_intersect($current, $keepImages));

        if (count($kept) + count($files) > self::MAX_IMAGES) {
            throw ValidationException::withMessages(['images' => 'You can add up to '.self::MAX_IMAGES.' photos.']);
        }

        $added = $this->storeImages($files);

        try {
            DB::transaction(function () use ($review, $data, $kept, $added) {
                $review->update([
                    'rating' => $data['rating'],
                    'comment' => $data['comment'],
                    'images' => [...$kept, ...$added] ?: null,
                    'edited_at' => now(),
                ]);

                $this->refreshRating($review->product);
            });
        } catch (Throwable $e) {
            $this->images->deleteMany($added);

            throw $e;
        }

        $this->images->deleteMany(array_values(array_diff($current, $kept)));

        return $review;
    }

    public function delete(ProductReview $review): void
    {
        $paths = $review->images;
        $product = $review->product;

        DB::transaction(function () use ($review, $product) {
            $review->delete();
            $this->refreshRating($product);
        });

        $this->images->deleteMany($paths);
    }

    public function setStatus(ProductReview $review, ReviewStatus $status): ProductReview
    {
        DB::transaction(function () use ($review, $status) {
            $review->update(['status' => $status]);
            $this->refreshRating($review->product);
        });

        return $review;
    }

    /** Recomputes the cached average and count from published reviews. */
    public function refreshRating(Product $product): void
    {
        $stats = ProductReview::query()
            ->where('product_id', $product->id)
            ->published()
            ->selectRaw('COUNT(*) as total, AVG(rating) as average')
            ->first();

        $product->forceFill([
            'rating_count' => (int) $stats?->total,
            'rating_avg' => round((float) $stats?->average, 2),
        ])->saveQuietly();
    }

    public function existingReview(Product $product, ReviewerIdentity $identity): ?ProductReview
    {
        return $product->reviews()->tap($identity->scopeReviews(...))->latest('id')->first();
    }

    private function deliveredOrder(Product $product, ReviewerIdentity $identity): ?Order
    {
        return $this->ordersFor($product, $identity)
            ->where('status', OrderStatus::Delivered)
            ->orderByDesc('delivered_at')
            ->get()
            ->first(fn (Order $order) => $identity->matchesOrder($order));
    }

    /**
     * @return Builder<Order>
     */
    private function ordersFor(Product $product, ReviewerIdentity $identity): Builder
    {
        return Order::query()
            ->whereHas('items', fn (Builder $q) => $q->where('product_id', $product->id))
            ->tap($identity->scopeOrders(...))
            ->limit(50);
    }

    /**
     * @param  list<UploadedFile>  $files
     * @return list<string>
     */
    private function storeImages(array $files): array
    {
        $paths = [];

        try {
            foreach ($files as $index => $file) {
                $paths[] = $this->images->store($file, "images.{$index}");
            }
        } catch (Throwable $e) {
            $this->images->deleteMany($paths);

            throw $e;
        }

        return $paths;
    }
}
