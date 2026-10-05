<?php

namespace App\Http\Resources;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin NewsletterSubscriber */
class NewsletterSubscriberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'status' => $this->status,
            'source' => $this->source,
            'subscribed_at' => $this->created_at,
            'unsubscribed_at' => $this->unsubscribed_at,
        ];
    }
}
