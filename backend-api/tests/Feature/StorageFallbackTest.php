<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StorageFallbackTest extends TestCase
{
    public function test_public_disk_files_are_served_without_the_symlink(): void
    {
        Storage::fake('public')->put('uploads/2026/10/a.jpg', 'jpeg-bytes');

        $this->get('/storage/uploads/2026/10/a.jpg')->assertOk();
    }

    public function test_missing_and_hidden_files_are_not_served(): void
    {
        Storage::fake('public')->put('uploads/.htaccess', 'deny');

        $this->get('/storage/uploads/missing.jpg')->assertNotFound();
        $this->get('/storage/uploads/.htaccess')->assertNotFound();
    }
}
