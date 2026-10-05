<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use App\Models\BlogPostMedia;
use App\Rules\SafeBlogHtml;
use App\Rules\SafeText;
use App\Rules\SafeUrl;
use App\Support\BlogVideo;
use App\Support\Search;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator as ValidatorFactory;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Admins manage every post; managers write posts but may only change their own.
 */
class BlogPostController extends Controller
{
    public const MAX_MEDIA = 30;

    private const DATE_TIME = '/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/';

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'status' => ['nullable', Rule::in(BlogPost::STATUSES)],
            'category_id' => ['nullable', 'integer'],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(['latest', 'oldest', 'title', 'views'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $posts = $this->owned($request)
            ->with(self::relations())
            ->withCount(['likes', 'comments'])
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('title', 'like', Search::like($term))
                ->orWhere('excerpt', 'like', Search::like($term))))
            ->when($request->query('status'), fn (Builder $q, $status) => $q->where('status', $status))
            ->when($request->query('category_id'), fn (Builder $q, $id) => $q->where('blog_category_id', $id))
            ->when($request->boolean('featured'), fn (Builder $q) => $q->where('is_featured', true))
            ->tap(fn (Builder $q) => match ($request->query('sort')) {
                'oldest' => $q->orderBy('created_at'),
                'title' => $q->orderBy('title'),
                'views' => $q->orderByDesc('views'),
                default => $q->orderByDesc('created_at')->orderByDesc('id'),
            })
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        $byStatus = $this->owned($request)->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return BlogPostResource::collection($posts)->additional([
            'counts' => collect(BlogPost::STATUSES)->mapWithKeys(fn (string $status) => [$status => (int) ($byStatus[$status] ?? 0)]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        ['fields' => $fields, 'media' => $media] = $this->validatePost($request, null);

        $post = DB::transaction(function () use ($request, $fields, $media) {
            $post = BlogPost::query()->create([
                ...$fields,
                'published_at' => $this->publishDate($fields, null),
                'author_id' => $request->user()->id,
            ]);

            $this->syncMedia($post, $media ?? []);

            return $post;
        });

        return (new BlogPostResource($this->load($post)))->full()->response()->setStatusCode(201);
    }

    public function show(Request $request, BlogPost $post): BlogPostResource
    {
        $this->ensureOwner($request, $post);

        return (new BlogPostResource($this->load($post)))->full();
    }

    public function update(Request $request, BlogPost $post): BlogPostResource
    {
        $this->ensureOwner($request, $post);
        ['fields' => $fields, 'media' => $media] = $this->validatePost($request, $post);
        $publishedAt = $this->publishDate($fields, $post);

        DB::transaction(function () use ($post, $fields, $media, $publishedAt) {
            $post->update($publishedAt === false ? $fields : [...$fields, 'published_at' => $publishedAt]);

            if ($media !== null) {
                $this->syncMedia($post, $media);
            }
        });

        return (new BlogPostResource($this->load($post)))->full();
    }

    public function destroy(Request $request, BlogPost $post): JsonResponse
    {
        $this->ensureOwner($request, $post);
        $post->delete();

        return response()->json(null, 204);
    }

    /**
     * @return array<int|string, mixed>
     */
    private static function relations(): array
    {
        return ['category', 'author:id,name,avatar', 'media'];
    }

    private function load(BlogPost $post): BlogPost
    {
        return $post->fresh()->load(self::relations())->loadCount(['likes', 'comments']);
    }

    /** @return Builder<BlogPost> */
    private function owned(Request $request): Builder
    {
        return BlogPost::query()->when(
            $request->user()->role !== UserRole::Admin,
            fn (Builder $q) => $q->where('author_id', $request->user()->id),
        );
    }

    private function ensureOwner(Request $request, BlogPost $post): void
    {
        $user = $request->user();

        abort_if(
            $user->role !== UserRole::Admin && (int) $post->author_id !== (int) $user->id,
            403,
            'You can only change blog posts you wrote.',
        );
    }

    /**
     * @return array{fields: array<string, mixed>, media: list<array<string, mixed>>|null}
     */
    private function validatePost(Request $request, ?BlogPost $post): array
    {
        $data = ValidatorFactory::make($request->all(), [
            'title' => [$post ? 'sometimes' : 'required', 'string', 'max:255', new SafeText, 'min:3'],
            'slug' => [
                'nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('blog_posts', 'slug')->ignore($post),
            ],
            'blog_category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
            'excerpt' => ['nullable', 'string', 'max:500', new SafeText],
            'content' => ['nullable', 'string', 'max:300000', new SafeBlogHtml],
            'cover_image' => ['nullable', 'string', 'max:2048', new SafeUrl],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', 'max:50', new SafeText],
            'status' => ['sometimes', Rule::in(BlogPost::STATUSES)],
            'is_featured' => ['sometimes', 'boolean'],
            'published_at' => ['nullable', 'string', 'max:40', 'regex:'.self::DATE_TIME, 'date'],
            'meta_title' => ['nullable', 'string', 'max:255', new SafeText],
            'meta_description' => ['nullable', 'string', 'max:500', new SafeText],
            'media' => ['sometimes', 'array', 'max:'.self::MAX_MEDIA],
            'media.*.type' => ['required', Rule::in(['image', 'video'])],
            'media.*.url' => ['required', 'string', 'max:2048', new SafeUrl],
            'media.*.caption' => ['nullable', 'string', 'max:255', new SafeText],
        ], [
            'slug.regex' => 'The :attribute may only contain lowercase letters, numbers and single dashes.',
            'blog_category_id.exists' => 'The selected category is invalid.',
            'published_at.regex' => 'The :attribute is not a valid date.',
            'published_at.date' => 'The :attribute is not a valid date.',
        ])->after(function (Validator $validator) use ($request) {
            foreach ((array) $request->input('media', []) as $index => $item) {
                if (is_array($item) && ($item['type'] ?? null) === 'video' && is_string($item['url'] ?? null) && ! BlogVideo::detectProvider($item['url'])) {
                    $validator->errors()->add("media.{$index}.url", 'Use a YouTube or Vimeo link, or upload an MP4/WebM video.');
                }
            }
        })->validate();

        $media = array_key_exists('media', $data) ? array_values($data['media']) : null;
        unset($data['media']);

        if (array_key_exists('published_at', $data) && $data['published_at'] !== null) {
            $data['published_at'] = Carbon::parse($data['published_at']);
        }

        return ['fields' => $data, 'media' => $media];
    }

    /**
     * Publishing without a date stamps "now"; a future date schedules the post.
     * Returns false when an existing post's date should stay as it is.
     */
    private function publishDate(array $fields, ?BlogPost $existing): CarbonInterface|false|null
    {
        // TIMESTAMP(0) rounds fractions up, which would push "now" into the future and hide the post for a second.
        $now = now()->startOfSecond();
        $publishing = ($fields['status'] ?? $existing?->status) === 'published';

        if (! empty($fields['published_at'])) {
            return $fields['published_at'];
        }

        if (array_key_exists('published_at', $fields)) {
            return $publishing ? $now : null;
        }

        if ($publishing && ! $existing?->published_at) {
            return $now;
        }

        return $existing ? false : null;
    }

    /**
     * @param  list<array<string, mixed>>  $media
     */
    private function syncMedia(BlogPost $post, array $media): void
    {
        BlogPostMedia::query()->where('blog_post_id', $post->id)->delete();

        foreach ($media as $index => $item) {
            $post->media()->create([
                'type' => $item['type'],
                'provider' => $item['type'] === 'video' ? BlogVideo::detectProvider($item['url']) : 'upload',
                'url' => $item['url'],
                'caption' => $item['caption'] ?? null,
                'sort_order' => $index,
            ]);
        }
    }
}
