<?php

use Livewire\Component;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;

new class extends Component {
    public function with(): array
    {
        // Get all segments from the URL (e.g., /products/honey/sundarban-honey)
        $segments = Request::segments();
        $breadcrumbs = [];
        $url = '';

        foreach ($segments as $segment) {
            $url .= '/' . $segment;

            // Format the segment: replace dashes with spaces and capitalize
            // e.g., 'sundarban-honey' becomes 'Sundarban Honey'
            $title = Str::of($segment)->replace('-', ' ')->title();

            $breadcrumbs[] = [
                'title' => $title,
                'url' => url($url),
                // Mark as active if it's the last segment
                'active' => end($segments) === $segment
            ];
        }

        return [
            'breadcrumbs' => $breadcrumbs
        ];
    }
}; ?>

<nav class="bg-slate-50 py-4 border-b border-gray-100 font-poppins">
    <div class="container mx-auto px-4">
        <ol class="flex items-center space-x-2 text-sm text-slate-500 font-medium whitespace-nowrap overflow-x-auto scrollbar-hide">
            <li class="flex items-center">
                <a href="/" class="hover:text-[#064e3b] transition-colors flex items-center gap-1"
                    title="Home" data-tippy-content="Home"
                    wire:navigate="/">
                    <i class="fa-solid fa-house text-xs"></i> Home
                </a>
            </li>

            @foreach($breadcrumbs as $breadcrumb)
            <li class="text-slate-300">
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
            </li>

            <li class="flex items-center">
                @if($breadcrumb['active'])
                <span class="text-slate-800 font-bold truncate max-w-50 md:max-w-none">
                    {{ $breadcrumb['title'] }}
                </span>
                @else
                <a href="{{ $breadcrumb['url'] }}" class="hover:text-[#064e3b] transition-colors"
                    title="{{ $breadcrumb['title'] }}" data-tippy-content="{{ $breadcrumb['title'] }}"
                    wire:navigate="{{ $breadcrumb['url'] }}">
                    {{ $breadcrumb['title'] }}
                </a>
                @endif
            </li>
            @endforeach
        </ol>
    </div>
</nav>