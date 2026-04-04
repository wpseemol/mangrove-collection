<header class="bg-black text-white py-4 border-b border-white/10 font-poppins ">
    <nav class="container mx-auto flex items-center justify-between gap-6">

        <div class="flex items-center gap-3 shrink-0">
            <div class="w-10 h-10 rounded-bl-2xl overflow-hidden bg-emerald-500">
                <img src="/assets/logo/mangrove-collection.png" alt="Logo" class="w-full h-full object-cover">
            </div>
            <div class="leading-tight uppercase tracking-tighter">
                <span class="block text-emerald-500 font-bold text-sm">Mangrove</span>
                <span class="block text-emerald-500 font-bold text-sm">Collection</span>
            </div>
        </div>

        <div class="flex-1 max-w-2xl hidden md:block">
            <div class="flex">
                <input type="text" placeholder="Search"
                    class="w-full bg-transparent border border-white/20 rounded-l-md px-4 py-1.5 text-sm outline-none focus:border-emerald-500/50 transition">
                <button class="bg-emerald-950/40 border border-white/20 border-l-0 rounded-r-md px-5 py-1.5 hover:bg-emerald-900/60 transition">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </button>
            </div>
        </div>

        <div class="flex items-center gap-4 lg:gap-8">

            <div class="flex items-center gap-3 cursor-pointer group">
                <a href="{{ route('offers') }}" wire:navigate>
                    <div class="text-emerald-500 text-2xl group-hover:scale-110 transition duration-200">
                        <i class="fa-solid fa-dollar-sign"></i>
                    </div>
                </a>
                <div class="hidden xl:block">
                    <p class="text-sm font-semibold leading-none">Offers</p>
                    <p class="text-[11px] text-gray-400 mt-1">Latest Offers</p>
                </div>
            </div>

            <div class="flex items-center gap-3 cursor-pointer group">
                <a href="{{ route('cart') }}" wire:navigate>
                    <div class="text-emerald-500 text-2xl group-hover:scale-110 transition duration-200">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </div>
                </a>
                <div class="hidden xl:block">
                    <p class="text-sm font-semibold leading-none">Cart</p>
                    <p class="text-[11px] text-gray-400 mt-1">Add items</p>
                </div>
            </div>

            <div class="flex items-center gap-3 cursor-pointer group">
                <div class="text-emerald-500 text-2xl group-hover:scale-110 transition duration-200">
                    <i class="fa-solid fa-cart-flatbed-suitcase"></i>
                </div>
                <div class="hidden xl:block">
                    <p class="text-sm font-semibold leading-none">Order</p>
                    <p class="text-[11px] text-gray-400 mt-1">My Order</p>
                </div>
            </div>

            <div class="flex items-center gap-3 cursor-pointer group">
                <div class="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-xl">
                    S
                </div>
                <div class="hidden xl:block">
                    <p class="text-sm font-semibold leading-none">Seemol</p>
                    <p class="text-[11px] text-gray-400 mt-1">wpseemol@gmail.com</p>
                </div>
            </div>

        </div>
    </nav>
</header>