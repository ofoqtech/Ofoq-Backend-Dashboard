<?php

use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

test('authenticated user can view projects list', function () {
    $user = User::factory()->employee()->create();

    $response = $this->actingAs($user)->get(route('projects.index'));

    $response->assertOk();
});

test('user can create a project with frontend attributes as json', function () {
    $user = User::factory()->employee()->create();

    $projectData = [
        'title' => 'منصة تجارة إلكترونية ذكية',
        'title_en' => 'Smart E-Commerce Portal',
        'slug' => 'smart-ecommerce-portal',
        'category' => 'web',
        'category_label' => 'Web & Portals',
        'category_label_ar' => 'بوابات وتطبيقات الويب',
        'tagline' => 'High-performance storefront and dashboard.',
        'tagline_ar' => 'متجر تسوق إلكتروني عالي السرعة والأداء.',
        'description' => 'A full featured online shopping system.',
        'description_ar' => 'منصة تسوق متكاملة وعالية الأداء.',
        'problem' => 'Slow legacy website with high checkout drop-off.',
        'solution' => 'Built headless Next.js frontend with Laravel API.',
        'technologies' => ['React', 'Laravel', 'TailwindCSS'],
        'features' => ['Multi-currency', 'Real-time cart', 'Instant delivery tracking'],
        'metrics' => [
            ['label' => 'Checkout speed', 'val' => '1.2s'],
            ['label' => 'Conversion', 'val' => '+35%'],
        ],
        'client' => 'Al-Amal Retail Group',
        'live_url' => 'https://alamal.shop',
        'is_featured' => 1,
        'order' => 1,
    ];

    $response = $this->actingAs($user)->post(route('projects.store'), $projectData);

    $response->assertRedirect(route('projects.index'));

    $this->assertDatabaseHas('projects', [
        'slug' => 'smart-ecommerce-portal',
        'category' => 'web',
        'created_by' => $user->id,
    ]);

    $saved = Project::where('slug', 'smart-ecommerce-portal')->first();
    expect($saved->title['ar'])->toBe('منصة تجارة إلكترونية ذكية')
        ->and($saved->title['en'])->toBe('Smart E-Commerce Portal')
        ->and($saved->category_label['en'])->toBe('Web & Portals')
        ->and($saved->category_label['ar'])->toBe('بوابات وتطبيقات الويب')
        ->and($saved->technologies)->toBe(['React', 'Laravel', 'TailwindCSS'])
        ->and($saved->metrics['en'])->toHaveCount(2)
        ->and($saved->features['en'])->toHaveCount(3);
});

test('user can update an existing project with json bilingual fields', function () {
    $user = User::factory()->admin()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->put(route('projects.update', $project), [
        'title' => 'عنوان محدث للمشروع',
        'title_en' => 'Updated Project Title',
        'slug' => $project->slug,
        'category' => 'mobile',
        'category_label' => 'Mobile Systems',
        'technologies' => ['Flutter', 'Node.js'],
    ]);

    $response->assertRedirect(route('projects.index'));
    expect($project->fresh()->title_ar)->toBe('عنوان محدث للمشروع')
        ->and($project->fresh()->title_en)->toBe('Updated Project Title')
        ->and($project->fresh()->category)->toBe('mobile');
});

test('user can delete a project', function () {
    $user = User::factory()->employee()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->delete(route('projects.destroy', $project));

    $response->assertRedirect(route('projects.index'));
    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

test('public api projects endpoint returns json collection for ofoq-frontend', function () {
    Project::factory()->count(3)->create();

    $response = $this->getJson(route('api.projects.index'));

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'count',
            'data' => [
                '*' => ['id', 'slug', 'title', 'category', 'category_label'],
            ],
        ]);
});

test('database json columns store literal unescaped arabic text', function () {
    $project = Project::factory()->create([
        'title' => ['ar' => 'مشروع أفق للتكنولوجيا', 'en' => 'Ofoq Tech Project'],
    ]);

    $rawTitle = DB::table('projects')->where('id', $project->id)->value('title');
    expect($rawTitle)->toContain('مشروع أفق للتكنولوجيا')
        ->not->toContain('\u0645\u0634\u0631\u0648\u0639');
});

test('user can upload and manage multiple project images with display order', function () {
    Storage::fake('public');
    $user = User::factory()->admin()->create();

    $img1 = UploadedFile::fake()->image('screen1.jpg');
    $img2 = UploadedFile::fake()->image('screen2.jpg');

    $response = $this->actingAs($user)->post(route('projects.store'), [
        'title' => 'مشروع صور متعددة',
        'title_en' => 'Multi Image Project',
        'category' => 'web',
        'category_label' => 'Web',
        'gallery_files' => [$img1, $img2],
        'gallery_files_order' => [2, 1],
        'gallery_files_caption_ar' => ['شاشة ثانية', 'شاشة أولى'],
        'gallery_files_caption_en' => ['Second Screen', 'First Screen'],
    ]);

    $response->assertRedirect(route('projects.index'));

    $project = Project::where('slug', 'multi-image-project')->first();
    expect($project)->not->toBeNull()
        ->and($project->images)->toHaveCount(2);

    $ordered = $project->images()->orderBy('display_order')->get();
    expect($ordered[0]->display_order)->toBe(1)
        ->and($ordered[0]->caption_ar)->toBe('شاشة أولى')
        ->and($ordered[1]->display_order)->toBe(2)
        ->and($ordered[1]->caption_ar)->toBe('شاشة ثانية');
});

test('user can update display order and remove gallery image', function () {
    $user = User::factory()->employee()->create();
    $project = Project::factory()->create();
    $image1 = ProjectImage::factory()->create([
        'project_id' => $project->id,
        'display_order' => 1,
    ]);
    $image2 = ProjectImage::factory()->create([
        'project_id' => $project->id,
        'display_order' => 2,
    ]);

    $response = $this->actingAs($user)->put(route('projects.update', $project), [
        'title' => $project->title_ar,
        'slug' => $project->slug,
        'category' => $project->category,
        'existing_images' => [
            ['id' => $image1->id, 'display_order' => 5],
            ['id' => $image2->id, 'display_order' => 1],
        ],
    ]);

    $response->assertRedirect(route('projects.index'));
    expect($image1->fresh()->display_order)->toBe(5)
        ->and($image2->fresh()->display_order)->toBe(1);

    $deleteResp = $this->actingAs($user)->from(route('projects.edit', $project))->delete(route('projects.images.destroy', [$project, $image1]));
    $deleteResp->assertRedirect(route('projects.edit', $project));
    $this->assertDatabaseMissing('project_images', ['id' => $image1->id]);
    $this->assertDatabaseHas('project_images', ['id' => $image2->id]);
});
