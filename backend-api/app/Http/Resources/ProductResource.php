<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $default = $this->relationLoaded('variants')
            ? ($this->variants->firstWhere('is_default', true) ?? $this->variants->first())
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'unit' => $this->unit,
            'size' => $this->size,
            'currency' => $this->currency,
            'price' => $this->when(
                $default !== null || $this->min_price !== null,
                fn () => (float) ($default?->price ?? $this->min_price),
            ),
            'compare_price' => $this->when($default !== null, fn () => $default->compare_price !== null ? (float) $default->compare_price : null),
            'in_stock' => $this->when(
                $this->relationLoaded('variants'),
                fn () => $this->variants->contains(fn ($variant) => $variant->hasStockFor(1)),
            ),
            'short_description' => $this->short_description,
            'description' => $this->description,
            'thumbnail' => $this->thumbnail,
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->url,
                'alt' => $image->alt,
            ])),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'tags' => $this->tags ?? [],
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'popularity' => $this->popularity,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
