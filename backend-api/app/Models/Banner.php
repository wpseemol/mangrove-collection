<?php

namespace App\Models;

use App\Enums\BannerType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['type', 'title', 'subtitle', 'image', 'link_url', 'link_enabled', 'is_active', 'sort_order'])]
class Banner extends Model
{
    protected function casts(): array
    {
        return [
            'type' => BannerType::class,
            'link_enabled' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
