<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Verified-buyer product reviews. The reviewer's phone and email are copied from
 * the delivered order so they can edit or delete the review later by confirming
 * either one. `products.rating_avg` / `rating_count` cache the published totals.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reviewer_name', 100);
            $table->string('reviewer_phone', 20)->nullable()->index();
            $table->string('reviewer_email')->nullable()->index();
            $table->unsignedTinyInteger('rating');
            $table->text('comment');
            $table->json('images')->nullable();
            $table->string('status', 20)->default('published');
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'order_id']);
            $table->index(['product_id', 'status', 'created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('rating_avg', 3, 2)->default(0)->after('popularity');
            $table->unsignedInteger('rating_count')->default(0)->after('rating_avg');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['rating_avg', 'rating_count']);
        });

        Schema::dropIfExists('product_reviews');
    }
};
