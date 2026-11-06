<?php

namespace Tests\Unit;

use App\Support\BlogVideo;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class BlogVideoTest extends TestCase
{
    #[DataProvider('acceptedLinks')]
    public function test_it_detects_supported_video_links(string $url, string $provider): void
    {
        $this->assertSame($provider, BlogVideo::detectProvider($url));
        $this->assertTrue(BlogVideo::isVideoUrl($provider, $url));
    }

    public static function acceptedLinks(): array
    {
        return [
            'youtube watch' => ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube'],
            'youtube shorts' => ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'youtube'],
            'facebook reel' => ['https://www.facebook.com/reel/123456789012345', 'facebook'],
            'facebook watch' => ['https://www.facebook.com/watch/?v=123456789012345', 'facebook'],
            'fb.watch' => ['https://fb.watch/abcdEFGH/', 'facebook'],
            'vimeo' => ['https://vimeo.com/123456789', 'vimeo'],
        ];
    }

    public function test_facebook_embed_uses_official_plugin(): void
    {
        $url = 'https://www.facebook.com/reel/123456789012345';

        $this->assertSame(
            'https://www.facebook.com/plugins/video.php?href='.rawurlencode($url).'&show_text=false',
            BlogVideo::embedUrl('facebook', $url),
        );
    }

    public function test_it_rejects_unknown_hosts(): void
    {
        $this->assertNull(BlogVideo::detectProvider('https://evil.test/watch?v=dQw4w9WgXcQ'));
        $this->assertNull(BlogVideo::detectProvider('javascript:alert(1)'));
    }
}
