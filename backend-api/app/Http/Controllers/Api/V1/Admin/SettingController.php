<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Notifications\TestMail;
use App\Rules\PhoneNumber;
use App\Services\SettingsService;
use App\Services\SmsService;
use App\Settings\SettingRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class SettingController extends Controller
{
    public function __construct(protected SettingsService $settings) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->settings->forAdmin()]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $this->settings->update($request->settings());

        return response()->json([
            'message' => 'Settings saved.',
            'data' => $this->settings->forAdmin(),
        ]);
    }

    /**
     * Body: { "key": "google_client_secret", "password": "<the admin's own password>" }
     */
    public function reveal(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => ['required', Rule::in(SettingRegistry::secretKeys())],
            'password' => ['required', 'string', 'max:128'],
        ]);

        $admin = $request->user();

        if (! $admin->password) {
            throw ValidationException::withMessages(['password' => 'Set a password on your account first to view saved secrets.']);
        }

        if (! Hash::check($data['password'], $admin->password)) {
            throw ValidationException::withMessages(['password' => 'The password is incorrect.']);
        }

        return response()->json(['data' => ['key' => $data['key'], 'value' => $this->settings->reveal($data['key'])]]);
    }

    public function testMail(Request $request): JsonResponse
    {
        $request->validate(['to' => ['required', 'email', 'max:255']]);

        try {
            Notification::route('mail', $request->string('to'))->notifyNow(new TestMail);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Mail could not be sent: '.$e->getMessage()], 422);
        }

        return response()->json(['message' => 'Test email sent.']);
    }

    public function testSms(Request $request, SmsService $sms): JsonResponse
    {
        $request->validate(['phone' => ['required', 'string', 'max:32', new PhoneNumber]]);

        try {
            $sms->send($request->string('phone'), 'Mangrove Collection SMS gateway test.');
        } catch (Throwable $e) {
            return response()->json(['message' => 'SMS could not be sent: '.$e->getMessage()], 422);
        }

        return response()->json(['message' => 'Test SMS sent.']);
    }
}
