<?php

use App\Models\User;
use Tests\TestCase;

function createTestUser(): User
{
    $user = new User;

    $user->forceFill([
        'id' => 1,
        'name' => 'Test User',
        'email' => 'test@example.com',
        'email_verified_at' => now(),
    ]);

    $user->exists = true;

    return $user;
}

test('appearance settings page can be rendered', function () {
    /** @var TestCase $this */
    $user = createTestUser();

    $this->actingAs($user)
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertSee('Appearance settings')
        ->assertSee('Light')
        ->assertSee('Dark');
});

test('default layout does not force dark mode on the html root', function () {
    /** @var TestCase $this */
    $user = createTestUser();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertSee('class="light"', false);
});
