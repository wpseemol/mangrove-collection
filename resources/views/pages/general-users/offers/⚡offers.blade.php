<?php

use Livewire\Component;

new class extends Component
{
    public $offers = []; // Example: array of offers

    public function mount()
    {
        // Load offers from database or API
        $this->offers = [
            ['id' => 1, 'title' => '50% Off on Electronics', 'description' => 'Limited time offer'],
            ['id' => 2, 'title' => 'Buy 1 Get 1 Free', 'description' => 'On selected items'],
        ];
    }

    public function applyOffer($offerId)
    {
        // Logic to apply offer
        session()->flash('message', 'Offer applied!');
    }
};
?>

<div>
    <h2 class="text-2xl font-bold mb-4">Latest Offers</h2>

    <div class="space-y-4">
        @foreach($offers as $offer)
            <div class="border p-4 rounded">
                <h3 class="font-semibold">{{ $offer['title'] }}</h3>
                <p>{{ $offer['description'] }}</p>
                <button wire:click="applyOffer({{ $offer['id'] }})" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Apply Offer</button>
            </div>
        @endforeach
    </div>

    @if(session('message'))
        <div class="mt-4 p-2 bg-green-100 text-green-800 rounded">
            {{ session('message') }}
        </div>
    @endif
</div>