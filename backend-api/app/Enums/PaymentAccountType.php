<?php

namespace App\Enums;

/** The wallet account type decides which menu option the customer uses to pay. */
enum PaymentAccountType: string
{
    case Personal = 'personal';
    case Agent = 'agent';
    case Merchant = 'merchant';

    public function action(): string
    {
        return match ($this) {
            self::Personal => 'Send Money',
            self::Agent => 'Cash Out',
            self::Merchant => 'Payment',
        };
    }
}
