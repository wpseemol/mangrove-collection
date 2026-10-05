<?php

namespace App\Enums;

enum BannerType: string
{
    case Slide = 'slide';
    case RightTop = 'right_top';
    case RightBottom = 'right_bottom';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
