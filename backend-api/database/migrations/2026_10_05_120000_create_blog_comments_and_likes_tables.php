<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Blog engagement: signed-in users comment on and like posts; staff can hide or delete comments.
 * Hidden comments stay in the dashboard for moderation but are not shown on the storefront.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::hasTable('blog_comments') || Schema::create('blog_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();

            $table->index(['blog_post_id', 'is_hidden']);
        });

        Schema::hasTable('blog_post_likes') || Schema::create('blog_post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->unique(['blog_post_id', 'user_id'], 'blog_post_likes_post_user_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_post_likes');
        Schema::dropIfExists('blog_comments');
    }
};
