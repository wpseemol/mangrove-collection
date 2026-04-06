<?php

use Livewire\Component;


new class extends Component {
    public function with(): array
    {
        // Try to get real data, fallback to professional demo data if empty



        $banners = collect([
            (object)[
                'title' => 'Raw Sundarban Honey',
                'sub_title' => '100% Pure, organic, and harvested directly from the deep mangrove forests of Bangladesh.',
                'image_url' => 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=2070&auto=format&fit=crop',
                'button_text' => 'Shop Honey',
                'button_link' => '/category/honey'
            ],
            (object)[
                'title' => 'Fresh Bay Sea Fish',
                'sub_title' => 'Premium seafood caught daily and delivered to your doorstep with guaranteed freshness.',
                'image_url' => 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop',
                'button_text' => 'Explore Catch',
                'button_link' => '/category/fish'
            ]
        ]);


        return [
            'banners' => $banners,
        ];
    }
}; ?>

<section class="bg-zinc-50 font-poppins">
    <div class="mx-auto mt-10 md:mt-0">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <div x-data="{ active: 0, count: {{ $banners->count() }} }"
                x-init="setInterval(() => { active = (active + 1) % count }, 6000)"
                class="lg:col-span-3 h-100 md:h-137.5 relative rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white bg-[#064e3b]">

                @foreach($banners as $index => $banner)
                <div x-show="active === {{ $index }}"
                    x-transition:enter="transition ease-out duration-1000"
                    x-transition:enter-start="opacity-0 scale-105"
                    x-transition:enter-end="opacity-100 scale-100"
                    class="absolute inset-0 bg-cover bg-center"
                    style="background-image: url('{{ $banner->image_url  }}');">

                    <div class="absolute inset-0 bg-linear-to-t from-brand-dark/70 via-black/90 to-transparent p-8 md:p-16 flex flex-col justify-end">
                        <div x-show="active === {{ $index }}"
                            x-transition:enter="transition ease-out delay-300 duration-700"
                            x-transition:enter-start="opacity-0 translate-y-8"
                            x-transition:enter-end="opacity-100 translate-y-0">

                            <span class="text-primary font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-3 block">Sundarban's Finest</span>
                            <h2 class="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-6">
                                {{ $banner->title }}
                            </h2>
                            <p class="text-zinc-200 text-sm md:text-xl max-w-xl mb-10 leading-relaxed font-medium">
                                {{ $banner->sub_title }}
                            </p>

                            <div class="flex items-center gap-4">
                                <a href="{{ $banner->button_link }}"
                                    class="bg-primary text-accent-foreground hover:bg-white hover:text-accent-content px-10 py-4 rounded-2xl font-black transition-all transform hover:-translate-y-1 shadow-xl uppercase text-sm tracking-widest">
                                    {{ $banner->button_text }}
                                </a>
                                <div class="hidden md:flex gap-3 ml-6 border-l border-white/20 pl-6">
                                    <a href="https://wa.me/+8801323846556" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-all text-white">
                                        <i class="fa-brands fa-whatsapp"></i>
                                    </a>
                                    <a href="https://facebook.com/mangrove.collection" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-all text-white">
                                        <i class="fa-brands fa-facebook-f"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                @endforeach

                <div class="absolute bottom-10 right-10 flex items-center gap-4 z-20">
                    <div class="flex gap-2">
                        @foreach($banners as $index => $banner)
                        <button @click="active = {{ $index }}"
                            :class="active === {{ $index }} ? 'w-12 bg-primary' : 'w-3 bg-white/30'"
                            class="h-1.5 rounded-full transition-all duration-500"></button>
                        @endforeach
                    </div>
                </div>
            </div>

            <div class="flex lg:flex-col sm:flex-row flex-col gap-6">
                <div class="flex-1 bg-white rounded-4xl p-5 shadow-lg border border-gray-100 group cursor-pointer overflow-hidden relative">
                    <div class="h-44 rounded-2xl overflow-hidden mb-4 relative">
                        <img src="https://images.unsplash.com/photo-1551730459-92db2a308d6a?q=80&w=1974&auto=format&fit=crop"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                    </div>
                    <h3 class="font-black text-[#064e3b] uppercase text-sm tracking-tight">Daily Fresh Catch</h3>
                    <p class="text-[11px] text-gray-500 mt-2 leading-snug">Sustainably sourced from the coastal waters of the Bay of Bengal.</p>
                    <i class="fa-solid fa-arrow-right-long absolute bottom-6 right-6 text-gray-300 group-hover:text-primary transition-colors"></i>
                </div>

                <div
                    class="flex-1 bg-accent-content from-brand-dark/70 via-black/90 to-transparent rounded-4xl p-8 shadow-2xl relative overflow-hidden text-white flex flex-col justify-center border 
                    ">
                    <div class="relative z-10">
                        <h3 class="font-black text-2xl leading-tight">Sundarbans<br><span class="text-primary">Pure Organic</span></h3>
                        <p class="text-emerald-300 text-[10px] mt-4 tracking-[0.2em] uppercase font-bold">Safe & Natural Products</p>
                        <a href="/about" class="mt-8 flex items-center gap-3 group/btn">
                            <span class="text-xs font-bold uppercase tracking-widest group-hover:text-amber-500 transition-colors">Our Story</span>
                            <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-primary transition-all">
                                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                            </div>
                        </a>
                    </div>
                    <i class="fa-solid fa-leaf absolute -right-8 -bottom-8 text-white/5 text-[12rem] rotate-12"></i>
                </div>
            </div>

        </div>
    </div>
</section>