<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'pages.general-users.home.page')->name('home');
Route::view('/offers', 'pages.general-users.offers.page')->name('offers');
Route::view('/cart', 'pages.general-users.cart.page')->name('cart');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('dashboard', 'pages.admin.dashboard.page')->name('dashboard');
});

require __DIR__ . '/settings.php';
