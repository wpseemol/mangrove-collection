<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Query params: q, category (comma-separated slugs), tag, featured, min_price, max_price,
     * sort (latest|oldest|price_asc|price_desc|popular|name), per_page.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:255'],
            'tag' => ['nullable', 'string', 'max:50'],
            'featured' => ['nullable', 'boolean'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'sort' => ['nullable', 'in:latest,oldest,price_asc,price_desc,popular,name'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:60'],
        ]);

        $products = Product::query()
            ->select('products.*')
            ->withMinPrice()
            ->published()
            ->with(['category', 'variants'])
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('name', 'like', "%{$term}%")
                ->orWhere('short_description', 'like', "%{$term}%")))
            ->when($request->query('category'), fn (Builder $q, $slugs) => $q->whereHas('category', fn (Builder $q) => $q->whereIn('slug', explode(',', $slugs))))
            ->when($request->query('tag'), fn (Builder $q, $tag) => $q->whereJsonContains('tags', $tag))
            ->when($request->boolean('featured'), fn (Builder $q) => $q->where('is_featured', true))
            ->when($request->filled('min_price'), fn (Builder $q) => $q->whereHas('variants', fn (Builder $q) => $q->where('price', '>=', $request->float('min_price'))))
            ->when($request->filled('max_price'), fn (Builder $q) => $q->whereHas('variants', fn (Builder $q) => $q->where('price', '<=', $request->float('max_price'))))
            ->tap(fn (Builder $q) => match ($request->query('sort', 'latest')) {
                'oldest' => $q->oldest(),
                'price_asc' => $q->orderBy('min_price'),
                'price_desc' => $q->orderByDesc('min_price'),
                'popular' => $q->orderByDesc('popularity'),
                'name' => $q->orderBy('name'),
                default => $q->latest(),
            })
            ->orderByDesc('products.id')
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::query()
            ->published()
            ->where('slug', $slug)
            ->with(['category', 'variants', 'images'])
            ->firstOrFail();

        return new ProductResource($product);
    }

    public function related(string $slug): AnonymousResourceCollection
    {
        $product = Product::query()->published()->where('slug', $slug)->firstOrFail();

        $related = Product::query()
            ->published()
            ->with(['category', 'variants'])
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->orderByDesc('popularity')
            ->limit(8)
            ->get();

        return ProductResource::collection($related);
    }
}
