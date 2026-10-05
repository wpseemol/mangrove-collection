<?php

namespace Database\Seeders\Concerns;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

trait StoresSeedImages
{
    /**
     * Center-crops the photo to the target aspect ratio, resizes it to exactly $width x $height
     * and stores the JPEG on the public disk as a media library entry.
     */
    protected function storeSeedImage(string $source, string $path, int $width, int $height, int $quality, ?int $adminId): Media
    {
        $image = is_file($source) ? imagecreatefromstring((string) file_get_contents($source)) : false;

        if ($image === false) {
            throw new RuntimeException("Seed image missing or unreadable: {$source}");
        }

        $srcWidth = imagesx($image);
        $srcHeight = imagesy($image);
        $cropWidth = min($srcWidth, (int) round($srcHeight * $width / $height));
        $cropHeight = min($srcHeight, (int) round($srcWidth * $height / $width));

        $canvas = imagecreatetruecolor($width, $height);
        imagecopyresampled(
            $canvas, $image,
            0, 0, intdiv($srcWidth - $cropWidth, 2), intdiv($srcHeight - $cropHeight, 2),
            $width, $height, $cropWidth, $cropHeight,
        );

        ob_start();
        imagejpeg($canvas, null, $quality);
        $jpeg = (string) ob_get_clean();

        Storage::disk('public')->put($path, $jpeg);

        return Media::query()->create([
            'disk' => 'public',
            'path' => $path,
            'original_name' => basename($source),
            'mime_type' => 'image/jpeg',
            'size' => strlen($jpeg),
            'uploaded_by' => $adminId,
        ]);
    }
}
