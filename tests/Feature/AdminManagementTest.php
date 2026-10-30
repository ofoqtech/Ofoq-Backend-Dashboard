<?php

use App\Enums\Role;
use App\Models\User;

test('admin can view administrators list', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admins.index'));

    $response->assertOk();
});

test('employee cannot view administrators list', function () {
    $employee = User::factory()->employee()->create();

    $response = $this->actingAs($employee)->get(route('admins.index'));

    $response->assertForbidden();
});

test('admin can create a new administrator', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admins.store'), [
        'name' => 'New Co-Admin',
        'email' => 'coadmin@ofoq.tech',
        'password' => 'secretPassword123',
        'title' => 'Chief Technology Officer',
        'title_ar' => 'المدير التنفيذي للتقنية',
        'phone' => '+218910001122',
        'status' => 'active',
    ]);

    $response->assertRedirect(route('admins.index'));

    $newAdmin = User::where('email', 'coadmin@ofoq.tech')->first();
    expect($newAdmin)->not->toBeNull()
        ->and($newAdmin->role)->toBe(Role::Admin)
        ->and($newAdmin->title_en)->toBe('Chief Technology Officer')
        ->and($newAdmin->title_ar)->toBe('المدير التنفيذي للتقنية');
});

test('employee cannot create an administrator', function () {
    $employee = User::factory()->employee()->create();

    $response = $this->actingAs($employee)->post(route('admins.store'), [
        'name' => 'Fake Admin',
        'email' => 'fakeadmin@ofoq.tech',
        'password' => 'secretPassword123',
        'status' => 'active',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('users', ['email' => 'fakeadmin@ofoq.tech']);
});

test('admin can update an existing administrator', function () {
    $admin = User::factory()->admin()->create();
    $targetAdmin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->put(route('admins.update', $targetAdmin), [
        'name' => 'Updated Admin Name',
        'email' => $targetAdmin->email,
        'title' => 'Platform Director',
        'title_ar' => 'مدير المنصات',
        'status' => 'active',
    ]);

    $response->assertRedirect(route('admins.index'));
    expect($targetAdmin->fresh()->name)->toBe('Updated Admin Name')
        ->and($targetAdmin->fresh()->title_en)->toBe('Platform Director')
        ->and($targetAdmin->fresh()->title_ar)->toBe('مدير المنصات');
});

test('admin cannot delete their own account', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->admin()->create(); // Ensure another admin exists

    $response = $this->actingAs($admin)->delete(route('admins.destroy', $admin));

    $response->assertRedirect();
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('admin can delete another administrator when multiple exist', function () {
    $admin = User::factory()->admin()->create();
    $targetAdmin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->delete(route('admins.destroy', $targetAdmin));

    $response->assertRedirect(route('admins.index'));
    $this->assertDatabaseMissing('users', ['id' => $targetAdmin->id]);
});

test('public registration route is disabled', function () {
    $response = $this->get('/register');

    $response->assertNotFound();
});
