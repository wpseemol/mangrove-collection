<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Rules\SafeText;
use App\Support\BlogVideo;
use App\Support\Search;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MediaController extends Controller
{
    public const MAX_VIDEO_MEGABYTES = 100;

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $media = Media::query()
            ->when($request->query('q'), fn ($q, $term) => $q->where('original_name', 'like', Search::like($term)))
            ->latest()
            ->paginate((int) $request->query('per_page', 40))
            ->withQueryString();

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

    /**
     * Blog videos (MP4 / WebM, one at a time). Images go through `store`.
     */
    public function storeVideo(Request $request): JsonResponse
    {
        $files = $request->allFiles();
        $count = count(Arr::flatten($files));

        if ($count > 1) {
            throw ValidationException::withMessages(['file' => 'Upload one video at a time.']);
        }

        $file = $request->file('file');

        if (! $file instanceof UploadedFile || ! $file->isValid()) {
            throw ValidationException::withMessages(['file' => $file instanceof UploadedFile && in_array($file->getError(), [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
                ? 'The video must not be larger than '.self::MAX_VIDEO_MEGABYTES.' MB.'
                : 'Choose a video to upload.']);
        }

        $format = BlogVideo::sniff($file->getRealPath());

        if (! $format) {
            throw ValidationException::withMessages(['file' => 'The video must be an MP4 or WebM file.']);
        }

        if ($file->getSize() > self::MAX_VIDEO_MEGABYTES * 1024 * 1024) {
            throw ValidationException::withMessages(['file' => 'The video must not be larger than '.self::MAX_VIDEO_MEGABYTES.' MB.']);
        }

        $path = $file->storeAs('uploads/'.now()->format('Y/m'), Str::random(40).'.'.$format['extension'], 'public');

        $media = Media::query()->create([
            'disk' => 'public',
            'path' => $path,
            'original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
            'mime_type' => $format['mime'],
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        return (new MediaResource($media))->response()->setStatusCode(201);
    }

    public function destroy(Media $medium): JsonResponse
    {
        Storage::disk($medium->disk)->delete($medium->path);
        $medium->delete();

        return response()->json(null, 204);
    }
}
