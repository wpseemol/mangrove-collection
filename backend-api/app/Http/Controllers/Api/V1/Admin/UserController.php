<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Rules\PhoneNumber;
use App\Rules\SafeText;
use App\Support\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'role' => ['nullable', Rule::enum(UserRole::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $users = User::query()
            ->withCount('orders')
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where(fn (Builder $q) => $q
                ->where('name', 'like', Search::like($term))
                ->orWhere('email', 'like', Search::like($term))
                ->orWhere('phone', 'like', Search::like($term))))
            ->when($request->query('role'), fn (Builder $q, $role) => $q->where('role', $role))
            ->latest()
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', new SafeText],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:32', new PhoneNumber, 'unique:users,phone'],
            'password' => ['required', 'string', 'max:128', Password::min(8)],
            'role' => ['required', Rule::enum(UserRole::class)],
        ]);

        $user = User::query()->create([...$data, 'email_verified_at' => now()]);

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->loadCount('orders'));
    }

    public function update(Request $request, User $user): UserResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', new SafeText],
            'email' => ['sometimes', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user)],
            'phone' => ['nullable', 'string', 'max:32', new PhoneNumber, Rule::unique('users')->ignore($user)],
            'role' => ['sometimes', Rule::enum(UserRole::class)],
            'is_active' => ['sometimes', 'boolean'],
            'password' => ['sometimes', 'string', 'max:128', Password::min(8)],
        ]);

        if ($user->is($request->user()) && (isset($data['role']) || isset($data['is_active']))) {
            abort(409, 'You cannot change your own role or status.');
        }

        $user->update($data);

        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        return new UserResource($user->loadCount('orders'));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($user->is($request->user()), 409, 'You cannot delete your own account.');

        $user->tokens()->delete();
        $user->delete();

        return response()->json(null, 204);
    }
}
