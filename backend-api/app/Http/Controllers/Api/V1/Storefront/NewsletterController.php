<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /**
     * Newsletter sign-up. The reply is the same whether the address is new, already subscribed or
     * coming back after unsubscribing, so the form can't be used to find out who is on the list.
     */
    public function store(Request $request): JsonResponse
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => strtolower(trim($request->input('email')))]);
        }

        $data = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'source' => ['nullable', 'string', 'max:50', 'alpha_dash'],
        ]);

        $subscriber = NewsletterSubscriber::query()->firstOrNew(['email' => $data['email']]);

        if ($subscriber->exists) {
            $subscriber->fill(['status' => 'subscribed', 'unsubscribed_at' => null]);
        } else {
            $subscriber->fill(['source' => $data['source'] ?? null, 'ip_address' => $request->ip()]);
        }

        $subscriber->save();

        return response()->json(['message' => "Thanks for subscribing! You'll be the first to hear about fresh arrivals and offers."]);
    }
}
