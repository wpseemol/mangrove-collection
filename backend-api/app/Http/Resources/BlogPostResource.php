<?php

namespace App\Http\Resources;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin BlogPost */
class BlogPostResource extends JsonResource
{
    private bool $full = false;

    /**
     * Adds the body, gallery and SEO fields; lists only need the card data.
     */
    public function full(): static
    {
        $this->full = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        $media = $this->relationLoaded('media') ? $this->media : null;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'cover_image' => $this->cover_image,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at,
            'reading_minutes' => $this->readingMinutes(),
            'views' => $this->views,
            'tags' => $this->tags ?? [],
            'category' => $this->whenLoaded('category', fn () => $this->category ? new BlogCategoryResource($this->category) : null),
            'author' => $this->whenLoaded('author', fn () => $this->author
                ? ['id' => $this->author->id, 'name' => $this->author->name, 'avatar' => $this->author->avatar]
                : null),
            $this->mergeWhen($media !== null, fn () => [
                'images_count' => $media->where('type', 'image')->count(),
                'videos_count' => $media->where('type', 'video')->count(),
            ]),
            'likes_count' => $this->whenCounted('likes'),
            'comments_count' => $this->whenCounted('comments'),
            $this->mergeWhen($this->full, fn () => [
                'content' => $this->content,
                'meta_title' => $this->meta_title,
                'meta_description' => $this->meta_description,
                'media' => $this->whenLoaded('media', fn () => BlogMediaResource::collection($this->media)),
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function readingMinutes(): int
    {
        $words = preg_split('/\s+/', (string) preg_replace('/<[^>]*>/', ' ', (string) $this->content), -1, PREG_SPLIT_NO_EMPTY);

        return max(1, (int) round(count($words) / 200));
    }
}
