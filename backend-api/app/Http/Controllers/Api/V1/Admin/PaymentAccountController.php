<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PaymentAccountRequest;
use App\Http\Resources\PaymentAccountResource;
use App\Models\PaymentAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Wallet accounts customers send money to. Admin-only: whoever edits these
 * numbers controls where payments go.
 */
class PaymentAccountController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PaymentAccountResource::collection(
            PaymentAccount::query()->withCount('payments')->orderBy('method')->orderBy('sort_order')->orderBy('id')->get()
        );
    }

    public function store(PaymentAccountRequest $request): JsonResponse
    {
        $account = PaymentAccount::query()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return (new PaymentAccountResource($account->refresh()->loadCount('payments')))->response()->setStatusCode(201);
    }

    public function show(PaymentAccount $paymentAccount): PaymentAccountResource
    {
        return new PaymentAccountResource($paymentAccount->loadCount('payments'));
    }

    public function update(PaymentAccountRequest $request, PaymentAccount $paymentAccount): PaymentAccountResource
    {
        $paymentAccount->update($request->validated());

        return new PaymentAccountResource($paymentAccount->loadCount('payments'));
    }

    /**
     * Past payments keep a snapshot of the account number, so deleting is safe.
     */
    public function destroy(PaymentAccount $paymentAccount): JsonResponse
    {
        $paymentAccount->delete();

        return response()->json(null, 204);
    }
}
