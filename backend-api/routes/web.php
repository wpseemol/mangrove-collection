<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'version' => 'v1',
    'health' => url('/up'),
]));
