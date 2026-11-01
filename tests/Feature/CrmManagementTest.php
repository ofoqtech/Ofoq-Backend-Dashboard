<?php

use App\Enums\LeadPriority;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\Service;
use App\Models\ServiceBudget;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use Illuminate\Support\Facades\Notification;

test('api returns active services and budget options for contact form', function () {
    $service = Service::firstOrCreate(
        ['slug' => 'test-web'],
        [
            'name' => ['en' => 'Web Dev', 'ar' => 'تطوير ويب'],
            'order' => 1,
            'is_active' => true,
        ]
    );

    ServiceBudget::firstOrCreate(
        ['service_id' => $service->id, 'tier_key' => 'test-tier'],
        [
            'type' => ['en' => 'Starter', 'ar' => 'مبدئي'],
            'range' => '$500 - $1,000',
            'order' => 1,
        ]
    );

    $response = $this->getJson('/api/services');

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'slug',
                    'name',
                    'budget_options' => [
                        '*' => [
                            'id',
                            'tier' => ['type', 'range'],
                        ],
                    ],
                ],
            ],
        ]);
});

test('public client can submit get in touch service form and triggers lead creation', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();

    $service = Service::first();
    $budget = $service?->budgets()->first();

    $payload = [
        'name' => 'Dr. Hazem Sherif',
        'mobile' => '+201099887766',
        'service_id' => $budget ? $budget->id : ($service?->id ?? 1),
        'email' => 'hazem@hospital.eg',
        'company' => 'Sherif Medical Care',
        'message' => 'Need a patient records and clinic appointment platform.',
    ];

    $response = $this->postJson('/api/service-form', $payload);

    $response->assertCreated()
        ->assertJson([
            'success' => true,
        ]);

    $lead = Lead::where('phone', '+201099887766')->first();
    expect($lead)->not->toBeNull()
        ->and($lead->name)->toBe('Dr. Hazem Sherif')
        ->and($lead->status)->toBe(LeadStatus::New)
        ->and($lead->priority)->toBe(LeadPriority::High)
        ->and($lead->company)->toBe('Sherif Medical Care')
        ->and($lead->activities)->toHaveCount(1);

    Notification::assertSentTo(
        $admin,
        NewLeadNotification::class
    );
});

test('submitting service form validates required name mobile and service_id', function () {
    $response = $this->postJson('/api/service-form', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'mobile', 'service_id']);
});

test('authenticated staff can view crm index page', function () {
    $employee = User::factory()->employee()->create();

    $response = $this->actingAs($employee)->get(route('crm.index'));

    $response->assertOk();
});

test('staff can update lead pipeline status and updates contacted timestamp', function () {
    $employee = User::factory()->employee()->create();
    $lead = Lead::create([
        'name' => 'Omar Test',
        'phone' => '+201111222333',
        'status' => LeadStatus::New,
        'priority' => LeadPriority::Medium,
        'source' => 'test',
    ]);

    expect($lead->contacted_at)->toBeNull();

    $response = $this->actingAs($employee)->patch(route('crm.update-status', $lead), [
        'status' => 'contacted',
    ]);

    $response->assertRedirect();

    $lead->refresh();
    expect($lead->status)->toBe(LeadStatus::Contacted)
        ->and($lead->contacted_at)->not->toBeNull()
        ->and($lead->activities()->where('type', 'status_change')->exists())->toBeTrue();
});

test('staff can update lead priority', function () {
    $employee = User::factory()->employee()->create();
    $lead = Lead::create([
        'name' => 'Priority Test',
        'phone' => '+201111222334',
        'status' => LeadStatus::New,
        'priority' => LeadPriority::Low,
        'source' => 'test',
    ]);

    $response = $this->actingAs($employee)->patch(route('crm.update-priority', $lead), [
        'priority' => 'urgent',
    ]);

    $response->assertRedirect();

    $lead->refresh();
    expect($lead->priority)->toBe(LeadPriority::Urgent)
        ->and($lead->activities()->where('type', 'priority_change')->exists())->toBeTrue();
});

test('admin can assign lead to employee', function () {
    $admin = User::factory()->admin()->create();
    $employee = User::factory()->employee()->create();
    $lead = Lead::create([
        'name' => 'Assign Test',
        'phone' => '+201111222335',
        'status' => LeadStatus::New,
        'priority' => LeadPriority::Medium,
        'source' => 'test',
    ]);

    $response = $this->actingAs($admin)->patch(route('crm.assign', $lead), [
        'assigned_to' => $employee->id,
    ]);

    $response->assertRedirect();

    $lead->refresh();
    expect($lead->assigned_to)->toBe($employee->id)
        ->and($lead->activities()->where('type', 'assigned')->exists())->toBeTrue();
});

test('employee cannot assign leads to others', function () {
    $employee1 = User::factory()->employee()->create();
    $employee2 = User::factory()->employee()->create();
    $lead = Lead::create([
        'name' => 'Unauthorized Assign Test',
        'phone' => '+201111222336',
        'status' => LeadStatus::New,
        'priority' => LeadPriority::Medium,
        'source' => 'test',
    ]);

    $response = $this->actingAs($employee1)->patch(route('crm.assign', $lead), [
        'assigned_to' => $employee2->id,
    ]);

    $response->assertForbidden();
});

test('staff can add communication notes to timeline', function () {
    $employee = User::factory()->employee()->create();
    $lead = Lead::create([
        'name' => 'Note Test',
        'phone' => '+201111222337',
        'status' => LeadStatus::New,
        'priority' => LeadPriority::Medium,
        'source' => 'test',
    ]);

    $response = $this->actingAs($employee)->post(route('crm.add-note', $lead), [
        'type' => 'call',
        'content' => 'Discussed backend requirements via phone. Client agreed on 4-week delivery.',
    ]);

    $response->assertRedirect();

    $lead->refresh();
    $activity = $lead->activities()->where('type', 'call')->first();
    expect($activity)->not->toBeNull()
        ->and($activity->content)->toBe('Discussed backend requirements via phone. Client agreed on 4-week delivery.')
        ->and($activity->user_id)->toBe($employee->id);
});

test('admin can delete lead while employee cannot', function () {
    $admin = User::factory()->admin()->create();
    $employee = User::factory()->employee()->create();
    $lead = Lead::create([
        'name' => 'Delete Test',
        'phone' => '+201111222338',
        'status' => LeadStatus::New,
        'priority' => LeadPriority::Medium,
        'source' => 'test',
    ]);

    // Employee cannot delete
    $response = $this->actingAs($employee)->delete(route('crm.destroy', $lead));
    $response->assertForbidden();

    // Admin can delete
    $response = $this->actingAs($admin)->delete(route('crm.destroy', $lead));
    $response->assertRedirect(route('crm.index'));

    expect(Lead::find($lead->id))->toBeNull();
});
