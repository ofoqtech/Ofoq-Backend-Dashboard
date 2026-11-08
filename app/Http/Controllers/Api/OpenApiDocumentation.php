<?php

namespace App\Http\Controllers\Api;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    description: 'Ofoq Technology CRM, WhatsApp Business Cloud API & Portfolio REST API Documentation. Use this interactive Swagger UI to inspect, execute, and test any API endpoint.',
    title: 'Ofoq Technology CRM & WhatsApp API'
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Local Development Server (Port 8000)'
)]
#[OA\Server(
    url: '/',
    description: 'Current Environment Server'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    name: 'Authorization',
    in: 'header',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter your Bearer Token to authorize API requests. Example: Bearer 1|your_token_here'
)]
#[OA\Tag(name: 'WhatsApp Cloud API', description: 'Meta WhatsApp Business Cloud API Direct Integration & Messaging')]
#[OA\Tag(name: 'CRM & Leads Pipeline', description: 'CRM Customer Relationship Management, Leads, and Follow-ups')]
#[OA\Tag(name: 'Public API & Services', description: 'Public Website Inquiry Forms, Services, and Budgets')]
#[OA\Tag(name: 'Portfolio Projects', description: 'Projects, Categories, and Showcase')]
#[OA\Tag(name: 'Notifications', description: 'In-app real-time alerts and activity history')]
class OpenApiDocumentation
{
    // ==========================================
    // 1. WhatsApp Cloud API & Webhooks
    // ==========================================

