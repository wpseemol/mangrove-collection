<?php

namespace App\Http\Resources;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Banner */
class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'image' => $this->image,
            'link_url' => $this->link_url,
            'link_enabled' => $this->link_enabled,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}
