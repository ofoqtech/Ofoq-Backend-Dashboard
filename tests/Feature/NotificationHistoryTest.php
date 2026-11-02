<?php

use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\User;

test('authenticated user can view notification history page', function () {
    $admin = User::factory()->admin()->create();

    // Create sample leads
    Lead::create([
        'name' => 'First Older Lead',
        'phone' => '+201011111111',
        'status' => LeadStatus::New,
        'source' => 'meta',
        'utm_source' => 'meta',
    ]);

    Lead::create([
        'name' => 'Second Newer Lead',
        'phone' => '+201022222222',
        'status' => LeadStatus::New,
        'source' => 'tiktok',
        'utm_source' => 'tiktok',
    ]);

    $response = $this->actingAs($admin)->get(route('notifications.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications.data', 2)
            ->where('notifications.data.0.name', 'Second Newer Lead')
            ->has('stats.total_alerts')
            ->has('filters')
        );
});

test('unauthenticated user cannot view notification history', function () {
    $response = $this->get(route('notifications.index'));
    $response->assertRedirect('/login');
});

test('notification history can be filtered by channel', function () {
    $admin = User::factory()->admin()->create();

    Lead::create([
        'name' => 'TikTok User',
        'phone' => '+201033333333',
        'status' => LeadStatus::New,
        'source' => 'tiktok',
        'utm_source' => 'tiktok',
    ]);

    Lead::create([
        'name' => 'Snapchat User',
        'phone' => '+201044444444',
        'status' => LeadStatus::New,
        'source' => 'snapchat',
        'utm_source' => 'snapchat',
    ]);

    $response = $this->actingAs($admin)->get(route('notifications.index', ['channel' => 'tiktok']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.name', 'TikTok User')
        );
});
