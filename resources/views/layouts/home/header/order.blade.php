<div class="flex items-center gap-3 cursor-pointer group">
    <!-- <a href="{{ route('cart') }}" wire:navigate> -->
    <a href="#" wire:navigate>
        <div class="text-primary-light text-2xl group-hover:scale-110 transition duration-200">
            <i class="fa-solid fa-cart-flatbed-suitcase"></i>
        </div>
    </a>
    <div class="hidden xl:block">
        <a href="#" wire:navigate>
            <p class="text-sm font-semibold leading-none">Order</p>
            <p class="text-[11px] text-gray-400 mt-1">My Order</p>
        </a>
    </div>
</div>