<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\ProductReview;
use App\Rules\SafeText;
use App\Services\ReviewService;
use App\Support\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/** Reviews publish immediately; staff hide or delete the ones that break the rules. */
class ReviewController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'status' => ['nullable', Rule::enum(ReviewStatus::class)],
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'product_id' => ['nullable', 'integer'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $reviews = ProductReview::query()
            ->with(['product:id,name,slug,thumbnail', 'order:id,order_number'])
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('comment', 'like', Search::like($term))
                ->orWhere('reviewer_name', 'like', Search::like($term))
                ->orWhere('reviewer_phone', 'like', Search::like($term))
                ->orWhere('reviewer_email', 'like', Search::like($term))
                ->orWhereHas('product', fn (Builder $q) => $q->where('name', 'like', Search::like($term)))
                ->orWhereHas('order', fn (Builder $q) => $q->where('order_number', 'like', Search::like($term)))))
            ->when($request->query('status'), fn (Builder $q, $v) => $q->where('status', $v))
            ->when($request->query('rating'), fn (Builder $q, $v) => $q->where('rating', (int) $v))
            ->when($request->query('product_id'), fn (Builder $q, $v) => $q->where('product_id', (int) $v))
            ->latest()
            ->orderByDesc('id')
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        return ReviewResource::collection($reviews)->additional([
            'counts' => collect(ReviewStatus::cases())->mapWithKeys(fn (ReviewStatus $s) => [
                $s->value => ProductReview::query()->where('status', $s)->count(),
            ]),
        ]);
    }

    public function update(Request $request, ProductReview $review, ReviewService $reviews): ReviewResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(ReviewStatus::class)],
        ]);

        $reviews->setStatus($review, ReviewStatus::from($data['status']));

        return new ReviewResource($review->load(['product:id,name,slug,thumbnail', 'order:id,order_number']));
    }

    public function destroy(ProductReview $review, ReviewService $reviews): JsonResponse
    {
        $reviews->delete($review);

        return response()->json(null, 204);
    }
}
