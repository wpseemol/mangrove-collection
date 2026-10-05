<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-product delivery charge. NULL means the product uses the checkout's shipping method price.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('products', 'shipping_cost')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('shipping_cost', 10, 2)->nullable()->after('size');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('shipping_cost');
        });
    }
};
