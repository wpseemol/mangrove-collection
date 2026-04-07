<?php

use Livewire\Component;

new class extends Component {
    public function with(): array
    {
        /** * FUTURE PROOFING: 
         * When your database is ready, replace this array with:
         * $aboutData = \App\Models\AboutSetting::first();
         */
        $content = [
            'main_title' => 'Natural Food Shop in Bangladesh',
            "main_description" => "Discover the finest natural and organic foods sourced directly from trusted farmers across Bangladesh. At Mangrove Collection, we are committed to delivering pure, chemical-free products that nourish your body and support local communities.",

            'sections' => [
                [
                    'title' => 'About Mangrove Collection',
                    'description' => 'Mangrove Collection provides natural and organic food sourced directly from trusted farmers across Bangladesh.'
                ],
                [
                    'title' => 'Our Mission',
                    'description' => 'Our mission is to deliver pure, chemical-free food to every home while supporting local communities.'
                ],
                [
                    'title' => 'Why Choose Us',
                    'description' => 'We ensure high-quality products, direct sourcing, and complete trust for our customers.'
                ],
                [
                    'title' => 'Sundarban Honey',
                    'description' => 'Our honey is raw, unprocessed, and collected naturally from the Sundarban forest, rich in nutrients and taste.'
                ],
                [
                    'title' => 'Our Products',
                    'description' => 'We offer honey, mustard oil, ghee, spices, and other traditional organic foods for a healthy lifestyle.'
                ],
            ],
        ];

        return [
            'content' => (object) $content // Casting to object makes it behave like a Database Row
        ];
    }
}; ?>

<section class="py-16 bg-white font-poppins">
    <div class="container mx-auto px-4">
        <div class="mb-10">
            <h2 class="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                {{ $content->main_title }}
            </h2>
            <div class="w-20 h-1 bg-primary-light mt-2 rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div class="lg:col-span-8 text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
                <p>{!! $content->main_description !!}</p>

                @foreach($content->sections as $section)
                <h3 class="text-xl font-bold text-slate-800 mt-4">
                    {{ $section['title'] }}
                </h3>

                <p>{!! $section['description'] !!}</p>
                @endforeach


            </div>

            <div class="lg:col-span-4">
                <div class="bg-[#f9fafb] border border-slate-100 rounded-2xl p-6 space-y-8 sticky top-24">
                    @php
                    // Prepare these to come from a database in the future
                    $features = [
                    [
                    'title' => '100% Organic',
                    'icon' => 'leaf',
                    'color' => 'emerald',
                    'desc' => 'Directly sourced from the deep Sundarban forest.'
                    ],
                    [
                    'title' => 'Quality Certified',
                    'icon' => 'certificate', // Changed to 'certificate' for better Free version support
                    'color' => 'amber',
                    'desc' => 'Strict lab testing for purity and nutrition.'
                    ],
                    [
                    'title' => 'Fast Delivery',
                    'icon' => 'truck-fast',
                    'color' => 'blue',
                    'desc' => 'Ensuring freshness with controlled shipping.'
                    ],
                    ];

                    $cat_text = "Explore Our Products";
                    @endphp

                    <div class="bg-[#f9fafb] border border-slate-100 rounded-2xl p-6 space-y-8 sticky top-24">
                        @foreach($features as $feature)
                        <div class="flex items-start gap-4">
                            {{-- Dynamic Background and Text colors --}}
                            <div class="w-12 h-12 bg-{{ $feature['color'] }}-100 text-{{ $feature['color'] }}-600 rounded-full flex items-center justify-center shrink-0">
                                <i class="fa-solid fa-{{ $feature['icon'] }} text-xl"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800">{{ $feature['title'] }}</h4>
                                <p class="text-xs text-slate-500 mt-1">{{ $feature['desc'] }}</p>
                            </div>
                        </div>
                        @endforeach

                        <div class="pt-4">
                            <button class="w-full bg-[#064e3b] text-white font-bold py-3 rounded-xl hover:bg-primary-light transition-colors flex items-center justify-center gap-2 group">
                                {{ $cat_text }}
                                <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>