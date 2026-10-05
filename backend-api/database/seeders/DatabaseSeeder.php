<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Page;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Idempotent: safe to run on every deploy.
     */
    public function run(SettingsService $settings): void
    {
        $settings->syncDefaults();

        $this->seedShippingMethods();
        $this->seedPages();
        $this->seedAdmin();
    }

    protected function seedShippingMethods(): void
    {
        $methods = [
            ['code' => 'inside-dhaka', 'title' => 'Inside Dhaka', 'description' => '2-3 business days', 'price' => 160, 'sort_order' => 1],
            ['code' => 'outside-dhaka', 'title' => 'Outside Dhaka', 'description' => '3-5 business days', 'price' => 160, 'sort_order' => 2],
        ];

        foreach ($methods as $method) {
            ShippingMethod::query()->firstOrCreate(['code' => $method['code']], $method);
        }
    }

    protected function seedPages(): void
    {
        foreach (['home' => 'Home', 'about' => 'About Us', 'contact' => 'Contact Us'] as $slug => $title) {
            Page::query()->firstOrCreate(['slug' => $slug], ['title' => $title, 'sections' => []]);
        }
    }

    /**
     * Bootstrap admin. Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD on
     * first seed only; a random password is generated and printed otherwise.
     */
    protected function seedAdmin(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@mangrove-collection.com');

        if (User::query()->where('email', $email)->exists()) {
            return;
        }

        $password = env('ADMIN_PASSWORD') ?: Str::password(16, symbols: false);

        User::query()->create([
            'name' => 'Administrator',
            'email' => $email,
            'password' => $password,
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $this->command?->warn("Admin created: {$email} / {$password} — change this password after first login.");
    }
}
