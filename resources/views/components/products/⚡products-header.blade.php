<?php

use Livewire\Component;

new class extends Component
{
    //
};
?>

<div class="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 gap-4 font-poppins">
    <div class="text-slate-500 text-sm">
        Showing <span class="font-bold text-slate-800">20</span> Products found
    </div>

    <div class="flex items-center gap-4">
        <div class="hidden sm:flex items-center border border-slate-200 rounded-lg p-1">
            <button class="w-8 h-8 flex items-center justify-center rounded bg-[#064e3b] text-white">
                <i class="fa-solid fa-grid-2"></i>
            </button>
            <button class="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-[#064e3b]">
                <i class="fa-solid fa-list"></i>
            </button>
        </div>

        <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
            <select class="text-sm border-slate-200 rounded-xl focus:ring-[#064e3b] focus:border-[#064e3b] bg-slate-50 py-2 pl-3 pr-8 cursor-pointer font-semibold text-slate-700">
                <option value="latest">Latest Arrivals</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="title">Title: A-Z</option>
            </select>
        </div>
    </div>
</div>