@php
$menuData = [
'Home' => ['icon' => 'fa-house', 'href' => '/', 'color' => 'text-emerald-500'],
'Offers' => ['icon' => 'fa-tag', 'href' => '/offers', 'color' => 'text-amber-500'], // Honey Gold for urgency
'Category' => [
'icon' => 'fa-list',
'children' => [
['label' => 'Raw Honey', 'href' => '/honey'],
['label' => 'Sea Fish', 'href' => '/fish'],
['label' => 'Sundarban Crabs', 'href' => '/crabs'],
]
],
'Products' => [
'icon' => 'fa-basket-shopping',
'children' => [
['label' => 'Best Sellers', 'href' => '/popular'],
['label' => 'New Arrivals', 'href' => '/new'],
]
],
'Contact' => ['icon' => 'fa-headset', 'href' => '/contact', 'color' => 'text-emerald-500'],
'About' => ['icon' => 'fa-circle-info', 'href' => '/about', 'color' => 'text-emerald-500'],
];
@endphp

<!-- <div class="flex flex-col gap-6 text-white">
    <div class="pb-6 border-b border-white/10">
        <p class="text-emerald-500 font-bold">MENU</p>
    </div>
    <a href="/" class="flex items-center gap-3 text-lg"><i class="fa-solid fa-house text-emerald-500"></i> Home</a>
    <a href="/offers" class="flex items-center gap-3 text-lg"><i class="fa-solid fa-tag text-emerald-500"></i> Offers</a>
    <a href="/categories" class="flex items-center gap-3 text-lg"><i class="fa-solid fa-list text-emerald-500"></i> All Categories</a>
</div> -->

<div class="flex flex-col gap-2 text-white font-poppins">
    <div class="pb-4 mb-2 border-b border-white/10 flex items-center justify-between">
        <p class="text-emerald-500 font-black text-xs uppercase tracking-[0.2em]">Navigation</p>
        <span class="text-[10px] text-zinc-500 uppercase">Mangrove v1.0</span>
    </div>

    @foreach($menuData as $title => $item)
    <div x-data="{ open: false }" class="group">
        @if(isset($item['children']))
        <button @click="open = !open"
            class="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-300 hover:bg-emerald-500/10 group">
            <div class="flex items-center gap-4">
                <i class="fa-solid {{ $item['icon'] }} {{ $item['color'] ?? 'text-emerald-500' }} text-lg"></i>
                <span class="text-base font-medium tracking-tight">{{ $title }}</span>
            </div>
            <i class="fa-solid fa-chevron-down text-xs text-zinc-500 transition-transform duration-300" :class="open ? 'rotate-180' : ''"></i>
        </button>

        <div x-show="open"
            x-collapse
            x-cloak
            class="ml-12 mt-1 space-y-1 border-l border-emerald-500/20">
            @foreach($item['children'] as $child)
            <a href="{{ $child['href'] }}"
                class="block py-2.5 px-4 text-sm text-zinc-400 hover:text-emerald-400 transition-colors relative">
                <span class="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-emerald-500/30"></span>
                {{ $child['label'] }}
            </a>
            @endforeach
        </div>
        @else
        <a href="{{ $item['href'] }}"
            class="flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 hover:bg-emerald-500/10 {{ request()->is(ltrim($item['href'], '/')) ? 'bg-emerald-500/20 text-emerald-400' : '' }}">
            <i class="fa-solid {{ $item['icon'] }} {{ $item['color'] ?? 'text-emerald-500' }} text-lg"></i>
            <span class="text-base font-medium tracking-tight">{{ $title }}</span>
        </a>
        @endif
    </div>
    @endforeach
</div>