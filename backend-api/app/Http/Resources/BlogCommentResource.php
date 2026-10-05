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
        return [
            'id' => $this->id,
            'body' => $this->body,
            'author' => $this->user ? ['id' => $this->user->id, 'name' => $this->user->name, 'avatar' => $this->user->avatar] : null,
            'is_mine' => $this->viewerId !== null && (int) $this->user_id === $this->viewerId,
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
