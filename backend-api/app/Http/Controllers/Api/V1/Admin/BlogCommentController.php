<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\BlogCommentResource;
use App\Models\BlogComment;
use App\Rules\SafeText;
use App\Support\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/**
 * Admins moderate every comment; managers only those on their own posts.
 */
class BlogCommentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'visibility' => ['nullable', Rule::in(['visible', 'hidden'])],
            'post_id' => ['nullable', 'integer'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $comments = $this->scoped($request)
            ->with(['user:id,name,avatar', 'post:id,title,slug'])
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('body', 'like', Search::like($term))
                ->orWhereHas('user', fn (Builder $q) => $q->where('name', 'like', Search::like($term)))))
            ->when($request->query('visibility'), fn (Builder $q, $visibility) => $q->where('is_hidden', $visibility === 'hidden'))
            ->when($request->query('post_id'), fn (Builder $q, $postId) => $q->where('blog_post_id', $postId))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString()
            ->through(fn (BlogComment $comment) => (new BlogCommentResource($comment))->forStaff());

        return BlogCommentResource::collection($comments)->additional([
            'counts' => [
                'visible' => $this->scoped($request)->where('is_hidden', false)->count(),
                'hidden' => $this->scoped($request)->where('is_hidden', true)->count(),
            ],
        ]);
    }

    public function update(Request $request, BlogComment $comment): BlogCommentResource
    {
        $this->ensureOwner($request, $comment);
        $data = $request->validate(['is_hidden' => ['required', 'boolean']]);

        $comment->update(['is_hidden' => (bool) $data['is_hidden']]);

        return (new BlogCommentResource($comment->load(['user:id,name,avatar', 'post:id,title,slug'])))->forStaff();
    }

    public function destroy(Request $request, BlogComment $comment): JsonResponse
    {
        $this->ensureOwner($request, $comment);
        $comment->delete();

        return response()->json(null, 204);
    }

    /** @return Builder<BlogComment> */
    private function scoped(Request $request): Builder
    {
        $user = $request->user();

        return BlogComment::query()->when(
            $user->role !== UserRole::Admin,
            fn (Builder $q) => $q->whereHas('post', fn (Builder $q) => $q->where('author_id', $user->id)),
        );
    }

    private function ensureOwner(Request $request, BlogComment $comment): void
    {
        $user = $request->user();

        abort_if(
            $user->role !== UserRole::Admin && (int) $comment->post?->author_id !== (int) $user->id,
            403,
            'You can only change blog posts you wrote.',
        );
    }
}
