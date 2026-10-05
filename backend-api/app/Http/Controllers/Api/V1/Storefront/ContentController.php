<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Enums\BannerType;
use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Http\Resources\PageResource;
use App\Http\Resources\ShippingMethodResource;
use App\Models\Banner;
use App\Models\Page;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    public function banners(Request $request): AnonymousResourceCollection
    {
        $request->validate(['type' => ['nullable', Rule::enum(BannerType::class)]]);

        $banners = Banner::query()
            ->where('is_active', true)
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return BannerResource::collection($banners);
    }

    public function page(string $slug): PageResource
    {
        return new PageResource(
            Page::query()->where('slug', $slug)->where('is_published', true)->firstOrFail()
        );
    }

    public function shippingMethods(): AnonymousResourceCollection
    {
        return ShippingMethodResource::collection(
            ShippingMethod::query()->active()->orderBy('sort_order')->orderBy('price')->get()
        );
    }
}
