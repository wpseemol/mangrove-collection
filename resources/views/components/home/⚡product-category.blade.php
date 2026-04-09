<?php

use App\Models\Category;
use Livewire\Component;

new class extends Component {
    public function with(): array
    {
        // 1. Fetch real data from the database using your Model method
        // This will return the collection containing your "Mangrove Raw Honey"
        $get_categories = Category::getCategories();

        return [
            'categories' => $get_categories,
            // The slider only triggers if you have more than 5 real categories
            'useSlider' => $get_categories->count() > 5
        ];
    }
}; ?>

<section class="py-12 bg-white font-poppins">
    <div class="container mx-auto px-4">
        <div class="text-center mb-6">
            <h2 class="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight">Our Product Category</h2>
            <p class="text-gray-500 mt-2">Get your desired product from a featured category</p>
            <div class="w-20 h-1.5 bg-primary-light mx-auto mt-4 rounded-full"></div>
        </div>

        @if($categories->isEmpty())
        <div class="text-center py-20">
            <p class="text-gray-400">No categories available at the moment.</p>
        </div>
        @endif

        {{-- If you have more than 5 categories, we use the slider. Otherwise, we show a simple grid. --}}
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
                        {{-- We pass the Eloquent object. Note: we manually set count to 0 for now --}}
                        <livewire:home.category-item
                            :category="$category"
                            count="0 Products"
                            :key="'cat-'.$category->id" />
                    </div>
                    @endforeach
                </div>
                <div class="swiper-pagination relative! pt-2"></div>
            </div>
        </div>
        @else
        {{-- Standard Grid if categories <= 5 --}}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            @foreach($categories as $category)
            <livewire:home.category-item
                :category="$category"
                count="0 Products"
                :key="'cat-'.$category->id" />
            @endforeach
        </div>
        @endif
    </div>

    {{-- CSS Styles remain the same --}}
    <style>
        @media (min-width: 1024px) {
            .category-slider-container:not(.swiper-initialized) .category-pre-js-fix {
                display: grid !important;
                grid-template-columns: repeat(5, 1fr) !important;
                gap: 20px !important;
            }
        }

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

        .category-slider-container.swiper-initialized {
            opacity: 1 !important;
        }

        .swiper-pagination-bullet-active {
            background-color: #064e3b !important;
            width: 24px !important;
            border-radius: 5px !important;
        }

        .swiper-pagination-bullet {
            background-color: #064e3b;
            opacity: 0.5;
        }
    </style>
</section>