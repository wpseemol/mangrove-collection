<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CashOnDelivery = 'cod';
    case Bkash = 'bkash';
    case Nagad = 'nagad';
    case Rocket = 'rocket';

    public function requiresTransactionId(): bool
    {
        return $this !== self::CashOnDelivery;
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
