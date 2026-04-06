<?php

use Livewire\Component;

new class extends Component {
    public function with(): array
    {
        $categories = collect([
            ['name' => 'Mangrove Raw Honey', 'image' => 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400', 'count' => '12 Products'],
            ['name' => 'Seawater Fish', 'image' => 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', 'count' => '24 Products'],
            ['name' => 'Sundarban Crabs', 'image' => 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?w=400', 'count' => '8 Products'],
            ['name' => 'Fresh Prawns', 'image' => 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400', 'count' => '15 Products'],
            ['name' => 'Organic Ghee', 'image' => 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=400', 'count' => '5 Products'],
            // Adding a 6th item will now trigger the slider
            ['name' => 'Dry Fish', 'image' => 'https://images.unsplash.com/photo-1534948216015-843149f72be3?w=400', 'count' => '10 Products'],
        ]);

        return [
            'categories' => $categories,
            'useSlider' => $categories->count() > 5
        ];
    }
}; ?>

<section class="py-12 bg-white font-poppins">
    <div class="container mx-auto ">
        <div class="text-center mb-6">
            <h2 class="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight">Our Product Category</h2>
            <p class="text-gray-500 mt-2">Get your desired product from a featured category</p>
            <div class="w-20 h-1.5 bg-secondary mx-auto mt-4 rounded-full"></div>
        </div>

        @if($useSlider)
        <div x-data="{ 
                init() {
                    new Swiper($refs.categorySwiper, {
                        slidesPerView: 2.2,
                        spaceBetween: 15,
                        loop: true,
                        navigation: {
                            nextEl: '.swiper-button-next-cat',
                            prevEl: '.swiper-button-prev-cat',
                        },
                        pagination: { el: '.swiper-pagination', clickable: true },
                        breakpoints: {
                            640: { slidesPerView: 3.2 },
                            1024: { slidesPerView: 5, spaceBetween: 20 } // Exactly 5 on desktop
                        }
                    })
                }
            }" class="relative group py-2 z-50">

            <button class="swiper-button-prev-cat absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-[#064e3b] opacity-0 group-hover:opacity-100 transition-all border border-gray-100 hover:bg-amber-500 hover:text-white">
                <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>

            <button class="swiper-button-next-cat absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-[#064e3b] opacity-0 group-hover:opacity-100 transition-all border border-gray-100 hover:bg-amber-500 hover:text-white">
                <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>


            <style>
                /* Active dot color (Honey Gold) */
                .swiper-pagination-bullet-active {
                    background: #d97706 !important;
                    width: 24px !important;
                    /* Makes the active dot an elongated 'pill' shape */
                    border-radius: 5px !important;
                    transition: all 0.3s ease;


                }

                /* Inactive dots */
                .swiper-pagination-bullet {
                    background: #064e3b;
                    /* Forest Green */

                    opacity: 1;
                }
            </style>
            <div x-ref="categorySwiper" class="swiper overflow-hidden pb-12 px-1">
                <div class="swiper-wrapper">
                    @foreach($categories as $category)
                    <div class="swiper-slide h-auto">
                        <livewire:home.category-item
                            :category="$category"
                            :key="'cat-'.$loop->index" />
                    </div>
                    @endforeach
                </div>

                <div class="swiper-pagination relative! pt-2"></div>
            </div>
        </div>
        @else
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            @foreach($categories as $category)
            <livewire:home.category-item
                :category="$category"
                :key="'cat-'.$loop->index" />
            @endforeach
        </div>
        @endif
    </div>

    <style>
        .swiper-pagination-bullet-active {
            background: #d97706 !important;
        }
    </style>
</section>