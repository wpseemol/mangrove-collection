<?php

use Livewire\Component;

new class extends Component
{
    //
};
?>

<aside class="w-full space-y-8 font-poppins">
    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2">
            <i class="fa-solid fa-layer-group text-[#064e3b]"></i> Categories
        </h3>
        <div class="space-y-3">
            @php
            $categories = [
            ['name' => 'Wild Honey', 'count' => 12],
            ['name' => 'Natural Ghee', 'count' => 5],
            ['name' => 'Sundarban Fish', 'count' => 18],
            ['name' => 'Organic Crabs', 'count' => 8],
            ['name' => 'Dry Fish', 'count' => 14],
            ];
            @endphp

            @foreach($categories as $category)
            <label class="flex items-center justify-between group cursor-pointer">
                <div class="flex items-center gap-3">
                    <div class="relative flex items-center">
                        <input type="checkbox" class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-200 checked:bg-[#064e3b] checked:border-[#064e3b] transition-all">
                        <i class="fa-solid fa-check absolute text-white text-[10px] left-1 opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                    </div>
                    <span class="text-slate-600 group-hover:text-[#064e3b] font-medium transition-colors">{{ $category['name'] }}</span>
                </div>
                <span class="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-full group-hover:bg-emerald-100 group-hover:text-[#064e3b] transition-all">
                    {{ $category['count'] }}
                </span>
            </label>
            @endforeach
        </div>
    </div>

    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" x-data="{ price: 2500 }">
        <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2">
            <i class="fa-solid fa-filter-circle-dollar text-[#064e3b]"></i> Price Range
        </h3>

        <div class="px-2">
            <input type="range" min="100" max="10000" x-model="price"
                class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#064e3b]">

            <div class="flex justify-between mt-4">
                <div class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                    <span class="text-[10px] text-slate-400 block uppercase font-bold">Min</span>
                    <span class="text-sm font-bold text-slate-700">৳100</span>
                </div>
                <div class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-right">
                    <span class="text-[10px] text-slate-400 block uppercase font-bold">Max</span>
                    <span class="text-sm font-bold text-[#064e3b]" x-text="'৳' + Number(price).toLocaleString()"></span>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2">
            <i class="fa-solid fa-star text-[#064e3b]"></i> Customer Rating
        </h3>
        <div class="space-y-3">
            @for($i = 5; $i >= 3; $i--)
            <label class="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="rating" class="h-4 w-4 border-slate-300 text-[#064e3b] focus:ring-[#064e3b]">
                <div class="flex text-amber-400 text-xs gap-0.5">
                    @for($j = 1; $j <= 5; $j++)
                        <i class="fa-{{ $j <= $i ? 'solid' : 'regular' }} fa-star"></i>
                        @endfor
                        <span class="ml-2 text-slate-500 group-hover:text-slate-800 transition-colors">& up</span>
                </div>
            </label>
            @endfor
        </div>
    </div>

    <button class="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 group">
        <i class="fa-solid fa-rotate-left group-hover:-rotate-45 transition-transform"></i>
        Reset All Filters
    </button>
</aside>