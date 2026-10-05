<?php

namespace App\Enums;

enum PaymentReviewStatus: string
{
    case Submitted = 'submitted';
    case Verified = 'verified';
    case Rejected = 'rejected';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
