<?php

use App\Enums\LeadPriority;
use App\Enums\LeadStatus;
use App\Jobs\ProcessWhatsAppWebhookJob;
use App\Models\Lead;
use App\Models\User;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppConversation;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppWebhookEvent;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    Config::set('whatsapp.webhook_verify_token', 'test_verify_token_123');
    Config::set('whatsapp.app_secret', 'test_secret_abc');
    Config::set('whatsapp.phone_number_id', '1234567890');
    Config::set('whatsapp.access_token', 'EAAB_test_token');
});

test('meta webhook verification handshake succeeds with valid verify token', function () {
    $response = $this->get('/webhooks/whatsapp?hub_mode=subscribe&hub_verify_token=test_verify_token_123&hub_challenge=11559933');

    $response->assertOk()
        ->assertSee('11559933');
});

test('meta webhook verification fails with invalid verify token', function () {
    $response = $this->get('/webhooks/whatsapp?hub_mode=subscribe&hub_verify_token=wrong_token&hub_challenge=11559933');

    $response->assertStatus(403);
});

test('meta webhook validates sha256 signature and queues processing job', function () {
    Queue::fake();

    $payload = [
        'object' => 'whatsapp_business_account',
        'entry' => [
            [
                'id' => 'WABA_123',
                'changes' => [
                    [
                        'value' => [
                            'messaging_product' => 'whatsapp',
                            'metadata' => [
                                'display_phone_number' => '+201012345678',
                                'phone_number_id' => '1234567890',
                            ],
                            'messages' => [
                                [
                                    'from' => '201099887766',
                                    'id' => 'wamid.HBgTEST123',
                                    'timestamp' => '1731067200',
                                    'text' => ['body' => 'Hello from client!'],
                                    'type' => 'text',
                                ],
                            ],
                        ],
                        'field' => 'messages',
                    ],
                ],
            ],
        ],
    ];

    $rawContent = json_encode($payload);
    $signature = 'sha256='.hash_hmac('sha256', $rawContent, 'test_secret_abc');

    $response = $this->call(
        'POST',
        '/webhooks/whatsapp',
        [],
        [],
        [],
        [
            'HTTP_X-Hub-Signature-256' => $signature,
            'CONTENT_TYPE' => 'application/json',
        ],
        $rawContent
    );

    $response->assertOk()
        ->assertJson(['status' => 'received']);

    $this->assertDatabaseHas('whatsapp_webhook_events', [
        'processed' => false,
    ]);

    Queue::assertPushed(ProcessWhatsAppWebhookJob::class);
});

test('meta webhook rejects request with invalid signature', function () {
    $rawContent = json_encode(['foo' => 'bar']);

    $response = $this->call(
        'POST',
        '/webhooks/whatsapp',
        [],
        [],
        [],
        [
            'HTTP_X-Hub-Signature-256' => 'sha256=invalid_hash',
            'CONTENT_TYPE' => 'application/json',
        ],
        $rawContent
    );

    $response->assertStatus(403);
});

