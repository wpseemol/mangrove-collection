<?php

namespace App\Casts;

use App\Support\MediaUrls;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * HTML whose embedded images and videos on our own storage are stored as paths.
 *
 * @implements CastsAttributes<string|null, string|null>
 */
class MediaHtml implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return MediaUrls::htmlToUrls($value);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return MediaUrls::htmlToPaths($value);
    }
}
