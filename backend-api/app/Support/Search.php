<?php

namespace App\Support;

final class Search
{
    /** `%term%` for a LIKE query, with the user's own `%`, `_` and `\` matched literally. */
    public static function like(string $term): string
    {
        return '%'.addcslashes($term, '%_\\').'%';
    }
}
