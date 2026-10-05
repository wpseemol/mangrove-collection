<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\PaymentMethod;
use App\Enums\PaymentReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Rules\SafeText;
use App\Services\PaymentService;
use App\Support\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/**
 * Verification queue for wallet transaction IDs submitted by customers.
 */
class PaymentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'status' => ['nullable', Rule::enum(PaymentReviewStatus::class)],
            'method' => ['nullable', Rule::in(PaymentMethod::walletValues())],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $status = $request->query('status');

        $payments = Payment::query()
            ->with(['order', 'reviewer:id,name'])
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('transaction_id', 'like', Search::like($term))
                ->orWhere('sender_number', 'like', Search::like($term))
                ->orWhere('account_number', 'like', Search::like($term))
                ->orWhereHas('order', fn (Builder $q) => $q
                    ->where('order_number', 'like', Search::like($term))
                    ->orWhere('customer_name', 'like', Search::like($term))
                    ->orWhere('customer_phone', 'like', Search::like($term)))))
            ->when($status, fn (Builder $q, $v) => $q->where('status', $v))
            ->when($request->query('method'), fn (Builder $q, $v) => $q->where('method', $v))
            // Oldest first while reviewing so nobody waits longest; newest first otherwise.
            ->orderBy('created_at', $status === PaymentReviewStatus::Submitted->value ? 'asc' : 'desc')
            ->orderBy('id', $status === PaymentReviewStatus::Submitted->value ? 'asc' : 'desc')
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        return PaymentResource::collection($payments)->additional([
            'counts' => collect(PaymentReviewStatus::cases())->mapWithKeys(fn (PaymentReviewStatus $s) => [
                $s->value => Payment::query()->where('status', $s)->count(),
            ]),
        ]);
    }

    public function verify(Request $request, Payment $payment, PaymentService $payments): PaymentResource
    {
        $payment = $payments->verify($payment, $request->user());

        return new PaymentResource($payment->load(['order', 'reviewer:id,name']));
    }

    public function reject(Request $request, Payment $payment, PaymentService $payments): PaymentResource
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:255', new SafeText],
        ]);

        $payment = $payments->reject($payment, $request->user(), $data['reason']);

        return new PaymentResource($payment->load(['order', 'reviewer:id,name']));
    }
}
