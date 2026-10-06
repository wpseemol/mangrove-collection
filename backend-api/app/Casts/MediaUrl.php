<?php

namespace App\Casts;

use App\Support\MediaUrls;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * @implements CastsAttributes<string|null, string|null>
 */
class MediaUrl implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return MediaUrls::toUrl($value);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return MediaUrls::toPath($value);
    }
}
