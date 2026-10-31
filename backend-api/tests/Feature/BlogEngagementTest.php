<?php

namespace Tests\Feature;

use App\Models\BlogComment;
use App\Models\BlogPost;
use App\Models\BlogPostLike;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BlogEngagementTest extends TestCase
{
    use RefreshDatabase;

    private BlogPost $post;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->post = BlogPost::query()->create([
            'author_id' => $this->user->id,
            'title' => 'Honey tasting notes',
            'slug' => 'honey-tasting-notes',
            'excerpt' => 'How to taste raw Sundarban honey.',
            'content' => '<p>Start with a small spoon.</p>',
            'status' => 'published',
            'published_at' => now()->subHour(),
            'views' => 0,
        ]);
    }

    public function test_guests_can_read_engagement_and_comments(): void
    {
        BlogPostLike::query()->create(['blog_post_id' => $this->post->id, 'user_id' => $this->user->id]);
        BlogComment::query()->create([
            'blog_post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'body' => 'This was helpful.',
        ]);
        BlogComment::query()->create([
            'blog_post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'body' => 'Hidden from the storefront.',
            'is_hidden' => true,
        ]);

        $this->getJson("/v1/blog/posts/{$this->post->slug}/engagement")
            ->assertOk()
            ->assertJsonPath('data.likes_count', 1)
            ->assertJsonPath('data.comments_count', 1)
            ->assertJsonPath('data.liked', false);

        $this->getJson("/v1/blog/posts/{$this->post->slug}/comments")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'This was helpful.')
            ->assertJsonPath('data.0.is_mine', false)
            ->assertJsonMissingPath('data.0.is_hidden');
    }

    public function test_signed_in_users_can_like_unlike_and_comment(): void
    {
        Sanctum::actingAs($this->user);

        $this->postJson("/v1/blog/posts/{$this->post->slug}/like")
            ->assertOk()
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.likes_count', 1);

        $this->postJson("/v1/blog/posts/{$this->post->slug}/like")
            ->assertOk()
            ->assertJsonPath('data.likes_count', 1);

        $this->getJson("/v1/blog/posts/{$this->post->slug}/engagement")
            ->assertOk()
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.likes_count', 1);

        $this->deleteJson("/v1/blog/posts/{$this->post->slug}/like")
            ->assertOk()
            ->assertJsonPath('data.liked', false)
            ->assertJsonPath('data.likes_count', 0);

        $this->postJson("/v1/blog/posts/{$this->post->slug}/comments", [
            'body' => "  Great tips.\n\n\nThanks!  ",
        ])
            ->assertCreated()
            ->assertJsonPath('data.body', "Great tips.\n\nThanks!")
            ->assertJsonPath('data.is_mine', true);

        $this->getJson("/v1/blog/posts/{$this->post->slug}/comments")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_mine', true);
    }

    public function test_comment_rejects_html_and_authors_can_delete_their_own(): void
    {
        Sanctum::actingAs($this->user);

        $this->postJson("/v1/blog/posts/{$this->post->slug}/comments", [
            'body' => 'Nice post <script>alert(1)</script>',
        ])->assertUnprocessable()->assertJsonValidationErrors('body');

        $id = $this->postJson("/v1/blog/posts/{$this->post->slug}/comments", [
            'body' => 'Worth a second read.',
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs(User::factory()->create());
        $this->deleteJson("/v1/blog/comments/{$id}")->assertForbidden();

        Sanctum::actingAs($this->user);
        $this->deleteJson("/v1/blog/comments/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('blog_comments', ['id' => $id]);
    }

    public function test_guests_cannot_like_or_comment(): void
    {
        $this->postJson("/v1/blog/posts/{$this->post->slug}/like")->assertUnauthorized();
        $this->postJson("/v1/blog/posts/{$this->post->slug}/comments", ['body' => 'Hello there'])->assertUnauthorized();
    }
}
