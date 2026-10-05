<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    /**
     * Public site configuration: branding, contact, currency, enabled payment
     * methods, Google client ID and SEO / pixel tags.
     */
    public function index(SettingsService $settings): JsonResponse
    {
        return response()->json(['data' => $settings->public()]);
    }
}
