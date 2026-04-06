<?php

use Livewire\Component;

new class extends Component {
    public function with(): array
    {
        $products = collect([
            ['name' => 'Black Seed Honey 1kg', 'price' => 1440, 'old_price' => 1600, 'discount' => '10%', 'tag' => 'Offered Items', 'image' => 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'],
            ['name' => 'Crystal Honey 1kg', 'price' => 1000, 'old_price' => 1100, 'discount' => '9%', 'tag' => null, 'image' => 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg'],
            ['name' => 'Lichu Flower Honey 1kg', 'price' => 1000, 'old_price' => 1200, 'discount' => '17%', 'tag' => null, 'image' => 'https://images.pexels.com/photos/459469/pexels-photo-459469.jpeg'],
            ['name' => 'African Organic Wild Honey 1kg', 'price' => 2200, 'old_price' => 2500, 'discount' => '12%', 'tag' => null, 'image' => 'https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg'],
            ['name' => 'Sundarban Honey 1kg', 'price' => 2200, 'old_price' => 2500, 'discount' => '12%', 'tag' => 'Offered Items', 'image' => 'https://images.pexels.com/photos/33783/honey-jar-food-sweet.jpg'],
            ['name' => 'Premium Mustard Oil', 'price' => 850, 'old_price' => 950, 'discount' => '10%', 'tag' => 'New', 'image' => 'https://images.pexels.com/photos/5946720/pexels-photo-5946720.jpeg'],

            ['name' => 'Raw Sundarban Honey 500g', 'price' => 1100, 'old_price' => 1300, 'discount' => '15%', 'tag' => 'New Arrival', 'image' => 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg'],
            ['name' => 'Premium Gawa Ghee 1kg', 'price' => 1700, 'old_price' => 1900, 'discount' => '11%', 'tag' => 'Best Selling', 'image' => 'https://images.pexels.com/photos/4110253/pexels-photo-4110253.jpeg'],
            ['name' => 'Deshi Cow Milk Ghee 500g', 'price' => 900, 'old_price' => 1000, 'discount' => '10%', 'tag' => null, 'image' => 'https://images.pexels.com/photos/4110253/pexels-photo-4110253.jpeg'],
            ['name' => 'Lachcha Semai Premium 1kg', 'price' => 1300, 'old_price' => 1500, 'discount' => '13%', 'tag' => 'Best Selling', 'image' => 'https://images.pexels.com/photos/628776/pexels-photo-628776.jpeg'],
            ['name' => 'Organic Turmeric Powder 500g', 'price' => 450, 'old_price' => 500, 'discount' => '10%', 'tag' => 'New', 'image' => 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg'],
            ['name' => 'Natural Date Palm Jaggery 1kg', 'price' => 600, 'old_price' => 700, 'discount' => '14%', 'tag' => 'Seasonal', 'image' => 'https://images.pexels.com/photos/4113833/pexels-photo-4113833.jpeg'],
        ]);

        return [
            'products' => $products
        ];
    }
}; ?>

<section class="py-10 bg-white font-poppins">
    <div class="container mx-auto">
        <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div class="relative">
                <h2 class="text-2xl md:text-3xl font-bold text-slate-800">Top New Arrival</h2>
                <div class="w-20 h-1 bg-primary-light mt-2 rounded-full"></div>
            </div>
            <a href="#" class="text-primary text-xs font-bold flex items-center gap-1 uppercase hover:underline">
                View All Items <i class="fa-solid fa-arrow-right-long"></i>
            </a>
        </div>

        <div x-data="{ 
    init() {
        const swiper = new Swiper($refs.newArrivalSwiper, {
            slidesPerView: 2.1, 
            grid: { rows: 2, fill: 'row' },
            spaceBetween: 10,
            autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
            pagination: { el: '.new-arrival-pagination', clickable: true },
            breakpoints: {
                640: { slidesPerView: 3, grid: { rows: 2 }, spaceBetween: 15 },
                1024: { slidesPerView: 5, grid: { rows: 2 }, spaceBetween: 15 }
            }
        });
        // 2. Reveal the slider only after initialization
        $refs.newArrivalSwiper.classList.remove('opacity-0');
    }
}" class="relative group">

            <div x-ref="newArrivalSwiper" class="swiper new-arrival-container transition-opacity duration-300 opacity-0 overflow-hidden pb-12">
                <div class="swiper-wrapper desktop-grid-fix">
                    @foreach($products as $product)
                    <div class="swiper-slide h-auto!">
                        <livewire:home.new-arrival-item :product="$product" :key="'new-'.$loop->index" />
                    </div>
                    @endforeach
                </div>
                <div class="new-arrival-pagination flex justify-center mt-10"></div>
            </div>
        </div>

        <style>
            /* 3. SERVER-SIDE LAYOUT FIX (CRITICAL) */
            /* This forces the 5-column grid before JS loads */
            @media (min-width: 1024px) {
                .new-arrival-container:not(.swiper-initialized) .desktop-grid-fix {
                    display: grid !important;
                    grid-template-columns: repeat(5, 1fr) !important;
                    grid-template-rows: repeat(2, auto) !important;
                    gap: 15px !important;
                }

                .new-arrival-container:not(.swiper-initialized) .swiper-slide {
                    width: 100% !important;
                }
            }

            /* 4. MOBILE LAYOUT FIX */
            @media (max-width: 1023px) {
                .new-arrival-container:not(.swiper-initialized) .desktop-grid-fix {
                    display: flex !important;
                    overflow-x: hidden !important;
                }

                .new-arrival-container:not(.swiper-initialized) .swiper-slide {
                    min-width: 45% !important;
                    margin-right: 10px !important;
                }
            }

            /* Keep your existing pagination styles */
            .new-arrival-pagination .swiper-pagination-bullet {
                width: 8px;
                height: 8px;
                background: #e2e8f0;
                opacity: 1;
            }

            .new-arrival-pagination .swiper-pagination-bullet-active {
                background: var(--color-primary) !important;
                width: 20px;
                border-radius: 4px;
            }
        </style>
</section>