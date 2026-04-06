<?php

use Livewire\Component;

new class extends Component {
    public function with(): array
    {
        // Professional Demo Data matching your product images
        $products = collect([
            [
                'name' => 'Sundarban Honey 1kg',
                'price' => 2200,
                'old_price' => 2500,
                'image' => 'https://images.unsplash.com/photo-1587049352851-8d4e89133924',
                'tag' => 'Offered Items'
            ],
            [
                'name' => 'Deshi Mustard Oil 5 liter',
                'price' => 1550,
                'old_price' => null,
                'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
                'tag' => 'Best Selling'
            ],
            [
                'name' => 'Gawa Ghee 1kg',
                'price' => 1700,
                'old_price' => 1800,
                'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
                'tag' => 'Best Selling'
            ],
            [
                'name' => 'Lachcha Semai 1kg',
                'price' => 1300,
                'old_price' => 1500,
                'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
                'tag' => 'Best Selling'
            ],
            [
                'name' => 'Sundarban Raw Honey 500g',
                'price' => 1100,
                'old_price' => 1300,
                'image' => 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e',
                'tag' => 'New Arrival'
            ],
        ]);

        return [
            'products' => $products,
            'isSlider' => $products->count() > 4
        ];
    }
}; ?>

<section class="py-16 bg-[#f9fafb] font-poppins">
    <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-10">
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-slate-800">Top Selling Products</h2>
                <div class="w-20 h-1 bg-primary mt-2 rounded-full "></div>
            </div>
            @if($isSlider)
            <div class="flex gap-2">
                <button class="top-prev w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-all bg-white shadow-sm">
                    <i class="fa-solid fa-chevron-left text-sm"></i>
                </button>
                <button class="top-next w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-all bg-white shadow-sm">
                    <i class="fa-solid fa-chevron-right text-sm"></i>
                </button>
            </div>
            @endif
        </div>

        @if($isSlider)
        <div x-data="{ 
                init() {
                    const swiper = new Swiper($refs.topSwiper, {
                        slidesPerView: 1,
                        grid: { rows: 2, fill: 'row' },
                        autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
                        spaceBetween: 20,
                        navigation: { nextEl: '.top-next', prevEl: '.top-prev' },
                        breakpoints: {
                            640: { slidesPerView: 2, grid: { rows: 2 } },
                            1024: { slidesPerView: 2, grid: { rows: 2 }, spaceBetween: 30 }
                        }
                    });
                    // Reveal once initialized
                    $refs.topSwiper.classList.remove('opacity-0');
                }
            }" class="relative">

            <div x-ref="topSwiper" class="swiper top-selling-container overflow-hidden opacity-0 transition-opacity duration-300">
                <div class="swiper-wrapper pre-js-grid">
                    @foreach($products as $product)
                    <div class="swiper-slide h-auto! pb-4">
                        <livewire:home.top-selling-product-card :product="$product" :key="'top-'.$loop->index" />
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
        @else
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @foreach($products as $product)
            <livewire:home.product-card :product="$product" :key="'top-'.$loop->index" />
            @endforeach
        </div>
        @endif
    </div>

    <style>
        /* 1. Prevent vertical stacking on reload for Desktop */
        @media (min-width: 640px) {
            .top-selling-container:not(.swiper-initialized) .pre-js-grid {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                grid-template-rows: repeat(2, auto) !important;
                gap: 20px !important;
            }
        }

        /* 2. Fix for 1024px+ breakpoint */
        @media (min-width: 1024px) {
            .top-selling-container:not(.swiper-initialized) .pre-js-grid {
                gap: 30px !important;
            }
        }

        /* 3. Smooth transition to avoid flickering */
        .top-selling-container.swiper-initialized {
            opacity: 1 !important;
        }

        /* 4. Ensure slide height doesn't collapse during load */
        .top-selling-container:not(.swiper-initialized) .swiper-slide {
            width: 100% !important;
        }
    </style>
</section>