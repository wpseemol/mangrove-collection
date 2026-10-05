<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['blog_post_id', 'user_id'])]
class BlogPostLike extends Model
{
    public const UPDATED_AT = null;
}
