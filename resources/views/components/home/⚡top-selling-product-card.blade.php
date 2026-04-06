<?php

use Livewire\Component;

new class extends Component {

    /**
     * @var array{
     *     name: string,
     *     price: int,
     *     old_price: int|null,
     *     image: string,
     *     tag: string|null
     * } $product
     */
    public array $product;

    /**
     * @param array{
     *     name: string,
     *     price: int,
     *     old_price: int|null,
     *     image: string,
     *     tag: string|null
     * } $product
     */
    public function mount(array $product): void
    {
        $this->product = $product;
    }
}; ?>

<div class="bg-white rounded-xl p-4 flex gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
    <span class="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
        {{ $product['tag'] }}
    </span>

    <div class="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
        <img src="{{ $product['image'] }}" alt="{{ $product['name'] }}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500">
    </div>

    <div class="flex flex-col justify-center grow">
        <h3 class="text-slate-700 font-semibold text-base md:text-lg mb-2 leading-snug">
            {{ $product['name'] }}
        </h3>

        <div class="flex items-center gap-2 mb-4">
            <span class="text-primary font-bold text-xl">৳{{ number_format($product['price']) }}</span>
            @if($product['old_price'])
            <span class="text-slate-400 line-through text-sm">৳{{ number_format($product['old_price']) }}</span>
            @endif
        </div>

        <div class="flex gap-2">
            <button class="flex-1 bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold py-2 rounded-md flex items-center justify-center gap-2">
                <i class="fa-solid fa-cart-shopping"></i> Add To Cart
            </button>
            <button class="flex-1 bg-primary text-white hover:bg-primary-dark transition-colors text-xs font-bold py-2 rounded-md flex items-center justify-center gap-2">
                Buy now
            </button>
        </div>
    </div>
</div>