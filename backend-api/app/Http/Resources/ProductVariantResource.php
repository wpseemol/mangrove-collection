<?php

namespace App\Http\Resources;

use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProductVariant */
class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'compare_price' => $this->compare_price !== null ? (float) $this->compare_price : null,
            'stock' => $this->stock,
            'in_stock' => $this->hasStockFor(1),
            'is_default' => $this->is_default,
            'sort_order' => $this->sort_order,
        ];
    }
}
