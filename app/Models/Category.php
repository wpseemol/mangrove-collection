<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public static function getCategories(): Collection
    {
        return self::where('draft', false)
            ->orderBy('position', 'asc')
            ->select('id', 'name', 'slug', 'image')
            // ->withCount('products') // Highly recommended for performance
            ->get();
    }
}
