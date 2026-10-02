<?php

namespace Database\Factories;

use App\Enums\PaymentAccountType;
use App\Enums\PaymentMethod;
use App\Models\PaymentAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentAccount>
 */
class PaymentAccountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'method' => PaymentMethod::Bkash,
            'account_type' => PaymentAccountType::Personal,
            'account_number' => '017'.fake()->unique()->numerify('########'),
            'account_name' => 'Mangrove Collection',
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function method(PaymentMethod $method): static
    {
        return $this->state(['method' => $method]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
