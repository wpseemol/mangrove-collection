<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    /** A wallet transaction ID was submitted and is waiting for staff to check it. */
    case Verifying = 'verifying';
    case Paid = 'paid';
    case Failed = 'failed';
    case Refunded = 'refunded';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
