<?php

namespace App\Models;

use App\Enums\PaymentAccountType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentReviewStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A wallet transaction ID submitted by a customer. Account details are
 * snapshotted so the record stays accurate if the account is later edited.
 */
class Payment extends Model
{
    protected $fillable = [
        'order_id', 'payment_account_id', 'method', 'account_type', 'account_number', 'amount', 'currency',
        'sender_number', 'transaction_id', 'status', 'rejection_reason', 'reviewed_by', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'method' => PaymentMethod::class,
            'account_type' => PaymentAccountType::class,
            'status' => PaymentReviewStatus::class,
            'amount' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<PaymentAccount, $this>
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(PaymentAccount::class, 'payment_account_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
