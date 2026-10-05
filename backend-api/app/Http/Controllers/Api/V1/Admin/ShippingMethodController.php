<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ShippingMethodRequest;
use App\Http\Resources\ShippingMethodResource;
use App\Models\ShippingMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShippingMethodController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ShippingMethodResource::collection(ShippingMethod::query()->orderBy('sort_order')->get());
    }

    public function store(ShippingMethodRequest $request): JsonResponse
    {
        return (new ShippingMethodResource(ShippingMethod::query()->create($request->validated())->refresh()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(ShippingMethod $shippingMethod): ShippingMethodResource
    {
        return new ShippingMethodResource($shippingMethod);
    }

    public function update(ShippingMethodRequest $request, ShippingMethod $shippingMethod): ShippingMethodResource
    {
        $shippingMethod->update($request->validated());

        return new ShippingMethodResource($shippingMethod);
    }

    public function destroy(ShippingMethod $shippingMethod): JsonResponse
    {
        $shippingMethod->delete();

        return response()->json(null, 204);
    }
}
