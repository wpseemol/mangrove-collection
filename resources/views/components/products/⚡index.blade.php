<?php

use Livewire\Component;

new class extends Component
{
    //
};
?>

<div class="container mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">

        <aside class="w-full lg:w-1/4 space-y-8">
            <div class="sticky top-24">



                <livewire:products.filter-sidebar />
            </div>
        </aside>

        <div class="w-full lg:w-3/4">

            <livewire:products.products-header />
            <livewire:products.products-grid />


        </div>

    </div>
</div>