test('process webhook job handles incoming message and auto-links existing crm lead', function () {
    // 1. Existing Lead in CRM
    $lead = Lead::create([
        'name' => 'Tarek Mansoor',
        'phone' => '+201012345678',
        'status' => LeadStatus::New,
        'priority' => LeadPriority::High,
        'source' => 'website',
    ]);

    $payload = [
        'object' => 'whatsapp_business_account',
        'entry' => [
            [
                'id' => 'WABA_123',
                'changes' => [
                    [
                        'value' => [
                            'messaging_product' => 'whatsapp',
                            'metadata' => [
                                'phone_number_id' => '1234567890',
                            ],
                            'contacts' => [
                                [
                                    'profile' => ['name' => 'Tarek Mansoor'],
                                    'wa_id' => '201012345678',
                                ],
                            ],
                            'messages' => [
                                [
                                    'from' => '201012345678',
                                    'id' => 'wamid.HBgINCOMING1',
                                    'timestamp' => '1731067200',
                                    'text' => ['body' => 'I would like to discuss my project requirements.'],
                                    'type' => 'text',
                                ],
                            ],
                        ],
                        'field' => 'messages',
                    ],
                ],
            ],
        ],
    ];

    $event = WhatsAppWebhookEvent::create([
        'event_id' => 'evt_1',
        'payload' => $payload,
        'processed' => false,
    ]);

    (new ProcessWhatsAppWebhookJob($event->id))->handle();

    // Verify contact was linked to the existing lead
    $contact = WhatsAppContact::where('wa_id', '201012345678')->first();
    expect($contact)->not->toBeNull();
    expect($contact->lead_id)->toBe($lead->id);

    // Verify conversation was created
    $conversation = WhatsAppConversation::where('contact_id', $contact->id)->first();
    expect($conversation)->not->toBeNull();
    expect($conversation->unread_count)->toBe(1);
    expect($conversation->last_message_preview)->toBe('I would like to discuss my project requirements.');

    // Verify message was stored
    $message = WhatsAppMessage::where('whatsapp_message_id', 'wamid.HBgINCOMING1')->first();
    expect($message)->not->toBeNull();
    expect($message->direction)->toBe('incoming');
    expect($message->body)->toBe('I would like to discuss my project requirements.');
    expect($message->status)->toBe('delivered');
});

test('process webhook job auto-creates new crm lead if contact does not exist', function () {
    $payload = [
        'object' => 'whatsapp_business_account',
        'entry' => [
            [
                'id' => 'WABA_123',
                'changes' => [
                    [
                        'value' => [
                            'messaging_product' => 'whatsapp',
                            'contacts' => [
                                [
                                    'profile' => ['name' => 'Dr. Mona Radwan'],
                                    'wa_id' => '201155443322',
                                ],
                            ],
                            'messages' => [
                                [
                                    'from' => '201155443322',
                                    'id' => 'wamid.HBgNEWLEAD1',
                                    'timestamp' => '1731067300',
                                    'text' => ['body' => 'Hi Ofoq, do you build mobile apps?'],
                                    'type' => 'text',
                                ],
                            ],
                        ],
                        'field' => 'messages',
                    ],
                ],
            ],
        ],
    ];

    $event = WhatsAppWebhookEvent::create([
        'event_id' => 'evt_2',
        'payload' => $payload,
        'processed' => false,
    ]);

    (new ProcessWhatsAppWebhookJob($event->id))->handle();

    // Verify new CRM Lead was created with channel whatsapp
    $createdLead = Lead::where('phone', '+201155443322')->first();
    expect($createdLead)->not->toBeNull();
    expect($createdLead->name)->toBe('Dr. Mona Radwan');
    expect($createdLead->channel)->toBe('whatsapp');
});

test('process webhook job handles message status updates', function () {
    $contact = WhatsAppContact::create([
        'wa_id' => '201000111222',
        'phone_number' => '+201000111222',
    ]);

    $conversation = WhatsAppConversation::create([
        'contact_id' => $contact->id,
        'status' => 'open',
    ]);

    $message = WhatsAppMessage::create([
        'conversation_id' => $conversation->id,
        'contact_id' => $contact->id,
        'whatsapp_message_id' => 'wamid.HBgSTATUS1',
        'direction' => 'outgoing',
        'type' => 'text',
        'body' => 'Test message',
        'status' => 'sent',
    ]);

    $payload = [
        'object' => 'whatsapp_business_account',
        'entry' => [
            [
                'id' => 'WABA_123',
                'changes' => [
                    [
                        'value' => [
                            'messaging_product' => 'whatsapp',
                            'statuses' => [
                                [
                                    'id' => 'wamid.HBgSTATUS1',
                                    'status' => 'read',
                                    'timestamp' => '1731067500',
                                    'recipient_id' => '201000111222',
                                ],
                            ],
                        ],
                        'field' => 'messages',
                    ],
                ],
            ],
        ],
    ];

    $event = WhatsAppWebhookEvent::create([
        'event_id' => 'evt_status',
        'payload' => $payload,
        'processed' => false,
    ]);

    (new ProcessWhatsAppWebhookJob($event->id))->handle();

    $message->refresh();
    expect($message->status)->toBe('read');
    expect($message->read_at)->not->toBeNull();
});

