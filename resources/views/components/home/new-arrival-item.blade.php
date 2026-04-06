<?php

use Livewire\Component;

new class extends Component {
    public array $product;
    public function mount(array $product): void
    {
        $this->product = $product;
    }
}; ?>

<div class="bg-white border border-gray-200 rounded-lg p-3 h-full flex flex-col hover:border-primary transition-colors group relative">
    <div class="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
        @if($product['tag'])
        <span class="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded italic">
            {{ $product['tag'] }}
        </span>
        @else
        <span></span>
        @endif

        @if(isset($product['save']))
        <span class="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            Save {{ $product['save'] }}
        </span>
        @endif
    </div>

    <div class="aspect-square bg-[#f9f9f9] rounded-lg flex items-center justify-center overflow-hidden relative">
        <img src="{{ $product['image'] }}"
            alt="{{ $product['name'] }}"
            loading="lazy"
            class=" max-h-[65%] object-contain hover:scale-110 transition-transform duration-700 ease-in-out">
    </div>

    <div class="grow flex flex-col">
        <h3 class="text-slate-700 text-xs md:text-sm font-medium line-clamp-2 h-10 mb-1">
            {{ $product['name'] }}
        </h3>

        <div class="flex items-center gap-2 mb-2">
            <span class="text-primary font-bold text-sm md:text-base">৳{{ number_format($product['price']) }}</span>
            @if(isset($product['old_price']))
            <span class="text-slate-400 line-through text-[10px] md:text-xs font-light">৳{{ number_format($product['old_price']) }}</span>
            @endif
        </div>

        <div class="mt-auto grid grid-cols-2 gap-1.5">
            <button class="border border-primary-light text-primary md:text-[10px] font-bold py-2 rounded-md hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1">
                <i class="fa-solid fa-cart-shopping"></i> Add To Cart
            </button>
            <button class="bg-primary text-white text-[9px] md:text-[10px] font-bold py-2 rounded-md hover:bg-primary-light transition-all flex items-center justify-center">
                Buy Now
            </button>
        </div>
    </div>
</div>