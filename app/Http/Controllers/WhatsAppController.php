<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppConversation;
use App\Models\WhatsAppMedia;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppQuickReply;
use App\Models\WhatsAppTemplate;
use App\Services\WhatsApp\WhatsAppCloudApiService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppController extends Controller
{
    /**
     * Display the WhatsApp CRM Inbox.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $statusFilter = $request->query('status', 'open');
        $assignedFilter = $request->query('assigned_to');
        $search = $request->query('search');
        $selectedId = $request->query('conversation_id');

        $convQuery = WhatsAppConversation::query()
            ->with(['contact.lead', 'lead.service', 'lead.serviceBudget', 'lead.assignee', 'assignee'])
            ->latest('last_message_at');

        if ($statusFilter && $statusFilter !== 'all') {
            $convQuery->where('status', $statusFilter);
        }

        if ($assignedFilter && $assignedFilter !== 'all') {
            if ($assignedFilter === 'unassigned') {
                $convQuery->whereNull('assigned_to');
            } elseif ($assignedFilter === 'me') {
                $convQuery->where('assigned_to', $user->id);
            } else {
                $convQuery->where('assigned_to', $assignedFilter);
            }
        }

        if ($search) {
            $convQuery->where(function ($q) use ($search) {
                $q->whereHas('contact', function ($cq) use ($search) {
                    $cq->where('profile_name', 'like', "%{$search}%")
                        ->orWhere('wa_id', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                })->orWhereHas('lead', function ($lq) use ($search) {
                    $lq->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%");
                })->orWhere('last_message_preview', 'like', "%{$search}%");
            });
        }

        $conversations = $convQuery->paginate(30)->withQueryString();

        // Selected conversation
        $selectedConversation = null;
        if ($selectedId) {
            $selectedConversation = WhatsAppConversation::with([
                'contact.lead.activities.user',
                'lead.service',
                'lead.serviceBudget',
                'lead.assignee',
                'assignee',
            ])->where('id', $selectedId)->first();
        }

        if (! $selectedConversation && $conversations->isNotEmpty()) {
            $first = $conversations->first();
            if ($first instanceof WhatsAppConversation) {
                $selectedConversation = WhatsAppConversation::with([
                    'contact.lead.activities.user',
                    'lead.service',
                    'lead.serviceBudget',
                    'lead.assignee',
                    'assignee',
                ])->where('id', $first->id)->first();
            }
        }

        // Messages for selected conversation
        $messages = [];
        if ($selectedConversation) {
            // Mark conversation as read by the viewing agent
            $selectedConversation->markAsRead();

            $messages = WhatsAppMessage::where('conversation_id', $selectedConversation->id)
                ->with(['media', 'sender'])
                ->oldest('id')
                ->take(100)
                ->get();
        }

        $employees = User::query()
            ->select('id', 'name', 'email', 'avatar', 'role')
            ->orderBy('name')
            ->get();

        $templates = WhatsAppTemplate::query()
            ->where('status', 'APPROVED')
            ->orderBy('name')
            ->get();

        $quickReplies = WhatsAppQuickReply::query()
            ->orderBy('title')
            ->get();

        $totalUnread = (int) WhatsAppConversation::sum('unread_count');

        $account = WhatsAppAccount::getDefault();
        $accountData = $account ? [
            'id' => $account->id,
            'name' => $account->name,
            'phone_number_id' => $account->phone_number_id,
            'display_phone_number' => $account->display_phone_number ?: config('whatsapp.display_phone_number'),
            'is_active' => $account->is_active,
        ] : [
            'id' => 0,
            'name' => 'Default WhatsApp Cloud Account',
            'phone_number_id' => config('whatsapp.phone_number_id'),
            'display_phone_number' => config('whatsapp.display_phone_number'),
            'is_active' => ! empty(config('whatsapp.phone_number_id')),
        ];

        return Inertia::render('crm/whatsapp/index', [
            'conversations' => $conversations,
            'selectedConversation' => $selectedConversation,
            'messages' => $messages,
            'employees' => $employees,
            'templates' => $templates,
            'quickReplies' => $quickReplies,
            'account' => $accountData,
            'totalUnread' => $totalUnread,
            'filters' => [
                'status' => $statusFilter,
                'assigned_to' => $assignedFilter,
                'search' => $search,
                'conversation_id' => $selectedConversation?->id,
            ],
        ]);
    }

    /**
     * Poll updates / get messages for active conversation.
     */
    public function messages(WhatsAppConversation $conversation, Request $request): JsonResponse
    {
        $conversation->markAsRead();

        $afterId = $request->query('after_id');

        $query = WhatsAppMessage::where('conversation_id', $conversation->id)
            ->with(['media', 'sender'])
            ->oldest('id');

        if ($afterId) {
            $query->where('id', '>', (int) $afterId);
        }

        $messages = $query->take(100)->get();

        return response()->json([
            'messages' => $messages,
            'conversation' => $conversation->fresh(['contact', 'lead', 'assignee']),
            'unread_count' => (int) WhatsAppConversation::sum('unread_count'),
        ]);
    }

    /**
     * Send outgoing text message via WhatsApp Cloud API.
     */
    public function sendMessage(WhatsAppConversation $conversation, Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:4096'],
            'reply_to_message_id' => ['nullable', 'string'],
        ]);

        $contact = $conversation->contact;
        $user = $request->user();

        try {
            $api = WhatsAppCloudApiService::forAccount($conversation->account);

            $metaResponse = [];
            if ($api->isConfigured()) {
                $metaResponse = $api->sendText(
                    to: $contact->wa_id,
                    text: $validated['message'],
                    replyToMessageId: $validated['reply_to_message_id'] ?? null
                );
            }

            $wamid = $metaResponse['messages'][0]['id'] ?? ('local_'.Str::uuid()->toString());

            $message = DB::transaction(function () use ($conversation, $contact, $user, $validated, $wamid) {
                /** @var WhatsAppMessage $msg */
                $msg = WhatsAppMessage::create([
                    'conversation_id' => $conversation->id,
                    'contact_id' => $contact->id,
                    'user_id' => $user->id,
                    'whatsapp_message_id' => $wamid,
                    'direction' => 'outgoing',
                    'type' => 'text',
                    'body' => $validated['message'],
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                $conversation->update([
                    'last_message_at' => now(),
                    'last_message_preview' => $validated['message'],
                    'last_message_direction' => 'outgoing',
                ]);

                // Also log activity in CRM Lead if connected
                if ($conversation->lead) {
                    $conversation->lead->logActivity('whatsapp', "Sent WhatsApp message: {$validated['message']}", $user->id);
                }

                return $msg;
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => $message->load(['media', 'sender']),
                ]);
            }

            return back()->with('success', 'Message sent successfully.');
        } catch (Exception $e) {
            Log::error('Failed to send WhatsApp message: '.$e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 422);
            }

            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * Send outgoing media message (image, video, audio, document).
     */
    public function sendMedia(WhatsAppConversation $conversation, Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:51200'], // max 50MB
            'caption' => ['nullable', 'string', 'max:1024'],
        ]);

        $contact = $conversation->contact;
        $user = $request->user();
        $file = $request->file('file');
        $caption = $validated['caption'] ?? null;

        try {
            $disk = (string) config('whatsapp.media_disk', 'public');
            $storageDir = (string) config('whatsapp.media_path', 'whatsapp_media');
            $extension = $file->getClientOriginalExtension() ?: 'bin';
            $fileName = Str::random(40).'.'.$extension;
            $originalName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType() ?: 'application/octet-stream';
            $fileSize = $file->getSize();

            // Store locally on public disk
            $storedPath = $file->storeAs($storageDir, $fileName, $disk);
            if (! is_string($storedPath)) {
                throw new Exception('Failed to store uploaded media file.');
            }

            $fullLocalPath = Storage::disk($disk)->path($storedPath);
            $publicUrl = Storage::disk($disk)->url($storedPath);

            $api = WhatsAppCloudApiService::forAccount($conversation->account);
            $metaResponse = [];
            $type = $this->determineMessageTypeFromMime($mimeType);

            if ($api->isConfigured()) {
                // If the app is publicly accessible or file can be uploaded via Meta Media API:
                try {
                    $uploadResult = $api->uploadMedia($fullLocalPath, $mimeType);
                    $mediaId = $uploadResult['id'];

                    $metaResponse = match ($type) {
                        'image' => $api->sendImage($contact->wa_id, $mediaId, $caption),
                        'document' => $api->sendDocument($contact->wa_id, $mediaId, $originalName, $caption),
                        'video' => $api->sendVideo($contact->wa_id, $mediaId, $caption),
                        'audio' => $api->sendAudio($contact->wa_id, $mediaId),
                        default => $api->sendDocument($contact->wa_id, $mediaId, $originalName, $caption),
                    };
                } catch (Exception $uploadErr) {
                    // Fallback to sending public URL link if media upload fails
                    Log::warning('Meta media upload failed, attempting link fallback: '.$uploadErr->getMessage());
                    $absoluteUrl = url($publicUrl);
                    $metaResponse = match ($type) {
                        'image' => $api->sendImage($contact->wa_id, $absoluteUrl, $caption),
                        'document' => $api->sendDocument($contact->wa_id, $absoluteUrl, $originalName, $caption),
                        'video' => $api->sendVideo($contact->wa_id, $absoluteUrl, $caption),
                        'audio' => $api->sendAudio($contact->wa_id, $absoluteUrl),
                        default => $api->sendDocument($contact->wa_id, $absoluteUrl, $originalName, $caption),
                    };
                }
            }

            $wamid = $metaResponse['messages'][0]['id'] ?? ('local_'.Str::uuid()->toString());

            $message = DB::transaction(function () use (
                $conversation,
                $contact,
                $user,
                $type,
                $caption,
                $originalName,
                $wamid,
                $storedPath,
                $mimeType,
                $fileSize,
                $disk
            ) {
                /** @var WhatsAppMessage $msg */
                $msg = WhatsAppMessage::create([
                    'conversation_id' => $conversation->id,
                    'contact_id' => $contact->id,
                    'user_id' => $user->id,
                    'whatsapp_message_id' => $wamid,
                    'direction' => 'outgoing',
                    'type' => $type,
                    'body' => $caption ?: "[{$type}: {$originalName}]",
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                WhatsAppMedia::create([
                    'message_id' => $msg->id,
                    'disk' => $disk,
                    'file_path' => $storedPath,
                    'file_name' => $originalName,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                    'caption' => $caption,
                ]);

                $conversation->update([
                    'last_message_at' => now(),
                    'last_message_preview' => $caption ?: "[{$type}: {$originalName}]",
                    'last_message_direction' => 'outgoing',
                ]);

                if ($conversation->lead) {
                    $conversation->lead->logActivity('whatsapp', "Sent WhatsApp {$type}: {$originalName}", $user->id);
                }

                return $msg;
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => $message->load(['media', 'sender']),
                ]);
            }

            return back()->with('success', 'File sent successfully.');
        } catch (Exception $e) {
            Log::error('Failed to send WhatsApp media: '.$e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 422);
            }

            return back()->withErrors(['file' => $e->getMessage()]);
        }
    }

    /**
     * Send approved WhatsApp Template message.
     */
    public function sendTemplate(WhatsAppConversation $conversation, Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'template_name' => ['required', 'string'],
            'language' => ['required', 'string', 'max:10'],
            'parameters' => ['nullable', 'array'],
        ]);

        $contact = $conversation->contact;
        $user = $request->user();

        try {
            $api = WhatsAppCloudApiService::forAccount($conversation->account);

            $components = [];
            if (! empty($validated['parameters'])) {
                $params = [];
                foreach ($validated['parameters'] as $val) {
                    $params[] = ['type' => 'text', 'text' => (string) $val];
                }
                $components[] = [
                    'type' => 'body',
                    'parameters' => $params,
                ];
            }

            $metaResponse = [];
            if ($api->isConfigured()) {
                $metaResponse = $api->sendTemplate(
                    to: $contact->wa_id,
                    templateName: $validated['template_name'],
                    languageCode: $validated['language'],
                    components: $components
                );
            }

            $wamid = $metaResponse['messages'][0]['id'] ?? ('local_'.Str::uuid()->toString());

            $templateText = "Template: {$validated['template_name']}";

            $message = DB::transaction(function () use ($conversation, $contact, $user, $validated, $wamid, $templateText) {
                /** @var WhatsAppMessage $msg */
                $msg = WhatsAppMessage::create([
                    'conversation_id' => $conversation->id,
                    'contact_id' => $contact->id,
                    'user_id' => $user->id,
                    'whatsapp_message_id' => $wamid,
                    'direction' => 'outgoing',
                    'type' => 'template',
                    'body' => $templateText,
                    'metadata' => [
                        'template_name' => $validated['template_name'],
                        'language' => $validated['language'],
                        'parameters' => $validated['parameters'] ?? [],
                    ],
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                $conversation->update([
                    'last_message_at' => now(),
                    'last_message_preview' => $templateText,
                    'last_message_direction' => 'outgoing',
                ]);

                if ($conversation->lead) {
                    $conversation->lead->logActivity('whatsapp', "Sent template '{$validated['template_name']}'", $user->id);
                }

                return $msg;
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => $message->load(['media', 'sender']),
                ]);
            }

            return back()->with('success', 'Template sent successfully.');
        } catch (Exception $e) {
            Log::error('Failed to send WhatsApp template: '.$e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 422);
            }

            return back()->withErrors(['template_name' => $e->getMessage()]);
        }
    }

    /**
     * Assign conversation to an employee.
     */
    public function assign(WhatsAppConversation $conversation, Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $conversation->update(['assigned_to' => $validated['assigned_to']]);

        // Keep CRM Lead in sync with the conversation assignment
        if ($conversation->lead && $conversation->lead->assigned_to !== $validated['assigned_to']) {
            $conversation->lead->update(['assigned_to' => $validated['assigned_to']]);
            $assignedUser = $validated['assigned_to'] ? User::where('id', $validated['assigned_to'])->first() : null;
            $assignedName = $assignedUser instanceof User ? $assignedUser->name : 'Unassigned';
            $conversation->lead->logActivity('assigned', "Assigned to {$assignedName} via WhatsApp chat.");
        }

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'conversation' => $conversation->fresh(['assignee', 'lead.assignee']),
            ]);
        }

        return back()->with('success', 'Conversation assigned successfully.');
    }

    /**
     * Update conversation status (open, closed, pending, archived).
     */
    public function updateStatus(WhatsAppConversation $conversation, Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:open,closed,pending,archived'],
        ]);

        $conversation->update(['status' => $validated['status']]);

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'conversation' => $conversation->fresh(),
            ]);
        }

        return back()->with('success', 'Conversation status updated.');
    }

    /**
     * Start a new WhatsApp conversation with a contact or lead.
     */
    public function startConversation(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'min:8', 'max:20'],
            'lead_id' => ['nullable', 'exists:leads,id'],
            'name' => ['nullable', 'string', 'max:100'],
            'initial_message' => ['nullable', 'string', 'max:4096'],
        ]);

        $waId = WhatsAppContact::normalizePhoneNumber($validated['phone']);
        $lead = ! empty($validated['lead_id']) ? Lead::where('id', $validated['lead_id'])->first() : null;

        // Auto-match lead if not provided
        if (! $lead) {
            $lead = Lead::where('phone', $validated['phone'])
                ->orWhere('phone', '+'.$waId)
                ->first();
        }

        $contact = WhatsAppContact::where('wa_id', $waId)->first();
        if (! $contact) {
            $contact = WhatsAppContact::create([
                'lead_id' => $lead?->id,
                'wa_id' => $waId,
                'profile_name' => $validated['name'] ?? ($lead ? $lead->name : ('+'.$waId)),
                'phone_number' => '+'.$waId,
            ]);
        } elseif ($lead && ! $contact->lead_id) {
            $contact->update(['lead_id' => $lead->id]);
        }

        $account = WhatsAppAccount::getDefault();
        $conversation = WhatsAppConversation::where('contact_id', $contact->id)->first();
        if (! $conversation) {
            $conversation = WhatsAppConversation::create([
                'account_id' => $account?->id,
                'contact_id' => $contact->id,
                'lead_id' => $lead?->id,
                'assigned_to' => $lead ? $lead->assigned_to : $request->user()->id,
                'status' => 'open',
                'unread_count' => 0,
            ]);
        }

        // Send initial message if provided
        if (! empty($validated['initial_message'])) {
            try {
                $api = WhatsAppCloudApiService::forAccount($account);
                $wamid = 'local_'.Str::uuid()->toString();

                if ($api->isConfigured()) {
                    $metaRes = $api->sendText($waId, $validated['initial_message']);
                    $wamid = $metaRes['messages'][0]['id'] ?? $wamid;
                }

                WhatsAppMessage::create([
                    'conversation_id' => $conversation->id,
                    'contact_id' => $contact->id,
                    'user_id' => $request->user()->id,
                    'whatsapp_message_id' => $wamid,
                    'direction' => 'outgoing',
                    'type' => 'text',
                    'body' => $validated['initial_message'],
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                $conversation->update([
                    'last_message_at' => now(),
                    'last_message_preview' => $validated['initial_message'],
                    'last_message_direction' => 'outgoing',
                ]);
            } catch (Exception $e) {
                Log::error('Error sending initial message: '.$e->getMessage());
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'conversation' => $conversation->load(['contact.lead', 'lead', 'assignee']),
            ]);
        }

        return redirect()->route('crm.whatsapp.index', ['conversation_id' => $conversation->id])
            ->with('success', 'Conversation started.');
    }

    /**
     * Add quick note to CRM Lead directly from WhatsApp inbox.
     */
    public function addLeadNote(WhatsAppConversation $conversation, Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        if (! $conversation->lead) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'No CRM Lead linked to this conversation.'], 422);
            }

            return back()->withErrors(['note' => 'No CRM Lead linked.']);
        }

        $lead = $conversation->lead;
        $note = $lead->logActivity('note', $validated['content'], $request->user()->id);

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'activity' => $note->load('user'),
            ]);
        }

        return back()->with('success', 'Note added to lead.');
    }

    /**
     * Update CRM Lead status directly from WhatsApp customer sidebar.
     */
    public function updateLeadStatus(WhatsAppConversation $conversation, Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        if (! $conversation->lead) {
            return back()->withErrors(['error' => 'No lead linked.']);
        }

        $lead = $conversation->lead;
        $oldStatus = $lead->status->value;
        $lead->update(['status' => $validated['status']]);
        $lead->logActivity('status_change', "Status changed from {$oldStatus} to {$validated['status']} via WhatsApp.");

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'lead' => $lead->fresh(['service', 'serviceBudget', 'assignee']),
            ]);
        }

        return back()->with('success', 'Lead status updated.');
    }

    protected function determineMessageTypeFromMime(string $mime): string
    {
        if (str_starts_with($mime, 'image/')) {
            return 'image';
        }
        if (str_starts_with($mime, 'video/')) {
            return 'video';
        }
        if (str_starts_with($mime, 'audio/')) {
            return 'audio';
        }

        return 'document';
    }
}
