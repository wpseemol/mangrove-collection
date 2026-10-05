<?php

namespace App\Http\Resources;

use App\Models\ProductReview;
use App\Services\ReviewImageService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public view shows a shortened name only; contact details and the order are staff-only.
 *
 * @mixin ProductReview
 */
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isStaff = (bool) $request->user()?->isStaff();

        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'images' => array_map(fn (string $path) => ['path' => $path, 'url' => ReviewImageService::url($path)], $this->images ?? []),
            'reviewer_name' => $this->displayName(),
            'verified_purchase' => true,
            'status' => $this->status,
            'edited_at' => $this->edited_at,
            'created_at' => $this->created_at,
            $this->mergeWhen($isStaff && $this->relationLoaded('product'), fn () => [
                'reviewer' => [
                    'name' => $this->reviewer_name,
                    'phone' => $this->reviewer_phone,
                    'email' => $this->reviewer_email,
                ],
                'order' => $this->relationLoaded('order') && $this->order ? ['id' => $this->order->id, 'order_number' => $this->order->order_number] : null,
                'product' => $this->product ? [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'slug' => $this->product->slug,
                    'thumbnail' => $this->product->thumbnail,
                ] : null,
            ]),
        ];
    }
}
