<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CashOnDelivery = 'cod';
    case Bkash = 'bkash';
    case Nagad = 'nagad';
    case Rocket = 'rocket';

    /**
     * Mobile wallets are paid manually: the customer sends money to a store
     * account and submits the transaction ID for staff to verify.
     */
    public function isWallet(): bool
    {
        return $this !== self::CashOnDelivery;
    }

    public function label(): string
    {
        return match ($this) {
            self::CashOnDelivery => 'Cash on delivery',
            self::Bkash => 'bKash',
            self::Nagad => 'Nagad',
            self::Rocket => 'Rocket',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return list<string>
     */
    public static function walletValues(): array
    {
        return array_values(array_map(
            fn (self $method) => $method->value,
            array_filter(self::cases(), fn (self $method) => $method->isWallet()),
        ));
    }
}
