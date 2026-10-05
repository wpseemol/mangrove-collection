<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Customer review photos live on the `uploads` disk as `reviews/{yyyymm}/{random}.webp`.
 * Each upload is decoded, turned upright (phone EXIF orientation), shrunk to fit
 * MAX_SIDE and re-encoded with GD, which drops metadata (GPS) and anything hidden in the file.
 */
class ReviewImageService
{
    public const DISK = 'uploads';

    public const DIRECTORY = 'reviews';

    public const MAX_SIDE = 1600;

    public function store(UploadedFile $file, string $field = 'images'): string
    {
        $source = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));

        if ($source === false) {
            throw ValidationException::withMessages([$field => 'A photo could not be read. Please upload JPG, PNG or WEBP images.']);
        }

        $source = $this->upright($source, $file);

        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, self::MAX_SIDE / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));

        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefill($canvas, 0, 0, imagecolorallocatealpha($canvas, 0, 0, 0, 127));
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        ob_start();
        imagewebp($canvas, null, 82);
        $binary = (string) ob_get_clean();

        $path = self::DIRECTORY.'/'.now()->format('Ym').'/'.Str::lower(Str::random(24)).'.webp';
        Storage::disk(self::DISK)->put($path, $binary);

        return $path;
    }

    /**
     * @param  list<string>|null  $paths
     */
    public function deleteMany(?array $paths): void
    {
        foreach ($paths ?? [] as $path) {
            if (self::isOwnPath($path)) {
                Storage::disk(self::DISK)->delete($path);
            }
        }
    }

    public static function url(string $path): string
    {
        return Storage::disk(self::DISK)->url($path);
    }

    public static function isOwnPath(mixed $path): bool
    {
        return is_string($path)
            && preg_match('#^'.self::DIRECTORY.'/\d{6}/[a-z0-9]{24}\.webp$#', $path) === 1;
    }

    private function upright(\GdImage $image, UploadedFile $file): \GdImage
    {
        if (! function_exists('exif_read_data') || ! in_array($file->getMimeType(), ['image/jpeg', 'image/jpg'], true)) {
            return $image;
        }

        $orientation = (int) (@exif_read_data($file->getRealPath())['Orientation'] ?? 1);

        $rotated = match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };

        return $rotated === false ? $image : $rotated;
    }
}
