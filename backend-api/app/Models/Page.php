<?php

namespace App\Models;

use App\Casts\MediaHtml;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['slug', 'title', 'content', 'sections', 'meta_title', 'meta_description', 'is_published'];

    protected function casts(): array
    {
        return [
            'content' => MediaHtml::class,
            'sections' => 'array',
            'is_published' => 'boolean',
        ];
    }
}
