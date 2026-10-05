<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentReviewStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentAccount;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Throwable;

/**
 * Manual wallet payments: the customer sends money to a store account, submits the
 * transaction ID, and staff verify it against the wallet statement.
 */
class PaymentService
{
    public function __construct(
        protected SettingsService $settings,
        protected SmsService $sms,
    ) {}

    /**
     * Methods a customer can choose at checkout, with the accounts to pay into.
     *
     * @return Collection<int, array{method: PaymentMethod, accounts: Collection<int, PaymentAccount>}>
     */
    public function availableMethods(): Collection
    {
        $accounts = PaymentAccount::query()->active()->orderBy('sort_order')->orderBy('id')->get()
            ->groupBy(fn (PaymentAccount $account) => $account->method->value);

        return collect(PaymentMethod::cases())
            ->filter(fn (PaymentMethod $method) => $method->isWallet()
                ? $accounts->has($method->value)
                : (bool) $this->settings->get('cod_enabled', true))
            ->map(fn (PaymentMethod $method) => [
                'method' => $method,
                'accounts' => $accounts->get($method->value, collect())->values(),
            ])
            ->values();
    }

    public function isAvailable(PaymentMethod $method): bool
    {
        return $this->availableMethods()->contains(fn (array $option) => $option['method'] === $method);
    }

    /**
     * The active account the customer says they paid into; it must belong to the chosen wallet.
     */
    public function resolveAccount(PaymentMethod $method, ?int $accountId): PaymentAccount
    {
        $query = PaymentAccount::query()->active()->where('method', $method);

        $account = $accountId ? $query->find($accountId) : $query->orderBy('sort_order')->orderBy('id')->first();

        if (! $account) {
            throw ValidationException::withMessages([
                'payment_account_id' => "This {$method->label()} account is no longer available. Please refresh and choose again.",
            ]);
        }

        return $account;
    }

    /**
     * Records a transaction ID for review. Call inside a transaction holding a lock on the order.
     */
    public function submit(Order $order, PaymentAccount $account, string $transactionId, string $senderNumber): Payment
    {
        if (! $order->acceptsPaymentSubmission()) {
            throw ValidationException::withMessages([
                'transaction_id' => match ($order->payment_status) {
                    PaymentStatus::Verifying => 'We are already checking a payment for this order.',
                    PaymentStatus::Paid => 'This order is already paid.',
                    default => 'This order can no longer accept a payment.',
                },
            ]);
        }

        $alreadyUsed = Payment::query()
            ->where('method', $account->method)
            ->where('transaction_id', $transactionId)
            ->where('status', '!=', PaymentReviewStatus::Rejected)
            ->lockForUpdate()
            ->exists();

        if ($alreadyUsed) {
            throw ValidationException::withMessages([
                'transaction_id' => 'This transaction ID has already been used for another payment.',
            ]);
        }

        $payment = $order->payments()->create([
            'payment_account_id' => $account->id,
            'method' => $account->method,
            'account_type' => $account->account_type,
            'account_number' => $account->account_number,
            'amount' => $order->total,
            'currency' => $order->currency,
            'sender_number' => $senderNumber,
            'transaction_id' => $transactionId,
            'status' => PaymentReviewStatus::Submitted,
        ]);

        $order->forceFill([
            'payment_method' => $account->method,
            'payment_status' => PaymentStatus::Verifying,
        ])->save();

        return $payment;
    }

    /**
     * Customer re-submits after a rejection (or pays later for an order placed without paying).
     */
    public function resubmit(Order $order, int $accountId, string $transactionId, string $senderNumber): Payment
    {
        return DB::transaction(function () use ($order, $accountId, $transactionId, $senderNumber) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            $account = PaymentAccount::query()->active()->find($accountId);

            if (! $account) {
                throw ValidationException::withMessages([
                    'payment_account_id' => 'This account is no longer available. Please refresh and choose again.',
                ]);
            }

            return $this->submit($order, $account, $transactionId, $senderNumber);
        });
    }

    public function verify(Payment $payment, User $reviewer): Payment
    {
        $payment = DB::transaction(function () use ($payment, $reviewer) {
            $payment = $this->lockForReview($payment);
            $order = Order::query()->lockForUpdate()->findOrFail($payment->order_id);

            $payment->forceFill([
                'status' => PaymentReviewStatus::Verified,
                'rejection_reason' => null,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ])->save();

            $order->payment_status = PaymentStatus::Paid;

            if ($order->status === OrderStatus::Pending) {
                $order->status = OrderStatus::Processing;
            }

            $order->save();

            return $payment->setRelation('order', $order);
        });

        $this->notify($payment, 'sms_payment_verified_template');

        return $payment;
    }

    public function reject(Payment $payment, User $reviewer, string $reason): Payment
    {
        $payment = DB::transaction(function () use ($payment, $reviewer, $reason) {
            $payment = $this->lockForReview($payment);
            $order = Order::query()->lockForUpdate()->findOrFail($payment->order_id);

            $payment->forceFill([
                'status' => PaymentReviewStatus::Rejected,
                'rejection_reason' => $reason,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ])->save();

            if ($order->payment_status === PaymentStatus::Verifying) {
                $order->payment_status = PaymentStatus::Failed;
                $order->save();
            }

            return $payment->setRelation('order', $order);
        });

        $this->notify($payment, 'sms_payment_rejected_template');

        return $payment;
    }

    protected function lockForReview(Payment $payment): Payment
    {
        $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);

        if ($payment->status !== PaymentReviewStatus::Submitted) {
            throw new ConflictHttpException("This payment was already {$payment->status->value}.");
        }

        return $payment;
    }

    protected function notify(Payment $payment, string $template): void
    {
        try {
            if (! $this->sms->enabled()) {
                return;
            }

            $order = $payment->order;

            $this->sms->send($order->customer_phone, $this->sms->render($template, [
                'name' => $order->customer_name,
                'order_number' => $order->order_number,
                'method' => $payment->method->label(),
                'amount' => number_format((float) $payment->amount, 2),
                'currency' => $payment->currency,
                'reason' => (string) $payment->rejection_reason,
            ]));
        } catch (Throwable $e) {
            report($e);
        }
    }
}
