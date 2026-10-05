<?php

namespace App\Http\Resources;

use App\Models\BlogPostMedia;
use App\Support\BlogVideo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin BlogPostMedia */
class BlogMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $video = $this->type === 'video';

        return [
            'id' => $this->id,
            'type' => $this->type,
            'provider' => $this->provider,
            'url' => $this->url,
            'embed_url' => $video ? BlogVideo::embedUrl($this->provider, $this->url) : null,
            'thumbnail' => $video ? BlogVideo::thumbnail($this->provider, $this->url) : $this->url,
            'caption' => $this->caption,
        ];
    }
}
