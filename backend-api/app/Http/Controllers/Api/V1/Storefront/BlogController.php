<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogCategoryResource;
use App\Http\Resources\BlogCommentResource;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogCategory;
use App\Models\BlogComment;
use App\Models\BlogPost;
use App\Models\BlogPostLike;
use App\Rules\SafeText;
use App\Support\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/**
 * Public blog: published posts whose date has come, outside hidden categories.
 * Anyone can read; only signed-in users can like and comment.
 */
class BlogController extends Controller
{
    private const SLUG = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    public function categories(): AnonymousResourceCollection
    {
        $categories = BlogCategory::query()
            ->where('is_active', true)
            ->withCount(['posts' => fn (Builder $q) => $q->where('status', 'published')->where('published_at', '<=', now())])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return BlogCategoryResource::collection($categories);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'category' => ['nullable', 'string', 'max:255', 'regex:'.self::SLUG],
            'tag' => ['nullable', 'string', 'max:50', new SafeText],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(['latest', 'popular'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $posts = $this->listQuery()
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('title', 'like', Search::like($term))
                ->orWhere('excerpt', 'like', Search::like($term))))
            ->when($request->query('category'), fn (Builder $q, $slug) => $q->whereHas('category', fn (Builder $q) => $q->where('slug', $slug)->where('is_active', true)))
            ->when($request->query('tag'), fn (Builder $q, $tag) => $q->whereJsonContains('tags', $tag))
            ->when($request->boolean('featured'), fn (Builder $q) => $q->where('is_featured', true))
            ->when(
                $request->query('sort') === 'popular',
                fn (Builder $q) => $q->orderByDesc('views')->orderByDesc('published_at'),
                fn (Builder $q) => $q->orderByDesc('published_at')->orderByDesc('id'),
            )
            ->paginate((int) $request->query('per_page', 12))
            ->withQueryString();

        return BlogPostResource::collection($posts);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        abort_unless($this->validSlug($slug), 404, 'Resource not found.');

        $post = $this->listQuery()
            ->with(['media'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Server-rendered pages are cached and pass `track=0`; the visitor's browser records the view instead.
        if ($request->query('track') !== '0') {
            BlogPost::query()->whereKey($post->id)->increment('views');
        }

        $related = $this->listQuery()
            ->whereKeyNot($post->id)
            ->when($post->blog_category_id, fn (Builder $q, $categoryId) => $q->where('blog_category_id', $categoryId))
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        return response()->json([
            'data' => (new BlogPostResource($post))->full()->resolve($request),
            'related' => BlogPostResource::collection($related)->resolve($request),
        ]);
    }

    public function view(string $slug): JsonResponse
    {
        BlogPost::query()->whereKey($this->findPublished($slug)->id)->increment('views');

        return response()->json(null, 204);
    }

    public function engagement(Request $request, string $slug): JsonResponse
    {
        $post = $this->findPublished($slug);
        $user = $request->user('sanctum');

        return response()->json(['data' => [
            'likes_count' => BlogPostLike::query()->where('blog_post_id', $post->id)->count(),
            'comments_count' => BlogComment::query()->where('blog_post_id', $post->id)->where('is_hidden', false)->count(),
            'liked' => $user ? BlogPostLike::query()->where('blog_post_id', $post->id)->where('user_id', $user->id)->exists() : false,
        ]]);
    }

    public function like(Request $request, string $slug): JsonResponse
    {
        $post = $this->findPublished($slug);

        BlogPostLike::query()->insertOrIgnore([
            'blog_post_id' => $post->id,
            'user_id' => $request->user()->id,
            'created_at' => now(),
        ]);

        return response()->json(['data' => ['liked' => true, 'likes_count' => BlogPostLike::query()->where('blog_post_id', $post->id)->count()]]);
    }

    public function unlike(Request $request, string $slug): JsonResponse
    {
        $post = $this->findPublished($slug);

        BlogPostLike::query()->where('blog_post_id', $post->id)->where('user_id', $request->user()->id)->delete();

        return response()->json(['data' => ['liked' => false, 'likes_count' => BlogPostLike::query()->where('blog_post_id', $post->id)->count()]]);
    }

    public function comments(Request $request, string $slug): AnonymousResourceCollection
    {
        $post = $this->findPublished($slug);
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $viewerId = $request->user('sanctum')?->id;

        $comments = BlogComment::query()
            ->with('user:id,name,avatar')
            ->where('blog_post_id', $post->id)
            ->where('is_hidden', false)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString()
            ->through(fn (BlogComment $comment) => (new BlogCommentResource($comment))->viewer($viewerId));

        return BlogCommentResource::collection($comments);
    }

    public function comment(Request $request, string $slug): JsonResponse
    {
        $post = $this->findPublished($slug);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000', new SafeText, 'min:2'],
        ], [], ['body' => 'comment']);

        $comment = BlogComment::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $request->user()->id,
            'body' => $data['body'],
        ])->load('user:id,name,avatar');

        return (new BlogCommentResource($comment))->viewer($request->user()->id)->response()->setStatusCode(201);
    }

    /**
     * Authors can remove their own comments; staff moderate from the dashboard.
     */
    public function destroyComment(Request $request, BlogComment $comment): JsonResponse
    {
        abort_unless((int) $comment->user_id === (int) $request->user()->id, 403, 'You are not authorized to perform this action.');

        $comment->delete();

        return response()->json(null, 204);
    }

    /** @return Builder<BlogPost> */
    private function listQuery(): Builder
    {
        return BlogPost::query()
            ->published()
            ->with(['category', 'author:id,name,avatar', 'media:id,blog_post_id,type'])
            ->withCount(['likes', 'comments' => fn (Builder $q) => $q->where('is_hidden', false)]);
    }

    private function validSlug(string $slug): bool
    {
        return strlen($slug) <= 255 && preg_match(self::SLUG, $slug) === 1;
    }

    private function findPublished(string $slug): BlogPost
    {
        abort_unless($this->validSlug($slug), 404, 'Resource not found.');

        return BlogPost::query()->published()->where('slug', $slug)->select('id')->firstOrFail();
    }
}
