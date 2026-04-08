<x-layouts::general-users :title="__('Page Not Found')">
    <div class="min-h-[80vh] page-404 py-20 flex items-center justify-center bg-white font-poppins relative overflow-hidden"
        style="padding: 20px 0 20px 0;">

        <div class="absolute top-0 left-0 w-64 h-64 bg-emerald-50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-amber-50 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-50"></div>

        <div class="container mx-auto px-4 text-center relative z-10">
            <div class="mb-12 flex items-center justify-center font-black text-slate-100 select-none">
                <span class="text-[120px] md:text-[180px] leading-none"
                    style="font-size: 120px;">4</span>

                <div class="mx-2 md:mx-4">
                    <i class="fa-solid fa-compass text-[#064e3b]"
                        style="font-size: 100px; animation: spin 12s linear infinite; display: inline-block;">
                    </i>
                </div>

                <span class="text-[120px] md:text-[180px] leading-none"
                    style="font-size: 120px;">4</span>
            </div>

            <div class="max-w-2xl mx-auto space-y-6">
                <h1 class="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                    Oops! You've drifted too far.
                </h1>
                <p class="text-slate-500 text-lg leading-relaxed">
                    It looks like the tide took you to a place that doesn't exist. Let's get you back to the Mangrove Collection.
                </p>

                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <a href="{{ url('/') }}" wire:navigate
                        class="w-full sm:w-auto px-8 py-4 bg-[#064e3b] text-white font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-house text-sm"></i> Back to Home
                    </a>

                    <a href="{{ url('/products') }}" wire:navigate
                        class="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 font-bold rounded-2xl hover:border-[#064e3b] hover:text-[#064e3b] transition-all flex items-center justify-center">
                        Browse Products
                    </a>
                </div>
            </div>
        </div>
    </div>

    {{-- We use the native browser 'spin' animation which is already defined in Tailwind's base/standard CSS --}}
    <style>
        /* If the inline animation above doesn't trigger, keep this very simple block 
           at the bottom. Most browsers will pick up the inline 'spin' name. */
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }



        .page-404 {
            /* Add a subtle background pattern using radial gradients */
            background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
            background-size: 20px 20px;
        }
    </style>
</x-layouts::general-users>