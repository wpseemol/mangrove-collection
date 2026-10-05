<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return AddressResource::collection(
            $request->user()->addresses()->orderByDesc('is_default')->latest()->get()
        );
    }

    public function store(AddressRequest $request): JsonResponse
    {
        $user = $request->user();

        $address = DB::transaction(function () use ($request, $user) {
            $isDefault = $request->boolean('is_default') || ! $user->addresses()->exists();

            if ($isDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            return $user->addresses()->create([...$request->validated(), 'is_default' => $isDefault]);
        });

        return (new AddressResource($address))->response()->setStatusCode(201);
    }

    public function show(Request $request, int $address): AddressResource
    {
        return new AddressResource($this->find($request, $address));
    }

    public function update(AddressRequest $request, int $address): AddressResource
    {
        $model = $this->find($request, $address);

        DB::transaction(function () use ($request, $model) {
            if ($request->boolean('is_default')) {
                $request->user()->addresses()->whereKeyNot($model->id)->update(['is_default' => false]);
            }

            $model->update($request->validated());
        });

        return new AddressResource($model);
    }

    public function destroy(Request $request, int $address): JsonResponse
    {
        $model = $this->find($request, $address);
        $model->delete();

        if ($model->is_default) {
            $request->user()->addresses()->latest()->first()?->update(['is_default' => true]);
        }

        return response()->json(null, 204);
    }

    protected function find(Request $request, int $id): Address
    {
        return $request->user()->addresses()->findOrFail($id);
    }
}
