<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Email addresses collected by the storefront's newsletter form.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::hasTable('newsletter_subscribers') || Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('status', 20)->default('subscribed')->index();
            $table->string('source', 50)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscribers');
    }
};