    #[OA\Get(
        path: '/webhooks/whatsapp',
        summary: 'Meta WhatsApp Webhook Handshake Verification (GET)',
        description: 'Endpoint invoked by Meta to verify webhook URL with hub.mode, hub.verify_token, and hub.challenge.',
        tags: ['WhatsApp Cloud API'],
        parameters: [
            new OA\Parameter(name: 'hub_mode', in: 'query', required: true, schema: new OA\Schema(type: 'string', default: 'subscribe')),
            new OA\Parameter(name: 'hub_verify_token', in: 'query', required: true, schema: new OA\Schema(type: 'string', default: 'ofoq_whatsapp_verify_token_2026')),
            new OA\Parameter(name: 'hub_challenge', in: 'query', required: true, schema: new OA\Schema(type: 'string', default: '123456789')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Webhook verified, returns challenge string'),
            new OA\Response(response: 403, description: 'Invalid verification token'),
        ]
    )]
    public function webhookVerify(): void {}

    #[OA\Post(
        path: '/webhooks/whatsapp',
        summary: 'Meta WhatsApp Incoming Webhook Events (POST)',
        description: 'Receives real-time incoming messages, media events, and status updates (sent, delivered, read, failed) from Meta.',
        tags: ['WhatsApp Cloud API'],
        parameters: [
            new OA\Parameter(name: 'X-Hub-Signature-256', in: 'header', required: false, description: 'HMAC-SHA256 signature calculated with Meta App Secret', schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                example: [
                    'object' => 'whatsapp_business_account',
                    'entry' => [
                        [
                            'id' => 'WABA_ACCOUNT_ID',
                            'changes' => [
                                [
                                    'value' => [
                                        'messaging_product' => 'whatsapp',
                                        'metadata' => [
                                            'display_phone_number' => '+20 100 000 0000',
                                            'phone_number_id' => '100000000000000',
                                        ],
                                        'contacts' => [
                                            ['profile' => ['name' => 'Ahmed Client'], 'wa_id' => '201012345678'],
                                        ],
                                        'messages' => [
                                            [
                                                'from' => '201012345678',
                                                'id' => 'wamid.HBgSAMPLE12345',
                                                'timestamp' => '1731067200',
                                                'text' => ['body' => 'Hello, I want to inquire about mobile app development.'],
                                                'type' => 'text',
                                            ],
                                        ],
                                    ],
                                    'field' => 'messages',
                                ],
                            ],
                        ],
                    ],
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Event queued and acknowledged', content: new OA\JsonContent(example: ['status' => 'received'])),
            new OA\Response(response: 403, description: 'Signature verification failed'),
        ]
    )]
    public function webhookHandle(): void {}

    #[OA\Post(
        path: '/crm/whatsapp/conversations',
        summary: 'Start a new WhatsApp Conversation',
        description: 'Initiates a direct WhatsApp conversation with a customer phone number or links to an existing Lead.',
        security: [['sanctum' => []]],
        tags: ['WhatsApp Cloud API'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['phone'],
                properties: [
                    new OA\Property(property: 'phone', type: 'string', example: '+20 101 234 5678'),
                    new OA\Property(property: 'name', type: 'string', example: 'Ahmed Customer'),
                    new OA\Property(property: 'lead_id', type: 'integer', nullable: true, example: 1),
                    new OA\Property(property: 'initial_message', type: 'string', example: 'Hello from Ofoq Technology!'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Conversation started successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function startConversation(): void {}

    #[OA\Get(
        path: '/crm/whatsapp/conversations/{conversation}/messages',
        summary: 'Get Messages for Conversation (Poll updates)',
        description: 'Retrieves message history and media attachments for an active WhatsApp conversation.',
        security: [['sanctum' => []]],
        tags: ['WhatsApp Cloud API'],
        parameters: [
            new OA\Parameter(name: 'conversation', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
            new OA\Parameter(name: 'after_id', in: 'query', required: false, description: 'Only fetch messages with ID greater than after_id', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Messages list and unread count'),
        ]
    )]
    public function getMessages(): void {}

    #[OA\Post(
        path: '/crm/whatsapp/conversations/{conversation}/messages',
        summary: 'Send Outgoing WhatsApp Text Message',
        description: 'Sends an official WhatsApp text message directly via Meta WhatsApp Cloud API.',
        security: [['sanctum' => []]],
        tags: ['WhatsApp Cloud API'],
        parameters: [
            new OA\Parameter(name: 'conversation', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['message'],
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Hello! Thanks for reaching out. How can we help?'),
                    new OA\Property(property: 'reply_to_message_id', type: 'string', nullable: true, example: 'wamid.HBg...'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Message sent successfully'),
            new OA\Response(response: 422, description: 'Validation or Meta API error'),
        ]
    )]
    public function sendMessage(): void {}

    #[OA\Post(
        path: '/crm/whatsapp/conversations/{conversation}/templates',
        summary: 'Send WhatsApp Approved Template',
        description: 'Sends an approved template message to initiate a conversation or follow up outside the 24h window.',
        security: [['sanctum' => []]],
        tags: ['WhatsApp Cloud API'],
        parameters: [
            new OA\Parameter(name: 'conversation', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['template_name', 'language'],
                properties: [
                    new OA\Property(property: 'template_name', type: 'string', example: 'lead_follow_up_ar'),
                    new OA\Property(property: 'language', type: 'string', example: 'ar'),
                    new OA\Property(property: 'parameters', type: 'array', items: new OA\Items(type: 'string'), example: ['أحمد']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Template dispatched to recipient'),
            new OA\Response(response: 422, description: 'Meta API template dispatch error'),
        ]
    )]
    public function sendTemplate(): void {}

    #[OA\Patch(
        path: '/crm/whatsapp/conversations/{conversation}/assign',
        summary: 'Assign WhatsApp Conversation to Employee',
        security: [['sanctum' => []]],
        tags: ['WhatsApp Cloud API'],
        parameters: [
            new OA\Parameter(name: 'conversation', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'assigned_to', type: 'integer', nullable: true, example: 2),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Assigned successfully'),
        ]
    )]
    public function assignConversation(): void {}

    #[OA\Patch(
        path: '/crm/whatsapp/conversations/{conversation}/status',
        summary: 'Update WhatsApp Conversation Status',
        security: [['sanctum' => []]],
        tags: ['WhatsApp Cloud API'],
        parameters: [
            new OA\Parameter(name: 'conversation', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['status'],
                properties: [
                    new OA\Property(property: 'status', type: 'string', enum: ['open', 'pending', 'closed', 'archived'], example: 'closed'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Status updated successfully'),
        ]
    )]
    public function updateConversationStatus(): void {}

    // ==========================================
    // 2. Public API & Inquiry Submission
    // ==========================================

    #[OA\Get(
        path: '/api/services',
        summary: 'Get Active Services & Budget Ranges',
        description: 'Returns available services, features, and budget tier options for client inquiry forms.',
        tags: ['Public API & Services'],
        responses: [
            new OA\Response(response: 200, description: 'Active services and budgets list'),
        ]
    )]
    public function services(): void {}

    #[OA\Post(
        path: '/api/service-form',
        summary: 'Submit Service Inquiry Form (Creates CRM Lead)',
        description: 'Public contact and quote request form. Creates a new Lead and logs attribution metadata.',
        tags: ['Public API & Services'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'phone'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Sherif Watany'),
                    new OA\Property(property: 'phone', type: 'string', example: '01012345678'),
                    new OA\Property(property: 'email', type: 'string', example: 'client@example.com'),
                    new OA\Property(property: 'company', type: 'string', example: 'Acme Corp'),
                    new OA\Property(property: 'service_id', type: 'integer', example: 1),
                    new OA\Property(property: 'service_budget_id', type: 'integer', example: 1),
                    new OA\Property(property: 'internal_notes', type: 'string', example: 'Need web and mobile app integration.'),
                    new OA\Property(property: 'utm_source', type: 'string', example: 'google'),
                    new OA\Property(property: 'utm_medium', type: 'string', example: 'cpc'),
                    new OA\Property(property: 'utm_campaign', type: 'string', example: 'web_dev_2026'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Inquiry received and Lead created'),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 429, description: 'Rate limit exceeded'),
        ]
    )]
    public function submitServiceForm(): void {}

    #[OA\Post(
        path: '/api/contact',
        summary: 'Submit Contact Message',
        description: 'Alias endpoint to submit inquiry / contact message.',
        tags: ['Public API & Services'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'phone'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Mohamed Ali'),
                    new OA\Property(property: 'phone', type: 'string', example: '01122334455'),
                    new OA\Property(property: 'email', type: 'string', example: 'mohamed@example.com'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Contact message received'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function submitContact(): void {}

    // ==========================================
    // 3. Portfolio & Categories
    // ==========================================

    #[OA\Get(
        path: '/api/categories',
        summary: 'Get Portfolio Project Categories',
        tags: ['Portfolio Projects'],
        responses: [
            new OA\Response(response: 200, description: 'Categories list'),
        ]
    )]
    public function categories(): void {}

    #[OA\Get(
        path: '/api/projects',
        summary: 'List Portfolio Projects',
        description: 'Returns published portfolio projects with images and category filters.',
        tags: ['Portfolio Projects'],
        parameters: [
            new OA\Parameter(name: 'category_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Projects list'),
        ]
    )]
    public function projects(): void {}

    #[OA\Get(
        path: '/api/projects/{project}',
        summary: 'Get Portfolio Project Details',
        tags: ['Portfolio Projects'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Project details and images'),
            new OA\Response(response: 404, description: 'Project not found'),
        ]
    )]
    public function projectDetail(): void {}

    // ==========================================
    // 4. CRM & Leads Pipeline
    // ==========================================

    #[OA\Get(
        path: '/crm/realtime-check',
        summary: 'Real-time CRM Alerts & New Leads Check',
        description: 'Endpoint used by dashboard and chime notification bell to check for newly created or assigned leads.',
        security: [['sanctum' => []]],
        tags: ['CRM & Leads Pipeline'],
        parameters: [
            new OA\Parameter(name: 'last_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'last_activity_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'New leads and notifications list'),
        ]
    )]
    public function realtimeCheck(): void {}

    #[OA\Patch(
        path: '/crm/{lead}/status',
        summary: 'Update CRM Lead Status',
        description: 'Moves lead to a new pipeline stage (new, contacted, qualified, proposal_sent, negotiation, won, lost).',
        security: [['sanctum' => []]],
        tags: ['CRM & Leads Pipeline'],
        parameters: [
            new OA\Parameter(name: 'lead', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['status'],
                properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'qualified'),
                    new OA\Property(property: 'lost_reason', type: 'string', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Lead status updated'),
        ]
    )]
    public function updateLeadStatus(): void {}

    #[OA\Patch(
        path: '/crm/{lead}/priority',
        summary: 'Update CRM Lead Priority',
        security: [['sanctum' => []]],
        tags: ['CRM & Leads Pipeline'],
        parameters: [
            new OA\Parameter(name: 'lead', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['priority'],
                properties: [
                    new OA\Property(property: 'priority', type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'urgent'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Lead priority updated'),
        ]
    )]
    public function updateLeadPriority(): void {}

    #[OA\Patch(
        path: '/crm/{lead}/assign',
        summary: 'Assign Lead to Employee',
        security: [['sanctum' => []]],
        tags: ['CRM & Leads Pipeline'],
        parameters: [
            new OA\Parameter(name: 'lead', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'assigned_to', type: 'integer', nullable: true, example: 2),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Lead assigned'),
        ]
    )]
    public function assignLead(): void {}

    #[OA\Post(
        path: '/crm/{lead}/notes',
        summary: 'Add Internal Activity Note to Lead',
        security: [['sanctum' => []]],
        tags: ['CRM & Leads Pipeline'],
        parameters: [
            new OA\Parameter(name: 'lead', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['content'],
                properties: [
                    new OA\Property(property: 'content', type: 'string', example: 'Client requested a proposal meeting next Tuesday.'),
                    new OA\Property(property: 'type', type: 'string', default: 'note'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Note added to lead activities'),
        ]
    )]
    public function addLeadNote(): void {}

    // ==========================================
    // 5. Notifications
    // ==========================================

    #[OA\Post(
        path: '/notifications/mark-as-read',
        summary: 'Mark In-App Notifications as Read',
        security: [['sanctum' => []]],
        tags: ['Notifications'],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'id', type: 'string', nullable: true, description: 'Specific notification UUID'),
                    new OA\Property(property: 'lead_id', type: 'integer', nullable: true, description: 'Mark all notifications for this lead'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Notifications marked as read'),
        ]
    )]
    public function markNotificationAsRead(): void {}

    #[OA\Get(
        path: '/api/user',
        summary: 'Get Authenticated User Profile',
        security: [['sanctum' => []]],
        tags: ['Public API & Services'],
        responses: [
            new OA\Response(response: 200, description: 'Current authenticated user profile'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function currentUser(): void {}
}

