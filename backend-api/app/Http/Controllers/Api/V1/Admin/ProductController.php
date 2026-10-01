<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(ProductStatus::class)],
            'category_id' => ['nullable', 'integer'],
            'trashed' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $products = Product::query()
            ->with(['category', 'variants'])
            ->when($request->boolean('trashed'), fn (Builder $q) => $q->onlyTrashed())
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('name', 'like', "%{$term}%")
                ->orWhereHas('variants', fn (Builder $q) => $q->where('sku', $term))))
            ->when($request->query('status'), fn (Builder $q, $status) => $q->where('status', $status))
            ->when($request->query('category_id'), fn (Builder $q, $id) => $q->where('category_id', $id))
            ->latest()
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = DB::transaction(function () use ($request) {
            $product = Product::query()->create([
                ...$request->safe()->except(['variants', 'images']),
                'created_by' => $request->user()->id,
            ]);

            $this->syncVariants($product, $request->validated('variants'));
            $this->syncImages($product, $request->validated('images', []));

            return $product;
        });

        return (new ProductResource($product->load(['category', 'variants', 'images'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $product): ProductResource
    {
        return new ProductResource(
            Product::withTrashed()->with(['category', 'variants', 'images'])->findOrFail($product)
        );
    }

    public function update(ProductRequest $request, Product $product): ProductResource
    {
        DB::transaction(function () use ($request, $product) {
            $product->update($request->safe()->except(['variants', 'images']));

            if ($request->has('variants')) {
                $this->syncVariants($product, $request->validated('variants'));
            }

            if ($request->has('images')) {
                $this->syncImages($product, $request->validated('images', []));
            }
        });

        return new ProductResource($product->load(['category', 'variants', 'images']));
    }

    /**
     * Soft delete: order history keeps referencing the product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(null, 204);
    }

    public function restore(int $product): ProductResource
    {
        $model = Product::onlyTrashed()->findOrFail($product);
        $model->restore();

        return new ProductResource($model->load(['category', 'variants', 'images']));
    }

    /**
     * @param  list<array<string, mixed>>  $variants
     */
    protected function syncVariants(Product $product, array $variants): void
    {
        $hasDefault = collect($variants)->contains(fn ($v) => ! empty($v['is_default']));
        $keptIds = [];

        foreach (array_values($variants) as $index => $data) {
            $attributes = [
                'title' => $data['title'],
                'type' => $data['type'] ?? null,
                'sku' => $data['sku'] ?? null,
                'price' => $data['price'],
                'compare_price' => $data['compare_price'] ?? null,
                'stock' => $data['stock'] ?? null,
                'is_default' => $hasDefault ? ! empty($data['is_default']) : $index === 0,
                'sort_order' => $index,
            ];

            $variant = ! empty($data['id']) ? $product->variants()->find($data['id']) : null;

            if ($variant) {
                $variant->update($attributes);
            } else {
                $variant = $product->variants()->create($attributes);
            }

            $keptIds[] = $variant->id;
        }

        $product->variants()->whereNotIn('id', $keptIds)->delete();

        // Guarantee exactly one default variant.
        $defaults = $product->variants()->where('is_default', true)->pluck('id');
        if ($defaults->count() > 1) {
            $product->variants()->whereIn('id', $defaults->slice(1))->update(['is_default' => false]);
        }
    }

    /**
     * @param  list<array{url: string, alt?: string|null}>  $images
     */
    protected function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach (array_values($images) as $index => $image) {
            $product->images()->create([
                'url' => $image['url'],
                'alt' => $image['alt'] ?? null,
                'sort_order' => $index,
            ]);
        }
    }
}
