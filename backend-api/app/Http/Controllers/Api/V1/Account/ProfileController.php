<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Rules\PhoneNumber;
use App\Rules\SafeText;
use App\Rules\SafeUrl;
use App\Support\UserSessions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function update(Request $request): UserResource
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', new SafeText],
            'email' => ['sometimes', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user)],
            'phone' => ['nullable', 'string', 'max:32', new PhoneNumber, Rule::unique('users')->ignore($user)],
            'avatar' => ['nullable', 'string', 'max:2048', new SafeUrl],
        ]);

        if (isset($data['email']) && $data['email'] !== $user->email) {
            $user->email_verified_at = null;
        }

        $user->fill($data)->save();

        return new UserResource($user);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => [$user->password ? 'required' : 'nullable', 'string', 'max:128'],
            'password' => ['required', 'string', 'max:128', 'confirmed', Password::min(8)],
        ]);

        if ($user->password && ! Hash::check($request->string('current_password'), $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'The current password is incorrect.']);
        }

        $user->forceFill(['password' => $request->string('password')])->save();

        // Sign out every other browser; this one stays signed in.
        UserSessions::revoke($user, $request->hasSession() ? $request->session()->getId() : null);

        return response()->json(['message' => 'Password updated.']);
    }

    public function uploadAvatar(Request $request): UserResource
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:min_width=64,min_height=64,max_width=4000,max_height=4000'],
        ]);

        $file = $request->file('avatar');
        $format = match ($file->getMimeType()) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'jpeg',
        };

        // Re-encoding drops EXIF (GPS location) and anything smuggled in after the image data.
        $image = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));

        if ($image === false) {
            throw ValidationException::withMessages(['avatar' => 'The avatar field must be an image.']);
        }

        imagesavealpha($image, true);
        ob_start();
        match ($format) {
            'png' => imagepng($image),
            'webp' => imagewebp($image, null, 90),
            default => imagejpeg($image, null, 90),
        };
        $binary = (string) ob_get_clean();

        $path = 'avatars/'.Str::random(40).'.'.($format === 'jpeg' ? 'jpg' : $format);
        Storage::disk('public')->put($path, $binary);

        $user = $request->user();
        $user->forceFill(['avatar' => Storage::disk('public')->url($path)])->save();

        return new UserResource($user);
    }
}
