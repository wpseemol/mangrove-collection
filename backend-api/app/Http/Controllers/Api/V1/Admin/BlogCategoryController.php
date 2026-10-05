<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogCategoryResource;
use App\Models\BlogCategory;
use App\Rules\SafeText;
use App\Support\CategoryIcons;
use App\Support\Search;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/**
 * Everyone with dashboard access can list categories; only admins create, change or delete them.
 */
class BlogCategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['q' => ['nullable', 'string', 'max:100', new SafeText]]);

        $categories = BlogCategory::query()
            ->withCount('posts')
            ->when($request->query('q'), fn ($q, $term) => $q->where('name', 'like', Search::like($term)))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return BlogCategoryResource::collection($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $category = BlogCategory::query()->create($this->validated($request, null));

        return (new BlogCategoryResource($category->refresh()->loadCount('posts')))->response()->setStatusCode(201);
    }

    public function update(Request $request, BlogCategory $category): BlogCategoryResource
    {
        $category->update($this->validated($request, $category));

        return new BlogCategoryResource($category->loadCount('posts'));
    }

    /**
     * Posts in the category are kept and become uncategorised (the foreign key sets them to NULL).
     */
    public function destroy(BlogCategory $category): JsonResponse
    {
        $category->delete();

        return response()->json(null, 204);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?BlogCategory $category): array
    {
        return $request->validate([
            'name' => [$category ? 'sometimes' : 'required', 'string', 'max:100', new SafeText, 'min:2'],
            'slug' => [
                'nullable', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('blog_categories', 'slug')->ignore($category),
            ],
            'icon' => ['nullable', 'string', Rule::in(CategoryIcons::names())],
            'description' => ['nullable', 'string', 'max:1000', new SafeText],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ], [
            'slug.regex' => 'The :attribute may only contain lowercase letters, numbers and single dashes.',
            'icon.in' => 'Please choose an icon from the library.',
        ]);
    }
}
