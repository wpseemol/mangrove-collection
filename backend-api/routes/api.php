<?php

use App\Http\Controllers\Api\V1\Account\AddressController;
use App\Http\Controllers\Api\V1\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Api\V1\Account\ProfileController;
use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\GoogleAuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Storefront\CategoryController;
use App\Http\Controllers\Api\V1\Storefront\CategoryIconController;
use App\Http\Controllers\Api\V1\Storefront\CheckoutController;
use App\Http\Controllers\Api\V1\Storefront\ContentController;
use App\Http\Controllers\Api\V1\Storefront\PaymentController;
use App\Http\Controllers\Api\V1\Storefront\ProductController;
use App\Http\Controllers\Api\V1\Storefront\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mangrove Collection REST API — https://api.mangrove-collection.com/v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->name('v1.')->group(function () {

    // ---------------------------------------------------------------- Auth
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::middleware('throttle:auth')->group(function () {
            Route::post('register', [AuthController::class, 'register'])->name('register');
            Route::post('login', [AuthController::class, 'login'])->name('login');
            Route::post('dashboard/login', [AuthController::class, 'dashboardLogin'])->name('dashboard-login');
            Route::post('forgot-password', [PasswordResetController::class, 'forgot'])->name('forgot-password');
            Route::post('reset-password', [PasswordResetController::class, 'reset'])->name('reset-password');
            Route::get('google/redirect', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
            Route::post('google', [GoogleAuthController::class, 'login'])->name('google');
        });

        Route::get('session', [AuthController::class, 'session'])->name('session');

        Route::middleware(['auth:sanctum', 'active'])->group(function () {
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('logout-all', [AuthController::class, 'logoutAll'])->name('logout-all');
        });
    });

    // ---------------------------------------------------------- Storefront
    Route::get('settings', [SettingController::class, 'index'])->name('settings');

    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/{slug}', [CategoryController::class, 'show'])->name('categories.show');
    Route::get('category-icons', CategoryIconController::class)->name('category-icons');

    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::get('products/{slug}', [ProductController::class, 'show'])->name('products.show');
    Route::get('products/{slug}/related', [ProductController::class, 'related'])->name('products.related');

    Route::get('banners', [ContentController::class, 'banners'])->name('banners');
    Route::get('pages/{slug}', [ContentController::class, 'page'])->name('pages.show');
    Route::get('shipping-methods', [ContentController::class, 'shippingMethods'])->name('shipping-methods');

    Route::get('payment-methods', [PaymentController::class, 'methods'])->name('payment-methods');

    Route::post('checkout', [CheckoutController::class, 'store'])->middleware('throttle:checkout')->name('checkout');
    Route::get('orders/track', [CheckoutController::class, 'track'])->middleware('throttle:tracking')->name('orders.track');
    Route::post('orders/{orderNumber}/payment', [PaymentController::class, 'store'])->middleware('throttle:checkout')->name('orders.payment');

    // ------------------------------------------------------------- Account
    Route::middleware(['auth:sanctum', 'active', 'throttle:writes'])->prefix('account')->name('account.')->group(function () {
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('password', [ProfileController::class, 'updatePassword'])->middleware('throttle:auth')->name('password.update');
        Route::post('avatar', [ProfileController::class, 'uploadAvatar'])->middleware('throttle:uploads')->name('avatar.upload');

        Route::apiResource('addresses', AddressController::class);

        Route::get('orders', [AccountOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{orderNumber}', [AccountOrderController::class, 'show'])->name('orders.show');
        Route::post('orders/{orderNumber}/cancel', [AccountOrderController::class, 'cancel'])->name('orders.cancel');
    });

    // --------------------------------------------------------------- Admin
    Route::middleware(['auth:sanctum', 'active', 'role:admin,manager', 'throttle:writes'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', Admin\DashboardController::class)->name('dashboard');

        Route::apiResource('categories', Admin\CategoryController::class)->except(['store', 'update']);
        Route::middleware('throttle:uploads')->group(function () {
            Route::post('categories', [Admin\CategoryController::class, 'store'])->name('categories.store');
            Route::match(['put', 'patch'], 'categories/{category}', [Admin\CategoryController::class, 'update'])->name('categories.update');
            Route::post('media', [Admin\MediaController::class, 'store'])->name('media.store');
        });

        Route::post('products/{product}/restore', [Admin\ProductController::class, 'restore'])->name('products.restore');
        Route::apiResource('products', Admin\ProductController::class);

        Route::apiResource('orders', Admin\OrderController::class)->except('store');

        Route::get('payments', [Admin\PaymentController::class, 'index'])->name('payments.index');
        Route::post('payments/{payment}/verify', [Admin\PaymentController::class, 'verify'])->name('payments.verify');
        Route::post('payments/{payment}/reject', [Admin\PaymentController::class, 'reject'])->name('payments.reject');

        Route::apiResource('media', Admin\MediaController::class)->only(['index', 'destroy']);

        Route::apiResource('banners', Admin\BannerController::class);

        Route::get('pages', [Admin\PageController::class, 'index'])->name('pages.index');
        Route::get('pages/{slug}', [Admin\PageController::class, 'show'])->name('pages.show');
        Route::put('pages/{slug}', [Admin\PageController::class, 'upsert'])->name('pages.upsert');
        Route::delete('pages/{slug}', [Admin\PageController::class, 'destroy'])->name('pages.destroy');

        Route::apiResource('shipping-methods', Admin\ShippingMethodController::class);

        // Admin-only: user management, where payments are sent, and site configuration.
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', Admin\UserController::class);

            Route::apiResource('payment-accounts', Admin\PaymentAccountController::class);

            Route::get('settings', [Admin\SettingController::class, 'index'])->name('settings.index');
            Route::put('settings', [Admin\SettingController::class, 'update'])->name('settings.update');
            Route::post('settings/test-mail', [Admin\SettingController::class, 'testMail'])->name('settings.test-mail');
            Route::post('settings/test-sms', [Admin\SettingController::class, 'testSms'])->name('settings.test-sms');
        });
    });
});
