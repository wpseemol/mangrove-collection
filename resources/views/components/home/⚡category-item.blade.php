<?php

use Livewire\Component;

new class extends Component {
    /**
     * @var array{name: string, image: string, count: int | string} $category
     */
    public array $category;

    /**
     * @param array{name: string, image: string, count: int | string} $category
     */
    public function mount(array $category): void
    {
        $this->category = $category;
    }
}; ?>

<div class="category-cart-item group cursor-pointer bg-white border border-gray-100 py-2 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 text-center">
    <div class="relative overflow-hidden rounded-2xl aspect-square flex items-center justify-center px-4 pt-4 pb-2">
        <img src="{{ $category['image'] }}"
            alt="{{ $category['name'] }}"
            class="w-full h-full object-cover rounded-xl  transition-transform duration-700">



        <div class="absolute bottom-2 left-0 right-0 px-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
            <button class="w-full bg-primary text-white text-[10px] font-bold py-2 rounded-lg shadow-lg">
                VIEW PRODUCTS
            </button>
        </div>
    </div>

    <h3 class="text-primary-light font-bold text-sm md:text-base category-name transition-colors">
        {{ $category['name'] }}
    </h3>
    <p class="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-widest">
        {{ $category['count'] }}
    </p>

    <style>
        .category-cart-item:hover .category-name {
            color: var(--color-primary);
        }
    </style>

</div>