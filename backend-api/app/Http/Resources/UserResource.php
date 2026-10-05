<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'has_password' => $this->password !== null,
            'google_linked' => $this->google_id !== null,
            'email_verified_at' => $this->email_verified_at,
            'last_login_at' => $this->last_login_at,
            'orders_count' => $this->whenCounted('orders'),
            'created_at' => $this->created_at,
        ];
    }
}
