<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Rules\SafeText;
use App\Services\CategoryImageService;
use App\Support\Search;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Throwable;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryImageService $images) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['q' => ['nullable', 'string', 'max:100', new SafeText]]);

        $categories = Category::query()
            ->withCount('products')
            ->when($request->query('q'), fn ($q, $term) => $q->where('name', 'like', Search::like($term)))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->images->store($request->file('image'), $data['name']);
        }

        try {
            $category = Category::query()->create([...$data, 'created_by' => $request->user()->id]);
        } catch (Throwable $e) {
            $this->images->delete($data['image'] ?? null);
            throw $e;
        }

        return (new CategoryResource($category->refresh()->loadCount('products')))->response()->setStatusCode(201);
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->loadCount('products'));
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $data = $request->safe()->except(['image', 'remove_image']);
        $previousImage = $category->image;

        if ($request->hasFile('image')) {
            $data['image'] = $this->images->store($request->file('image'), $data['name'] ?? $category->name);
        } elseif ($request->boolean('remove_image')) {
            $data['image'] = null;
        }

        try {
            $category->update($data);
        } catch (Throwable $e) {
            if ($request->hasFile('image')) {
                $this->images->delete($data['image']);
            }
            throw $e;
        }

        if (array_key_exists('image', $data) && $previousImage !== $category->image) {
            $this->images->delete($previousImage);
        }

        return new CategoryResource($category->loadCount('products'));
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->withTrashed()->exists()) {
            return response()->json([
                'message' => 'This category still has products. Move or delete them first.',
            ], 409);
        }

        $category->delete();
        $this->images->delete($category->image);

        return response()->json(null, 204);
    }
}
