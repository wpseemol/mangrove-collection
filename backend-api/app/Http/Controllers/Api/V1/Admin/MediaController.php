<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Rules\SafeText;
use App\Support\Search;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $media = Media::query()
            ->when($request->query('q'), fn ($q, $term) => $q->where('original_name', 'like', Search::like($term)))
            ->latest()
            ->paginate((int) $request->query('per_page', 40));

        return MediaResource::collection($media);
    }

    /**
     * Accepts `files[]` (multiple) or a single `file`. SVG is intentionally
     * excluded because it can carry scripts.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required_without:files', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'files' => ['required_without:file', 'array', 'max:20'],
            'files.*' => ['image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        $files = $request->hasFile('files') ? $request->file('files') : [$request->file('file')];
        $directory = 'uploads/'.now()->format('Y/m');

        $media = collect($files)->map(fn ($file) => Media::query()->create([
            'disk' => 'public',
            'path' => $file->store($directory, 'public'),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]));

        return MediaResource::collection($media)->response()->setStatusCode(201);
    }

    public function destroy(Media $medium): JsonResponse
    {
        Storage::disk($medium->disk)->delete($medium->path);
        $medium->delete();

        return response()->json(null, 204);
    }
}
