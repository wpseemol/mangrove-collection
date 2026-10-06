<?php

namespace Tests\Unit;

use App\Support\MediaUrls;
use Tests\TestCase;

class MediaUrlsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['app.url' => 'https://api.example.com']);
    }

    public function test_own_urls_are_stored_as_paths(): void
    {
        $this->assertSame('/storage/uploads/a.jpg', MediaUrls::toPath('http://localhost:8080/storage/uploads/a.jpg'));
        $this->assertSame('/storage/uploads/a.jpg', MediaUrls::toPath('http://127.0.0.1:8000/storage/uploads/a.jpg'));
        $this->assertSame('/storage/uploads/a.jpg', MediaUrls::toPath('https://api.example.com/storage/uploads/a.jpg'));
        $this->assertSame('/uploads/categories/b.png', MediaUrls::toPath('http://localhost:8080/uploads/categories/b.png'));
    }

    public function test_external_urls_are_left_alone(): void
    {
        foreach (['https://cdn.other.com/storage/a.jpg', 'https://lh3.googleusercontent.com/a/photo', 'https://www.youtube.com/watch?v=abc'] as $url) {
            $this->assertSame($url, MediaUrls::toPath($url));
            $this->assertSame($url, MediaUrls::toUrl($url));
        }
        $this->assertNull(MediaUrls::toUrl(null));
    }

    public function test_paths_and_legacy_urls_are_served_from_app_url(): void
    {
        $this->assertSame('https://api.example.com/storage/uploads/a.jpg', MediaUrls::toUrl('/storage/uploads/a.jpg'));
        $this->assertSame('https://api.example.com/storage/uploads/a.jpg', MediaUrls::toUrl('http://localhost:8080/storage/uploads/a.jpg'));
    }

    public function test_html_media_urls_are_rewritten_both_ways(): void
    {
        $stored = MediaUrls::htmlToPaths('<p><img src="http://localhost:8080/storage/uploads/a.jpg"> <a href="https://x.com/storage/b">x</a></p>');
        $this->assertSame('<p><img src="/storage/uploads/a.jpg"> <a href="https://x.com/storage/b">x</a></p>', $stored);
        $this->assertSame('<p><img src="https://api.example.com/storage/uploads/a.jpg"> <a href="https://x.com/storage/b">x</a></p>', MediaUrls::htmlToUrls($stored));
    }
}
