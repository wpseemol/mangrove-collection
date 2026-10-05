<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use App\Rules\SafeHtml;
use App\Rules\SafeText;
use App\Rules\SafeUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Validator as ValidatorInstance;

class PageController extends Controller
{
    /** Inline `[label](target)` links in page block text. */
    private const INLINE_LINK = '/\[[^\]\n]*\]\(([^)\s]*)\)/';

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

        $data = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255', new SafeText],
            'content' => ['nullable', 'string', 'max:100000', new SafeHtml],
            'sections' => ['nullable', 'array', 'max:50', new SafeText],
            'meta_title' => ['nullable', 'string', 'max:255', new SafeText],
            'meta_description' => ['nullable', 'string', 'max:500', new SafeText],
            'is_published' => ['sometimes', 'boolean'],
        ])->after(fn (ValidatorInstance $validator) => $this->checkSectionUrls($validator, $request->input('sections'), 'sections'))->validate();

        $page = Page::query()->updateOrCreate(['slug' => $slug], $data);

        return (new PageResource($page->refresh()))->response()->setStatusCode($page->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(string $slug): JsonResponse
    {
        Page::query()->where('slug', $slug)->firstOrFail()->delete();

        return response()->json(null, 204);
    }

    /**
     * Link and image fields inside page blocks (`image`, `*_url`, at any depth) and inline `[label](target)`
     * links in their text must be http(s) links or site paths.
     */
    private function checkSectionUrls(ValidatorInstance $validator, mixed $value, string $path): void
    {
        if (is_string($value)) {
            preg_match_all(self::INLINE_LINK, $value, $matches);

            foreach ($matches[1] as $target) {
                if (! SafeUrl::isSafe($target, true)) {
                    $validator->errors()->add($path, "The {$path} has a link that is not a valid http(s) link or a path starting with /.");

                    return;
                }
            }

            return;
        }

        if (! is_array($value)) {
            return;
        }

        foreach ($value as $key => $item) {
            $itemPath = "{$path}.{$key}";
            $isLinkField = ! array_is_list($value) && ($key === 'image' || str_ends_with((string) $key, '_url'));

            if ($isLinkField && is_string($item) && $item !== '' && ! SafeUrl::isSafe($item, true)) {
                $validator->errors()->add($itemPath, "The {$itemPath} must be a valid http(s) link or a path starting with /.");
            } else {
                $this->checkSectionUrls($validator, $item, $itemPath);
            }
        }
    }
}
