<?php

use App\Models\Category;
use App\Models\Project;
use App\Models\User;

test('authenticated admin can view categories index', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('categories.index'));

    $response->assertOk();
});

test('authenticated employee can view categories index', function () {
    $employee = User::factory()->employee()->create();

    $response = $this->actingAs($employee)->get(route('categories.index'));

    $response->assertOk();
});

test('admin can create a new category with bilingual json name', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('categories.store'), [
        'name_en' => 'Fintech & Payments',
        'name_ar' => 'التقنية المالية والمدفوعات',
        'slug' => 'fintech',
        'description_en' => 'Payment solutions and fintech software.',
        'description_ar' => 'حلول الدفع والأنظمة المالية الرقمية.',
        'order' => 6,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('categories.index'));

    $category = Category::where('slug', 'fintech')->first();
    expect($category)->not->toBeNull()
        ->and($category->name_en)->toBe('Fintech & Payments')
        ->and($category->name_ar)->toBe('التقنية المالية والمدفوعات')
        ->and($category->description_en)->toBe('Payment solutions and fintech software.')
        ->and($category->description_ar)->toBe('حلول الدفع والأنظمة المالية الرقمية.')
        ->and($category->order)->toBe(6)
        ->and($category->is_active)->toBeTrue();
});

test('employee cannot create a category', function () {
    $employee = User::factory()->employee()->create();

    $response = $this->actingAs($employee)->post(route('categories.store'), [
        'name_en' => 'Forbidden Category',
        'name_ar' => 'تصنيف محظور',
        'slug' => 'forbidden',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('categories', ['slug' => 'forbidden']);
});

test('admin can update an existing category', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create([
        'slug' => 'original-slug',
    ]);

    $response = $this->actingAs($admin)->put(route('categories.update', $category), [
        'name_en' => 'Updated Category Title',
        'name_ar' => 'عنوان التصنيف المحدث',
        'slug' => 'updated-slug',
        'description_en' => 'Updated English description',
        'description_ar' => 'الوصف المحدث باللغة العربية',
        'order' => 2,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('categories.index'));

    $freshCategory = $category->fresh();
    expect($freshCategory->name_en)->toBe('Updated Category Title')
        ->and($freshCategory->name_ar)->toBe('عنوان التصنيف المحدث')
        ->and($freshCategory->slug)->toBe('updated-slug');
});

test('employee cannot update a category', function () {
    $employee = User::factory()->employee()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($employee)->put(route('categories.update', $category), [
        'name_en' => 'Hacked Name',
        'name_ar' => 'اسم مخترق',
        'slug' => $category->slug,
    ]);

    $response->assertForbidden();
});

test('admin cannot delete a category if projects are assigned to it', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['slug' => 'has-projects']);
    Project::factory()->create(['category' => 'has-projects']);

    $response = $this->actingAs($admin)->delete(route('categories.destroy', $category));

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

test('admin can delete a category if no projects are assigned to it', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['slug' => 'empty-category']);

    $response = $this->actingAs($admin)->delete(route('categories.destroy', $category));

    $response->assertRedirect(route('categories.index'));
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('public api returns active categories in json', function () {
    $response = $this->getJson(route('api.categories.index'));

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'count',
            'data' => [
                '*' => [
                    'id',
                    'slug',
                    'name',
                    'name_en',
                    'name_ar',
                    'description',
                    'order',
                    'is_active',
                ],
            ],
        ]);
});

