<div class="flex items-center gap-3 cursor-pointer group">
    <a href="{{ route('offers') }}" wire:navigate>
        <div class="text-emerald-500 text-2xl group-hover:scale-110 transition duration-200">
            <i class="fa-solid fa-dollar-sign"></i>
        </div>
    </a>
    <div class="hidden xl:block">
        <a href="{{ route('offers') }}" wire:navigate>
            <p class="text-sm font-semibold leading-none">Offers</p>
            <p class="text-[11px] text-gray-400 mt-1">Latest Offers</p>
        </a>
    </div>
</div>