<header class='bg-brand-dark text-white py-4 border-b border-white/10 font-poppins'>
    <x-layouts::home.header.desktop-view />
    <x-layouts::home.header.mobile-view />
</header>
<!-- sub menu -->


@php
$menuData = [
'Category' => [
'icon' => 'fa-solid fa-leaf',
'children' => [
['label' => 'Raw Honey', 'href' => '/honey', 'desc' => '100% Pure Sundarban Honey'],
['label' => 'Sea Fish', 'href' => '/fish', 'desc' => 'Fresh from the Bay of Bengal'],
['label' => 'Crabs & Prawn', 'href' => '/crabs', 'desc' => 'Premium exported quality'],
]
],
'Products' => [
'icon' => 'fa-solid fa-basket-shopping',
'children' => [
['label' => 'New Arrivals', 'href' => '/new', 'desc' => 'Just harvested items'],
['label' => 'Best Sellers', 'href' => '/popular', 'desc' => 'Customer favorites'],
['label' => 'Bulk Orders', 'href' => '/bulk', 'desc' => 'Wholesale for restaurants'],
]
],
'Contact' => [
'icon' => 'fa-solid fa-headset',
'href' => '/contact'
],
'About' => [
'icon' => 'fa-solid fa-circle-info',
'href' => '/about'
],
];
@endphp


@include('partials.sub-menu')
<div class="md:flex justify-center border border-e-accent/20 bg-e-accent/10 hidden">
    <nav class="flex items-center  gap-8">
        @foreach($menuData as $title => $data)
        <div class="relative group py-4">
            <a href="{{ $data['href'] ?? '#' }}"
                class="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-emerald-700 transition-colors uppercase tracking-wide">
                {{ $title }}
                @isset($data['children'])
                <i class="fa-solid fa-chevron-down text-[10px] group-hover:rotate-180 transition-transform"></i>
                @endisset
            </a>

            @isset($data['children'])
            <div class="absolute top-full -left-4 w-72 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div class="bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 grid gap-1">
                    @foreach($data['children'] as $child)
                    <a href="{{ $child['href'] }}" class="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50 group/item transition-all">
                        <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                            <i class="{{ $data['icon'] }}"></i>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-gray-800">{{ $child['label'] }}</p>
                            <p class="text-[10px] text-gray-500 uppercase tracking-tighter">{{ $child['desc'] }}</p>
                        </div>
                    </a>
                    @endforeach
                </div>
            </div>
            @endisset
        </div>
        @endforeach
    </nav>
</div>