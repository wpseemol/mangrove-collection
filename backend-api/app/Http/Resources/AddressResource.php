<?php

namespace App\Http\Resources;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Address */
class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'region' => $this->region,
            'city' => $this->city,
            'zone' => $this->zone,
            'landmark' => $this->landmark,
            'full_address' => $this->full_address,
            'is_default' => $this->is_default,
            'created_at' => $this->created_at,
        ];
    }
}
