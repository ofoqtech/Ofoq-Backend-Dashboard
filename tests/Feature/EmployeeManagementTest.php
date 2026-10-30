<?php

use App\Enums\Role;
use App\Models\User;

test('authenticated admin can view employee index', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('employees.index'));

    $response->assertOk();
});

test('authenticated employee can view employee index', function () {
    $employee = User::factory()->employee()->create();

    $response = $this->actingAs($employee)->get(route('employees.index'));

    $response->assertOk();
});

test('admin can create a new employee', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('employees.store'), [
        'name' => 'New Colleague',
        'email' => 'colleague@ofoq.tech',
        'password' => 'password123',
        'title' => 'Backend Developer',
        'title_ar' => 'مطور خلفية أول',
        'phone' => '+201012345678',
        'status' => 'active',
    ]);

    $response->assertRedirect(route('employees.index'));
    $this->assertDatabaseHas('users', [
        'email' => 'colleague@ofoq.tech',
        'role' => Role::Employee->value,
    ]);
});

test('employee cannot create a new employee', function () {
    $employee = User::factory()->employee()->create();

    $response = $this->actingAs($employee)->post(route('employees.store'), [
        'name' => 'Forbidden Employee',
        'email' => 'forbidden@ofoq.tech',
        'password' => 'password123',
        'status' => 'active',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('users', ['email' => 'forbidden@ofoq.tech']);
});

test('admin can update an employee', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->employee()->create();

    $response = $this->actingAs($admin)->put(route('employees.update', $target), [
        'name' => 'Updated Name',
        'email' => $target->email,
        'title' => 'Lead Engineer',
        'title_ar' => 'مهندس رئيسي',
        'status' => 'active',
    ]);

    $response->assertRedirect(route('employees.index'));
    expect($target->fresh()->name)->toBe('Updated Name')
        ->and($target->fresh()->title_en)->toBe('Lead Engineer')
        ->and($target->fresh()->title_ar)->toBe('مهندس رئيسي');
});

test('employee cannot update another employee', function () {
    $employee = User::factory()->employee()->create();
    $target = User::factory()->employee()->create();

    $response = $this->actingAs($employee)->put(route('employees.update', $target), [
        'name' => 'Hacked Name',
        'email' => $target->email,
        'status' => 'active',
    ]);

    $response->assertForbidden();
});

test('employee cannot delete another employee or admin account', function () {
    $employee = User::factory()->employee()->create();
    $targetEmployee = User::factory()->employee()->create();
    $admin = User::factory()->admin()->create();

    $response1 = $this->actingAs($employee)->delete(route('employees.destroy', $targetEmployee));
    $response1->assertForbidden();

    $response2 = $this->actingAs($employee)->delete(route('employees.destroy', $admin));
    $response2->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $targetEmployee->id]);
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('admin can delete an employee account', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->employee()->create();

    $response = $this->actingAs($admin)->delete(route('employees.destroy', $target));

    $response->assertRedirect(route('employees.index'));
    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('admin cannot edit an admin account through employee edit route', function () {
    $admin = User::factory()->admin()->create();
    $targetAdmin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('employees.edit', $targetAdmin));

    $response->assertNotFound();
});

test('user cannot delete their own account via employee destroy', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->delete(route('employees.destroy', $admin));

    $response->assertForbidden();
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});
