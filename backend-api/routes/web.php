<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

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
        'time' => now()->toIso8601String(),
    ], $database === 'ok' ? 200 : 503)->header('Cache-Control', 'no-store');
})->name('api-health');
