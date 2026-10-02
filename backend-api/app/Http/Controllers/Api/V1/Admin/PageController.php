<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use App\Rules\SafeHtml;
use App\Rules\SafeText;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PageResource::collection(Page::query()->orderBy('slug')->get());
    }

    public function show(string $slug): PageResource
    {
        return new PageResource(Page::query()->where('slug', $slug)->firstOrFail());
    }

    /**
     * Create-or-update by slug (e.g. home, about, contact). `sections` is a
     * free-form JSON array for page blocks such as the home "about" section.
     */
    public function upsert(Request $request, string $slug): JsonResponse
    {
        $request->merge(['slug' => $slug])->validate([
            'slug' => ['required', 'string', 'max:100', 'alpha_dash:ascii'],
        ]);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255', new SafeText],
            'content' => ['nullable', 'string', 'max:100000', new SafeHtml],
            'sections' => ['nullable', 'array', 'max:50', new SafeText],
            'meta_title' => ['nullable', 'string', 'max:255', new SafeText],
            'meta_description' => ['nullable', 'string', 'max:500', new SafeText],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $page = Page::query()->updateOrCreate(['slug' => $slug], $data);

        return (new PageResource($page))->response()->setStatusCode($page->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(string $slug): JsonResponse
    {
        Page::query()->where('slug', $slug)->firstOrFail()->delete();

        return response()->json(null, 204);
    }
}
