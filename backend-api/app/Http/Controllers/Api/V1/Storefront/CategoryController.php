<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->active()
            ->withCount(['products' => fn ($q) => $q->where('status', ProductStatus::Published)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function show(string $slug): CategoryResource
    {
        $category = Category::query()
            ->active()
            ->where('slug', $slug)
            ->withCount(['products' => fn ($q) => $q->where('status', ProductStatus::Published)])
            ->firstOrFail();

        return new CategoryResource($category);
    }
}
