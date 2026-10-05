<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPostLike extends Model
{
    protected $fillable = ['blog_post_id', 'user_id'];

    public const UPDATED_AT = null;
}
