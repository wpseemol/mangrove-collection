<?php

namespace App\Http\Resources;

use App\Models\BlogComment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin BlogComment */
class BlogCommentResource extends JsonResource
{
    private ?int $viewerId = null;

    private bool $staff = false;

    public function viewer(?int $userId): static
    {
        $this->viewerId = $userId;

        return $this;
    }

    /**
     * Adds moderation fields (hidden flag, post); the storefront only sees visible comments.
     */
    public function forStaff(): static
    {
        $this->staff = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        // Controllers used to map with ->through(fn => new self(...)) and then wrap again with
        // ::collection(), which nests a resource inside a resource and drops viewer/staff flags.
        if ($this->resource instanceof self) {
            return $this->resource->toArray($request);
        }

        $viewerId = $this->viewerId ?? $request->user('sanctum')?->id;

        return [
            'id' => $this->id,
            'body' => $this->body,
            'author' => $this->user ? ['id' => $this->user->id, 'name' => $this->user->name, 'avatar' => $this->user->avatar] : null,
            'is_mine' => $viewerId !== null && (int) $this->user_id === (int) $viewerId,
            $this->mergeWhen($this->staff, fn () => [
                'is_hidden' => $this->is_hidden,
                'post' => $this->whenLoaded('post', fn () => $this->post
                    ? ['id' => $this->post->id, 'title' => $this->post->title, 'slug' => $this->post->slug]
                    : null),
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
