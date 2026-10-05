<?php

namespace App\Http\Resources;

use App\Models\PaymentAccount;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PaymentAccount */
class PaymentAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isStaff = (bool) $request->user()?->isStaff();

        return [
            'id' => $this->id,
            'method' => $this->method,
            'account_type' => $this->account_type,
            'action' => $this->account_type->action(),
            'account_number' => $this->account_number,
            'account_name' => $this->account_name,
            'instructions' => $this->instructions,
            'is_active' => $this->when($isStaff, $this->is_active),
            'sort_order' => $this->when($isStaff, $this->sort_order),
            'payments_count' => $this->whenCounted('payments'),
            'created_at' => $this->when($isStaff, $this->created_at),
            'updated_at' => $this->when($isStaff, $this->updated_at),
        ];
    }
}
