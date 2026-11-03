<?php

use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\Service;
use App\Models\User;
use App\Notifications\NewLeadNotification;

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

test('submitting service form notifies admin via database and email even if admin is inactive in dashboard', function () {
    $admin = User::factory()->admin()->create([
        'email' => 'admin@ofoq.tech',
        'status' => 'active',
    ]);

    $service = Service::firstOrCreate(
        ['slug' => 'brand-identity'],
        ['name' => ['en' => 'Brand Identity', 'ar' => 'الهوية البصرية'], 'order' => 1, 'is_active' => true]
    );

    // Client submits project request from public website
    $payload = [
        'name' => 'Sara Al-Omari',
        'mobile' => '+966501234567',
        'email' => 'sara@example.com',
        'company' => 'Al-Omari Group',
        'service_id' => $service->id,
        'message' => 'Need complete branding redesign for our 2026 expansion.',
        'source' => 'website_form',
    ];

    $submitResponse = $this->postJson('/api/service-form', $payload);
    $submitResponse->assertCreated();

    // 1. Verify notification was saved in the database for the admin
    $admin->refresh();
    expect($admin->unreadNotifications()->count())->toBe(1);

    $notification = $admin->unreadNotifications()->first();
    expect($notification->type)->toBe(NewLeadNotification::class)
        ->and($notification->data['name'])->toBe('Sara Al-Omari')
        ->and($notification->data['phone'])->toBe('+966501234567')
        ->and($notification->data['company'])->toBe('Al-Omari Group')
        ->and($notification->data['message'])->toBe('Need complete branding redesign for our 2026 expansion.');

    // 2. When admin later returns to the dashboard, realtimeCheck reports unread_count
    $checkResponse = $this->actingAs($admin)->getJson(route('crm.realtime-check'));
    $checkResponse->assertOk()
        ->assertJson([
            'unread_count' => 1,
        ])
        ->assertJsonFragment([
            'name' => 'Sara Al-Omari',
            'is_unread' => true,
        ]);

    // 3. Admin marks notifications as read
    $markResponse = $this->actingAs($admin)->postJson(route('notifications.mark-as-read'), [
        'lead_id' => $notification->data['lead_id'],
    ]);
    $markResponse->assertOk()
        ->assertJson([
            'success' => true,
            'unread_count' => 0,
        ]);

    expect($admin->fresh()->unreadNotifications()->count())->toBe(0);
});

test('admin can mark all notifications as read', function () {
    $admin = User::factory()->admin()->create();

    $lead1 = Lead::create([
        'name' => 'Lead One',
        'phone' => '+201100000001',
        'status' => LeadStatus::New,
        'source' => 'website',
    ]);

    $lead2 = Lead::create([
        'name' => 'Lead Two',
        'phone' => '+201100000002',
        'status' => LeadStatus::New,
        'source' => 'website',
    ]);

    $admin->notify(new NewLeadNotification($lead1));
    $admin->notify(new NewLeadNotification($lead2));

    expect($admin->unreadNotifications()->count())->toBe(2);

    $response = $this->actingAs($admin)->postJson(route('notifications.mark-as-read'));
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'unread_count' => 0,
        ]);

    expect($admin->fresh()->unreadNotifications()->count())->toBe(0);
});
