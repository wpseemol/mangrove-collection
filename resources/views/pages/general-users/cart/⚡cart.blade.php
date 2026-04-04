<?php

use Livewire\Component;

new class extends Component
{
    public $cartItems = []; // Example: array of items

    public function mount()
    {
        // Load cart items from session or database
        $this->cartItems = session('cart', []);
    }

    public function removeItem($index)
    {
        unset($this->cartItems[$index]);
        session(['cart' => $this->cartItems]);
        $this->dispatch('cart-updated'); // Optional: notify other components
    }
};
?>

<div>
    <h2 class="text-2xl font-bold mb-4">Your Cart</h2>

    @if(empty($cartItems))
        <p>Your cart is empty.</p>
    @else
        <div class="space-y-4">
            @foreach($cartItems as $index => $item)
                <div class="flex justify-between items-center border-b pb-2">
                    <span>{{ $item['name'] }}</span>
                    <button wire:click="removeItem({{ $index }})" class="text-red-500">Remove</button>
                </div>
            @endforeach
        </div>
    @endif
</div>