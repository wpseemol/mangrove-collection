<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Notifications\TestMail;
use App\Services\SettingsService;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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

    public function testMail(Request $request): JsonResponse
    {
        $request->validate(['to' => ['required', 'email']]);

        try {
            Notification::route('mail', $request->string('to'))->notifyNow(new TestMail);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Mail could not be sent: '.$e->getMessage()], 422);
        }

        return response()->json(['message' => 'Test email sent.']);
    }

    public function testSms(Request $request, SmsService $sms): JsonResponse
    {
        $request->validate(['phone' => ['required', 'string', 'max:32']]);

        try {
            $sms->send($request->string('phone'), 'Mangrove Collection SMS gateway test.');
        } catch (Throwable $e) {
            return response()->json(['message' => 'SMS could not be sent: '.$e->getMessage()], 422);
        }

        return response()->json(['message' => 'Test SMS sent.']);
    }
}
