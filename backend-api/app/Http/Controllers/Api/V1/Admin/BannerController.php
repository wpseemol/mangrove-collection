<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\BannerType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class BannerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['type' => ['nullable', Rule::enum(BannerType::class)]]);

        return BannerResource::collection(
            Banner::query()
                ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
                ->orderBy('type')
                ->orderBy('sort_order')
                ->get()
        );
    }

    public function store(BannerRequest $request): JsonResponse
    {
        return (new BannerResource(Banner::query()->create($request->validated())->refresh()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Banner $banner): BannerResource
    {
        return new BannerResource($banner);
    }

    public function update(BannerRequest $request, Banner $banner): BannerResource
    {
        $banner->update($request->validated());

        return new BannerResource($banner);
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $banner->delete();

        return response()->json(null, 204);
    }
}
