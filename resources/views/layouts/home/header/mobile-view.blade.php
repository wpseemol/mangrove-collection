<nav x-data="{ menuOpen: false, searchOpen: false }"
    class="md:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white h-16 border-b border-white/10 px-4 flex items-center justify-between">

    <button @click="menuOpen = true" class="p-2 text-white">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
    </button>

    <x-layouts::home.header.icon />

    <button @click="searchOpen = true" class="p-2">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
    </button>

    <template x-teleport="body">
        <div x-show="menuOpen" x-cloak class="fixed inset-0 z-100">
            <div @click="menuOpen = false" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div x-show="menuOpen"
                x-transition:enter="transition ease-out duration-300"
                x-transition:enter-start="-translate-x-full"
                x-transition:enter-end="translate-x-0"
                class="relative bg-black w-3/4 h-full border-r border-white/10 p-6">
                <x-layouts::home.header.mobile-sidebar-content />
            </div>
        </div>
    </template>

    <template x-teleport="body">
        <div x-show="searchOpen" x-cloak class="fixed inset-0 z-110 bg-black/95 p-4">
            <div class="flex items-center gap-4">
                <div class="flex-1 relative">
                    <input type="text" autofocus placeholder="Search honey, fish, prawns..."
                        class="w-full bg-white/10 border border-emerald-500/50 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 ring-emerald-500/20">
                </div>
                <button @click="searchOpen = false"
                    class="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <div class="mt-8">
                <p class="text-xs text-gray-500 uppercase tracking-widest mb-4">Popular Categories</p>
                <div class="flex flex-wrap gap-2">
                    <span class="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-sm border border-emerald-500/20">Raw Honey</span>
                    <span class="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-sm border border-emerald-500/20">Sea Fish</span>
                </div>
            </div>
        </div>
    </template>

</nav>


<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 h-16 flex items-center justify-around px-2 pb-safe">

    <x-layouts::home.header.offers />


    <x-layouts::home.header.cart />

    <x-layouts::home.header.order />

    <x-layouts::home.header.account />
</nav>