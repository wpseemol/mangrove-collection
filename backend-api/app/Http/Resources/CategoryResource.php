<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Services\CategoryImageService;
use App\Support\CategoryIcons;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Category */
class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image' => CategoryImageService::url($this->image),
            'icon' => $this->icon,
            'icon_nodes' => CategoryIcons::find($this->icon)['nodes'] ?? null,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'products_count' => $this->whenCounted('products'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
