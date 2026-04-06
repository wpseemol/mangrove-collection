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
    <div class="container mx-auto">
        <div class="text-center mb-6">
            <h2 class="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight">Our Product Category</h2>
            <p class="text-gray-500 mt-2">Get your desired product from a featured category</p>
            <div class="w-20 h-1.5 bg-primary-light mx-auto mt-4 rounded-full"></div>
        </div>

        @if($useSlider)
        <div x-data="{ 
                init() {
                    const swiper = new Swiper($refs.categorySwiper, {
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
                            1024: { slidesPerView: 5, spaceBetween: 20 }
                        }
                    });
                    // Reveal the slider once JS is ready
                    $refs.categorySwiper.classList.remove('opacity-0');
                }
            }" class="relative group py-2 z-50">

            <button class="swiper-button-prev-cat absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-[#064e3b] opacity-0 group-hover:opacity-100 transition-all border border-gray-100 hover:bg-primary hover:text-white">
                <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>

            <button class="swiper-button-next-cat absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-[#064e3b] opacity-0 group-hover:opacity-100 transition-all border border-gray-100 hover:bg-primary hover:text-white">
                <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>

            <div x-ref="categorySwiper" class="swiper category-slider-container overflow-hidden pb-12 px-1 opacity-0 transition-opacity duration-300">
                <div class="swiper-wrapper category-pre-js-fix">
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
        /* --- SERVER-SIDE LOAD FIX --- */

        /* 1. Show 5 columns on desktop immediately before JS loads */
        @media (min-width: 1024px) {
            .category-slider-container:not(.swiper-initialized) .category-pre-js-fix {
                display: grid !important;
                grid-template-columns: repeat(5, 1fr) !important;
                gap: 20px !important;
            }
        }

        /* 2. Show a horizontal row on mobile before JS loads */
        @media (max-width: 1023px) {
            .category-slider-container:not(.swiper-initialized) .category-pre-js-fix {
                display: flex !important;
                overflow-x: hidden !important;
            }

            .category-slider-container:not(.swiper-initialized) .swiper-slide {
                min-width: 40% !important;
                margin-right: 15px !important;
            }
        }

        /* 3. Reveal the container once Swiper adds the initialized class */
        .category-slider-container.swiper-initialized {
            opacity: 1 !important;
        }

        /* Existing Pagination Styles */
        .swiper-pagination-bullet-active {
            background-color: var(--color-primary-light) !important;
            width: 24px !important;
            border-radius: 5px !important;
            transition: all 0.3s ease;
        }

        .swiper-pagination-bullet {
            background-color: var(--color-primary);
            opacity: 1;
        }
    </style>
</section>