<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\ProductReview;
use App\Rules\SafeText;
use App\Services\ReviewService;
use App\Support\ReviewerIdentity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    private const MESSAGES = [
        'can_review' => 'Thanks for shopping with us! Share your experience with this product.',
        'already_reviewed' => 'You have already reviewed this product. You can edit or delete your review below.',
        'not_delivered' => 'Your order is on its way. You can review this product once it has been delivered.',
        'no_order' => 'We could not find a delivered order for this product with that phone number or email. Only customers who received it can leave a review.',
    ];

    /** Published reviews with a rating summary. Query: rating (1-5), with_photos, sort (newest|highest|lowest), page. */
    public function index(Request $request, string $slug): AnonymousResourceCollection
    {
        $request->validate([
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'with_photos' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'in:newest,highest,lowest'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:30'],
        ]);

        $product = Product::query()->published()->where('slug', $slug)->firstOrFail();
        $published = $product->reviews()->published();

        $reviews = (clone $published)
            ->when($request->query('rating'), fn (Builder $q, $rating) => $q->where('rating', (int) $rating))
            ->when($request->boolean('with_photos'), fn (Builder $q) => $q->whereNotNull('images'))
            ->tap(fn (Builder $q) => match ($request->query('sort', 'newest')) {
                'highest' => $q->orderByDesc('rating'),
                'lowest' => $q->orderBy('rating'),
                default => null,
            })
            ->latest()
            ->orderByDesc('id')
            ->paginate((int) $request->query('per_page', 10))
            ->withQueryString();

        $breakdown = (clone $published)->selectRaw('rating, COUNT(*) as total')->groupBy('rating')->pluck('total', 'rating');

        return ReviewResource::collection($reviews)->additional([
            'summary' => [
                'average' => (float) $product->rating_avg,
                'count' => (int) $product->rating_count,
                'breakdown' => collect([5, 4, 3, 2, 1])->mapWithKeys(fn (int $star) => [$star => (int) ($breakdown[$star] ?? 0)]),
                'with_photos' => (clone $published)->whereNotNull('images')->count(),
            ],
        ]);
    }

    /**
     * Quick buyer check with one input — the phone number or email used on the
     * order (signed-in customers can skip it). Returns a short-lived token that
     * authorises writing, editing or deleting this customer's review.
     */
    public function verify(Request $request, string $slug, ReviewService $reviews): JsonResponse
    {
        $request->validate([
            'contact' => ['nullable', 'string', 'max:255', new SafeText],
        ]);

        $product = Product::query()->published()->where('slug', $slug)->firstOrFail();
        $user = $request->user('sanctum');

        if ($request->filled('contact')) {
            $identity = ReviewerIdentity::fromContact($request->string('contact')->toString());

            if (! $identity) {
                throw ValidationException::withMessages(['contact' => 'Enter the mobile number (e.g. 01712345678) or email address you used when ordering.']);
            }
        } elseif ($user) {
            $identity = ReviewerIdentity::fromUser($user);
        } else {
            throw ValidationException::withMessages(['contact' => 'Enter the mobile number or email address you used when ordering.']);
        }

        $check = $reviews->check($product, $identity);
        $eligible = in_array($check['status'], ['can_review', 'already_reviewed'], true);

        return response()->json([
            'data' => [
                'status' => $check['status'],
                'eligible' => $eligible,
                'message' => self::MESSAGES[$check['status']],
                'token' => $eligible ? $identity->toToken($product->id) : null,
                'expires_in' => $eligible ? ReviewerIdentity::TOKEN_TTL_MINUTES * 60 : null,
                'reviewer_name' => $check['order'] ? (new ProductReview(['reviewer_name' => $check['order']->customer_name]))->displayName() : null,
                'review' => $check['review'] ? new ReviewResource($check['review']) : null,
            ],
        ]);
    }

    public function store(ReviewRequest $request, string $slug, ReviewService $reviews): JsonResponse
    {
        $product = Product::query()->published()->where('slug', $slug)->firstOrFail();
        $identity = $this->identity($request, $product->id);

        $review = $reviews->create($product, $identity, $request->reviewData(), $request->newImages());

        return (new ReviewResource($review))->response()->setStatusCode(201);
    }

    public function update(ReviewRequest $request, ProductReview $review, ReviewService $reviews): ReviewResource
    {
        $this->authorizeOwner($request, $review);

        return new ReviewResource($reviews->update($review, $request->reviewData(), $request->keptImages(), $request->newImages()));
    }

    public function destroy(Request $request, ProductReview $review, ReviewService $reviews): JsonResponse
    {
        $this->authorizeOwner($request, $review);

        $reviews->delete($review);

        return response()->json(null, 204);
    }

    private function identity(Request $request, int $productId): ReviewerIdentity
    {
        $identity = ReviewerIdentity::fromToken($request->header('X-Review-Token'), $productId);

        abort_unless($identity !== null, 403, 'Your check has expired. Please confirm your phone number or email again.');

        return $identity;
    }

    /** Someone else's review is reported as missing rather than forbidden. */
    private function authorizeOwner(Request $request, ProductReview $review): void
    {
        abort_unless($this->identity($request, $review->product_id)->owns($review), 404);
    }
}
