<?php

namespace App\Support;

use App\Models\Order;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Crypt;

/**
 * Who is reviewing: a signed-in account and/or the phone or email used on an order.
 *
 * After a successful check the identity travels as an encrypted, expiring token
 * (`X-Review-Token`) bound to one product, so writing, editing and deleting a
 * review never needs the contact again and cannot be forged or reused elsewhere.
 */
final class ReviewerIdentity
{
    public const TOKEN_TTL_MINUTES = 30;

    private function __construct(
        public readonly ?int $userId,
        public readonly ?string $phone,
        public readonly ?string $email,
    ) {}

    /** Accepts one input: a Bangladeshi mobile number (any common format) or an email address. */
    public static function fromContact(string $contact): ?self
    {
        $contact = trim($contact);

        if (str_contains($contact, '@')) {
            $email = mb_strtolower($contact);

            return filter_var($email, FILTER_VALIDATE_EMAIL) && mb_strlen($email) <= 255 ? new self(null, null, $email) : null;
        }

        $phone = self::normalizePhone($contact);

        return $phone ? new self(null, $phone, null) : null;
    }

    public static function fromUser(User $user): self
    {
        return new self($user->id, self::normalizePhone($user->phone), $user->email ? mb_strtolower($user->email) : null);
    }

    /** "+880 1712-345678", "8801712345678", "1712345678" → "01712345678"; anything else → null. */
    public static function normalizePhone(?string $value): ?string
    {
        if ($value === null || preg_match('/^[\d\s\-()+]{10,20}$/', trim($value)) !== 1) {
            return null;
        }

        $digits = preg_replace('/\D/', '', $value);

        if (strlen($digits) === 13 && str_starts_with($digits, '880')) {
            $digits = substr($digits, 2);
        } elseif (strlen($digits) === 10 && str_starts_with($digits, '1')) {
            $digits = '0'.$digits;
        }

        return preg_match('/^01[3-9]\d{8}$/', $digits) === 1 ? $digits : null;
    }

    public static function normalizeEmail(?string $value): ?string
    {
        return filled($value) ? mb_strtolower(trim($value)) : null;
    }

    /**
     * Limits an order query to orders placed by this identity. Phone numbers are
     * stored as typed, so the SQL match is a digits-only suffix that the caller
     * confirms exactly with {@see matchesOrder()}.
     *
     * @param  Builder<Order>  $query
     */
    public function scopeOrders(Builder $query): void
    {
        $query->where(function (Builder $q) {
            if ($this->userId) {
                $q->orWhere('user_id', $this->userId);
            }

            if ($this->email) {
                $q->orWhereRaw('LOWER(customer_email) = ?', [$this->email]);
            }

            if ($this->phone) {
                $q->orWhereRaw(
                    "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') LIKE ?",
                    ['%'.substr($this->phone, 1)],
                );
            }
        });
    }

    public function matchesOrder(Order $order): bool
    {
        return ($this->userId && $order->user_id === $this->userId)
            || ($this->email && self::normalizeEmail($order->customer_email) === $this->email)
            || ($this->phone && self::normalizePhone($order->customer_phone) === $this->phone);
    }

    /**
     * @param  Builder<ProductReview>  $query
     */
    public function scopeReviews(Builder $query): void
    {
        $query->where(function (Builder $q) {
            if ($this->userId) {
                $q->orWhere('user_id', $this->userId);
            }

            if ($this->email) {
                $q->orWhere('reviewer_email', $this->email);
            }

            if ($this->phone) {
                $q->orWhere('reviewer_phone', $this->phone);
            }
        });
    }

    public function owns(ProductReview $review): bool
    {
        return ($this->userId && $review->user_id === $this->userId)
            || ($this->email && $review->reviewer_email === $this->email)
            || ($this->phone && $review->reviewer_phone === $this->phone);
    }

    public function toToken(int $productId): string
    {
        return Crypt::encryptString((string) json_encode([
            'p' => $productId,
            'u' => $this->userId,
            'ph' => $this->phone,
            'em' => $this->email,
            'exp' => now()->addMinutes(self::TOKEN_TTL_MINUTES)->getTimestamp(),
        ]));
    }

    public static function fromToken(?string $token, int $productId): ?self
    {
        if (blank($token) || strlen($token) > 2048) {
            return null;
        }

        try {
            $data = json_decode(Crypt::decryptString($token), true, 4, JSON_THROW_ON_ERROR);
        } catch (DecryptException|\JsonException) {
            return null;
        }

        if (! is_array($data) || ($data['p'] ?? null) !== $productId || ($data['exp'] ?? 0) < now()->getTimestamp()) {
            return null;
        }

        $identity = new self(
            is_int($data['u'] ?? null) ? $data['u'] : null,
            is_string($data['ph'] ?? null) ? $data['ph'] : null,
            is_string($data['em'] ?? null) ? $data['em'] : null,
        );

        return $identity->userId || $identity->phone || $identity->email ? $identity : null;
    }
}
