<div class="flex items-center gap-3 cursor-pointer group">
    @auth
    {{-- Show this when the user IS logged in --}}
    <a href="{{ route('dashboard') }}" wire:navigate class="flex items-center gap-3 cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-emerald-500/10 border border-primary-light flex items-center justify-center text-primary-light font-bold text-xl group-hover:bg-primary-light group-hover:text-white transition-all">
            {{-- Gets the first letter of the User's Name (e.g., 'S' for Seemol) --}}
            {{ substr(auth()->user()->name, 0, 1) }}
        </div>
    </a>

    <div class="hidden xl:block">
        <a href="{{ route('dashboard') }}" wire:navigate>
            <p class="text-sm font-semibold leading-none">
                {{ auth()->user()->name }} {{-- Shows First Name/Full Name --}}
            </p>
            <p class="text-[11px] text-gray-400 mt-1">
                {{ auth()->user()->email }} {{-- Shows Email --}}
            </p>
        </a>
    </div>
    @endauth

    @guest
    {{-- Show this when the user is NOT logged in --}}
    <a href="{{ route('login') }}" class="flex items-center gap-3 cursor-pointer group" wire:navigate>
        <div class="text-primary-light text-2xl group-hover:scale-110 transition duration-200">
            <i class="fa-solid fa-user-lock"></i>
        </div>

        <div class="hidden xl:block">
            <p class="text-sm font-semibold leading-none">
                Login
            </p>
            <p class="text-[11px] text-gray-400 mt-1">Access your account</p>
        </div>
    </a>
    @endguest
</div>