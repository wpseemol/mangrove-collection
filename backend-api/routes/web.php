<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'version' => 'v1',
    'health' => url('/api-health'),
]));

// Unlike /up, this also checks the database, so it fails when DB credentials or grants are wrong.
Route::get('/api-health', function () {
    try {
        DB::select('select 1');
        $database = 'ok';
    } catch (Throwable) {
        $database = 'unreachable';
    }

    return response()->json([
        'status' => $database === 'ok' ? 'ok' : 'error',
        'database' => $database,
        'php' => PHP_VERSION,
        'storage_link' => is_dir(public_path('storage')),
        'time' => now()->toIso8601String(),
    ], $database === 'ok' ? 200 : 503)->header('Cache-Control', 'no-store');
})->name('api-health');

// Apache serves these through the public/storage symlink; requests only reach Laravel when
// the symlink is missing or broken (shared hosts often block or break symlinks).
Route::get('/storage/{path}', function (string $path) {
    $disk = Storage::disk('public');
    abort_if(preg_match('#(^|/)\.#', $path) === 1 || ! $disk->fileExists($path), 404);

    return response()->file($disk->path($path), ['Cache-Control' => 'public, max-age=31536000, immutable']);
})->where('path', '.*')->name('storage.fallback');
