<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Controller;
use App\Support\CategoryIcons;
use Illuminate\Http\JsonResponse;

class CategoryIconController extends Controller
{
    /** The icon library rarely changes, so browsers and proxies may cache it for a day. */
    public function __invoke(): JsonResponse
    {
        return response()
            ->json(['data' => CategoryIcons::all()])
            ->setPublic()
            ->setMaxAge(86400);
    }
}
