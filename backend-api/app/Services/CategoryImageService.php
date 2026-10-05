<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Category images live on the `uploads` disk (public/uploads) as
 * `category/{category-name}-{random}.webp`. Every upload is decoded and
 * re-encoded with GD, which drops anything hidden inside the original file.
 */
class CategoryImageService
{
    public const DISK = 'uploads';

    public const DIRECTORY = 'category';

    public const WIDTH = 800;

    public const HEIGHT = 600;

    public function store(UploadedFile $file, string $categoryName): string
    {
        $source = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));

        if ($source === false) {
            throw ValidationException::withMessages(['image' => 'The image could not be read. Please upload a JPG, PNG or WEBP file.']);
        }

        $canvas = imagecreatetruecolor(self::WIDTH, self::HEIGHT);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefill($canvas, 0, 0, imagecolorallocatealpha($canvas, 0, 0, 0, 127));
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, self::WIDTH, self::HEIGHT, imagesx($source), imagesy($source));

        ob_start();
        imagewebp($canvas, null, 85);
        $binary = (string) ob_get_clean();

        $path = self::DIRECTORY.'/'.(Str::slug($categoryName) ?: 'category').'-'.Str::lower(Str::random(8)).'.webp';
        Storage::disk(self::DISK)->put($path, $binary);

        return $path;
    }

    /** Removes a stored category image; external URLs and other folders are left alone. */
    public function delete(?string $path): void
    {
        if (filled($path) && ! self::isExternal($path) && str_starts_with($path, self::DIRECTORY.'/') && ! str_contains($path, '..')) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    public static function url(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        return self::isExternal($path) ? $path : Storage::disk(self::DISK)->url($path);
    }

    private static function isExternal(string $path): bool
    {
        return Str::startsWith($path, ['http://', 'https://']);
    }
}
