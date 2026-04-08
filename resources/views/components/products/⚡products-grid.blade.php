<?php

use Livewire\Component;

new class extends Component {
    public function with()
    {
        // Professional Demo Data - 20 items representing Mangrove Collection
        $templates = [
            ['name' => 'Natural Sundarban Honey', 'price' => 1200, 'img' => 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400', 'cat' => 'Honey'],
            ['name' => 'Organic Gawa Ghee', 'price' => 1800, 'img' => 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=400', 'cat' => 'Dairy'],
            ['name' => 'Fresh Tiger Prawns', 'price' => 2400, 'img' => 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400', 'cat' => 'Sea Food'],
            ['name' => 'Mud Crab (Grade A)', 'price' => 950, 'img' => 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?w=400', 'cat' => 'Sea Food'],
            ['name' => 'Mustard Oil (Wood Pressed)', 'price' => 550, 'img' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 'cat' => 'Organic'],
        ];

        $products = collect(range(1, 20))->map(function ($i) use ($templates) {
            $base = $templates[($i - 1) % 5];
            return (object)[
                'id' => $i,
                'name' => $base['name'],
                'slug' => str()->slug($base['name'] . '-' . $i),
                'price' => $base['price'],
                'old_price' => $base['price'] + 300,
                'image' => $base['img'],
                'category' => $base['cat'],
                'is_new' => $i <= 4
            ];
        });

        return ['products' => $products];
    }
}; ?>

<div class="space-y-8">
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        @foreach($products as $product)
        <div class="group bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500 flex flex-col h-full overflow-hidden">

            <div class="relative aspect-4/5 overflow-hidden bg-slate-50">
                <img src="{{ $product->image }}"
                    alt="{{ $product->name }}"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">

                <div class="absolute top-4 left-4 flex flex-col gap-2">
                    @if($product->is_new)
                    <span class="bg-[#064e3b] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">New</span>
                    @endif
                    <span class="bg-amber-400 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        -{{ round((($product->old_price - $product->price) / $product->old_price) * 100) }}%
                    </span>
                </div>

                <div class="absolute inset-0 bg-[#064e3b]/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center translate-y-4 group-hover:translate-y-0">
                    <button class="bg-white text-slate-800 font-bold px-6 py-3 rounded-xl shadow-xl hover:bg-[#064e3b] hover:text-white transition-all transform active:scale-95">
                        Quick View
                    </button>
                </div>
            </div>

            <div class="p-5 flex flex-col grow">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ $product->category }}</span>
                    <div class="flex text-primary text-[10px]">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                    </div>
                </div>

                <a href="#" class="block group/title">
                    <h3 class="text-sm md:text-base font-bold text-slate-800 line-clamp-2 leading-snug group-hover/title:text-[#064e3b] transition-colors h-10 md:h-12 mb-4">
                        {{ $product->name }}
                    </h3>
                </a>

                <div class="mt-auto">
                    <div class="flex items-baseline gap-2 mb-4">
                        <span class="text-xl font-black text-[#064e3b]">৳{{ number_format($product->price) }}</span>
                        <span class="text-xs text-slate-300 line-through">৳{{ number_format($product->old_price) }}</span>
                    </div>

                    <button class="w-full group/btn relative overflow-hidden bg-slate-900 text-white font-bold py-3.5 rounded-2xl transition-all hover:bg-[#064e3b] hover:shadow-lg hover:shadow-emerald-200">
                        <span class="flex items-center justify-center gap-2 relative z-10 transition-transform group-hover/btn:-translate-y-12">
                            <i class="fa-solid fa-cart-shopping text-xs"></i> Add to Cart
                        </span>
                        <span class="absolute inset-0 flex items-center justify-center gap-2 translate-y-12 group-hover/btn:translate-y-0 transition-transform bg-[#064e3b]">
                            Ready to Buy? <i class="fa-solid fa-arrow-right"></i>
                        </span>
                    </button>
                </div>
            </div>
        </div>
        @endforeach
    </div>

    <div class="flex justify-center pt-10">
        <nav class="inline-flex items-center p-1 bg-white border border-slate-100 rounded-2xl shadow-sm gap-1">
            <button class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="w-10 h-10 flex items-center justify-center rounded-xl bg-[#064e3b] text-white font-bold">1</button>
            <button class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 font-bold hover:bg-slate-50">2</button>
            <button class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 font-bold hover:bg-slate-50">3</button>
            <button class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50"><i class="fa-solid fa-chevron-right"></i></button>
        </nav>
    </div>
</div>