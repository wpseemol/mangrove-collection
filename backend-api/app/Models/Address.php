<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    protected $fillable = ['user_id', 'label', 'name', 'email', 'phone', 'region', 'city', 'zone', 'landmark', 'full_address', 'is_default'];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    /**
     * @return array<string, string|null>
     */
    public function toShippingArray(): array
    {
        return $this->only(['name', 'email', 'phone', 'region', 'city', 'zone', 'landmark', 'full_address']);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
