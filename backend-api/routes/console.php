<?php

use App\Services\SettingsService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('settings:sync', function (SettingsService $settings) {
    $settings->syncDefaults();
    $this->info('Settings table synced with the registry (existing values untouched).');
})->purpose('Insert any missing settings keys with their default values');

Artisan::command('settings:clear-cache', function (SettingsService $settings) {
    $settings->flush();
    $this->info('Settings cache cleared.');
})->purpose('Flush the cached settings');

Schedule::command('sanctum:prune-expired --hours=24')->daily();