test('process webhook job prevents duplicate message processing via idempotency', function () {
    $contact = WhatsAppContact::create([
        'wa_id' => '201000999888',
        'phone_number' => '+201000999888',
    ]);

    $conversation = WhatsAppConversation::create([
        'contact_id' => $contact->id,
        'status' => 'open',
    ]);

    WhatsAppMessage::create([
        'conversation_id' => $conversation->id,
        'contact_id' => $contact->id,
        'whatsapp_message_id' => 'wamid.HBgDUPLICATE1',
        'direction' => 'incoming',
        'type' => 'text',
        'body' => 'First delivery',
        'status' => 'delivered',
    ]);

    $payload = [
        'object' => 'whatsapp_business_account',
        'entry' => [
            [
                'id' => 'WABA_123',
                'changes' => [
                    [
                        'value' => [
                            'messaging_product' => 'whatsapp',
                            'messages' => [
                                [
                                    'from' => '201000999888',
                                    'id' => 'wamid.HBgDUPLICATE1',
                                    'timestamp' => '1731067600',
                                    'text' => ['body' => 'First delivery'],
                                    'type' => 'text',
                                ],
                            ],
                        ],
                        'field' => 'messages',
                    ],
                ],
            ],
        ],
    ];

    $event = WhatsAppWebhookEvent::create([
        'event_id' => 'evt_dup',
        'payload' => $payload,
        'processed' => false,
    ]);

    (new ProcessWhatsAppWebhookJob($event->id))->handle();

    // Verify only 1 message exists with this ID
    expect(WhatsAppMessage::where('whatsapp_message_id', 'wamid.HBgDUPLICATE1')->count())->toBe(1);
});

test('authenticated employee can send outbound whatsapp message via cloud api', function () {
    Http::fake([
        'https://graph.facebook.com/v22.0/1234567890/messages' => Http::response([
            'messaging_product' => 'whatsapp',
            'contacts' => [['input' => '201011112222', 'wa_id' => '201011112222']],
            'messages' => [['id' => 'wamid.HBgOUTBOUND1']],
        ], 200),
    ]);

    $user = User::factory()->employee()->create();
    $contact = WhatsAppContact::create([
        'wa_id' => '201011112222',
        'phone_number' => '+201011112222',
    ]);
    $conversation = WhatsAppConversation::create([
        'contact_id' => $contact->id,
        'status' => 'open',
    ]);

    $response = $this->actingAs($user)
        ->postJson("/crm/whatsapp/conversations/{$conversation->id}/messages", [
            'message' => 'Hello! How can we assist you today?',
        ]);

    $response->assertOk()
        ->assertJson(['status' => 'success']);

    $this->assertDatabaseHas('whatsapp_messages', [
        'conversation_id' => $conversation->id,
        'direction' => 'outgoing',
        'body' => 'Hello! How can we assist you today?',
        'whatsapp_message_id' => 'wamid.HBgOUTBOUND1',
        'status' => 'sent',
    ]);

    $conversation->refresh();
    expect($conversation->last_message_preview)->toBe('Hello! How can we assist you today?');
    expect($conversation->last_message_direction)->toBe('outgoing');
});

test('phone normalization formats Egyptian and international numbers correctly', function () {
    expect(WhatsAppContact::normalizePhoneNumber('+20 101 234 5678'))->toBe('201012345678');
    expect(WhatsAppContact::normalizePhoneNumber('01012345678'))->toBe('201012345678');
    expect(WhatsAppContact::normalizePhoneNumber('00201012345678'))->toBe('201012345678');
    expect(WhatsAppContact::normalizePhoneNumber('+966 50 123 4567'))->toBe('966501234567');
});
