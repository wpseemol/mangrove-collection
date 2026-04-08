<?php

use Livewire\Component;

new class extends Component
{
    // Define the variables in the PHP class
    public string $phone = '8801700000000';
    public string $message = "Hello Mangrove Collection! I'm interested in your products.";
    public string $color = '#064e3b';

    public function with(): array
    {
        return [
            // Generate the URL in the backend to keep the frontend clean
            'whatsappUrl' => "https://wa.me/{$this->phone}?text=" . urlencode($this->message),
        ];
    }
}; ?>

<div class="fixed md:bottom-6 bottom-16 right-6 z-50 group">
    <div class="absolute bottom-24 right-0 bg-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 text-slate-800 text-sm font-bold whitespace-nowrap opacity-0 translate-y-4 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-3">
        <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        Chat with us
        <div class="absolute -bottom-1 right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100"></div>
    </div>

    <a href="{{ $whatsappUrl }}"
        target="_blank"
        class="relative flex items-center justify-center w-16 h-16 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-500 ease-in-out active:scale-90"
        style="background-color: #064e3b;">

        <span class="absolute inset-0 rounded-full animate-ping opacity-25" style="background-color: #064e3b;"></span>

        <i class="fa-brands fa-whatsapp text-4xl relative z-10"></i>

        <span class="absolute top-1 right-1 w-5 h-5 bg-emerald-400 border-4 border-white rounded-full"></span>
    </a>
</div>