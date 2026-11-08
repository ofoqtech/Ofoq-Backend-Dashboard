<?php

namespace App\Jobs;

use App\Enums\LeadPriority;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\User;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppConversation;
use App\Models\WhatsAppMedia;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppWebhookEvent;
use App\Notifications\WhatsAppMessageNotification;
use App\Services\WhatsApp\WhatsAppCloudApiService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessWhatsAppWebhookJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(public int $webhookEventId) {}

    public function handle(): void
    {
        $event = WhatsAppWebhookEvent::find($this->webhookEventId);
        if (! $event || $event->processed) {
            return;
        }

        try {
            $payload = $event->payload;
            $this->processPayload($payload);

            $event->update([
                'processed' => true,
                'error' => null,
            ]);
        } catch (Exception $e) {
            Log::error('ProcessWhatsAppWebhookJob failed: '.$e->getMessage(), [
                'event_id' => $this->webhookEventId,
                'trace' => $e->getTraceAsString(),
            ]);

            $event->update([
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function processPayload(array $payload): void
    {
        $entries = $payload['entry'] ?? [];

        foreach ($entries as $entry) {
            $changes = $entry['changes'] ?? [];
            foreach ($changes as $change) {
                $value = $change['value'] ?? [];
                if (($value['messaging_product'] ?? '') !== 'whatsapp') {
                    continue;
                }

                $metadata = $value['metadata'] ?? [];
                $phoneNumberId = $metadata['phone_number_id'] ?? null;
                $account = $phoneNumberId ? WhatsAppAccount::where('phone_number_id', $phoneNumberId)->first() : null;
                $account ??= WhatsAppAccount::getDefault();

                // 1. Process Status Updates
                if (! empty($value['statuses'])) {
                    $this->processStatuses($value['statuses']);
                }

                // 2. Process Incoming Messages
                if (! empty($value['messages'])) {
                    $contactsData = $value['contacts'] ?? [];
                    $this->processMessages($value['messages'], $contactsData, $account);
                }
            }
        }
    }

    /**
     * @param  array<array<string, mixed>>  $statuses
     */
    protected function processStatuses(array $statuses): void
    {
        foreach ($statuses as $statusData) {
            $wamid = $statusData['id'] ?? null;
            $status = $statusData['status'] ?? null;
            if (! $wamid || ! $status) {
                continue;
            }

            $message = WhatsAppMessage::where('whatsapp_message_id', $wamid)->first();
            if (! $message) {
                continue;
            }

            $timestamp = isset($statusData['timestamp'])
                ? Carbon::createFromTimestamp((int) $statusData['timestamp'])
                : now();

            $updateData = ['status' => $status];

            if ($status === 'delivered' && ! $message->delivered_at) {
                $updateData['delivered_at'] = $timestamp;
            } elseif ($status === 'read' && ! $message->read_at) {
                $updateData['read_at'] = $timestamp;
                if (! $message->delivered_at) {
                    $updateData['delivered_at'] = $timestamp;
                }
            } elseif ($status === 'failed') {
                $errors = $statusData['errors'] ?? [];
                $firstError = $errors[0] ?? [];
                $updateData['error_code'] = (string) ($firstError['code'] ?? 'UNKNOWN');
                $updateData['error_message'] = $firstError['title'] ?? ($firstError['message'] ?? 'Message delivery failed');
            }

            $message->update($updateData);
        }
    }

    /**
     * @param  array<array<string, mixed>>  $messages
     * @param  array<array<string, mixed>>  $contactsData
     */
    protected function processMessages(array $messages, array $contactsData, ?WhatsAppAccount $account): void
    {
        // Build contact profile names lookup from payload
        $profileNames = [];
        foreach ($contactsData as $c) {
            $waId = $c['wa_id'] ?? null;
            $name = $c['profile']['name'] ?? null;
            if ($waId && $name) {
                $profileNames[$waId] = $name;
            }
        }

        foreach ($messages as $msgData) {
            $wamid = $msgData['id'] ?? null;
            if (! $wamid) {
                continue;
            }

            // Deduplication: Skip if message already processed
            if (WhatsAppMessage::where('whatsapp_message_id', $wamid)->exists()) {
                continue;
            }

            $from = $msgData['from'] ?? null;
            if (! $from) {
                continue;
            }

            $waId = WhatsAppContact::normalizePhoneNumber($from);
            $profileName = $profileNames[$from] ?? null;

            DB::transaction(function () use ($msgData, $wamid, $waId, $profileName, $account) {
                // 1. Find or create Contact
                $contact = WhatsAppContact::where('wa_id', $waId)->first();
                if (! $contact) {
                    $contact = WhatsAppContact::create([
                        'wa_id' => $waId,
                        'profile_name' => $profileName,
                        'phone_number' => '+'.$waId,
                    ]);
                } elseif ($profileName && empty($contact->profile_name)) {
                    $contact->update(['profile_name' => $profileName]);
                }

                // Check if incoming message has Meta Click-to-WhatsApp Ad referral
                $referral = $msgData['referral'] ?? null;
                $adHeadline = $referral['headline'] ?? null;
                $adSourceId = $referral['source_id'] ?? null;
                $campaignFromAd = $adHeadline ?: ($adSourceId ? 'Ad #'.$adSourceId : null);

                // 2. Link with CRM Lead (Avoid duplicate customer systems)
                if (! $contact->lead_id) {
                    $lead = $this->findMatchingLead($waId);

                    if (! $lead) {
                        // Auto-create CRM lead so this prospect appears in CRM pipeline
                        $lead = Lead::create([
                            'name' => $contact->profile_name ?: ('WhatsApp Contact (+'.$waId.')'),
                            'phone' => '+'.$waId,
                            'status' => LeadStatus::New,
                            'priority' => LeadPriority::Medium,
                            'source' => $referral ? 'meta_ad' : 'whatsapp_direct',
                            'utm_source' => $referral ? 'meta' : 'whatsapp',
                            'utm_campaign' => $campaignFromAd,
                        ]);

                        $lead->logActivity(
                            'whatsapp',
                            $campaignFromAd
                                ? "New conversation started via Meta Ad: {$campaignFromAd}."
                                : 'New conversation started via WhatsApp Direct.'
                        );
                    }

                    $contact->update(['lead_id' => $lead->id]);
                } else {
                    $lead = $contact->lead;
                    if ($campaignFromAd && $lead && empty($lead->utm_campaign)) {
                        $lead->update([
                            'utm_campaign' => $campaignFromAd,
                            'utm_source' => $lead->utm_source ?: 'meta',
                        ]);
                        $lead->logActivity('whatsapp', "Referral received from Meta Ad: {$campaignFromAd}.");
                    }
                }

                // 3. Find or create Conversation
                $conversation = WhatsAppConversation::where('contact_id', $contact->id)->first();
                if (! $conversation) {
                    $conversation = WhatsAppConversation::create([
                        'account_id' => $account?->id,
                        'contact_id' => $contact->id,
                        'lead_id' => $lead?->id,
                        'assigned_to' => $lead?->assigned_to,
                        'status' => 'open',
                        'unread_count' => 0,
                    ]);
                } elseif ($lead && ! $conversation->lead_id) {
                    $conversation->update(['lead_id' => $lead->id]);
                }

                // 4. Parse Message Payload
                $type = $msgData['type'] ?? 'text';
                $body = null;
                $metadata = [];
                $mediaPayload = null;

                switch ($type) {
                    case 'text':
                        $body = $msgData['text']['body'] ?? '';
                        break;
                    case 'image':
                        $mediaPayload = $msgData['image'] ?? [];
                        $body = $mediaPayload['caption'] ?? '[Image]';
                        break;
                    case 'video':
                        $mediaPayload = $msgData['video'] ?? [];
                        $body = $mediaPayload['caption'] ?? '[Video]';
                        break;
                    case 'audio':
                        $mediaPayload = $msgData['audio'] ?? [];
                        $body = '[Voice Note]';
                        break;
                    case 'document':
                        $mediaPayload = $msgData['document'] ?? [];
                        $body = $mediaPayload['caption'] ?? ($mediaPayload['filename'] ?? '[Document]');
                        break;
                    case 'location':
                        $loc = $msgData['location'] ?? [];
                        $body = $loc['name'] ?? ($loc['address'] ?? "Location: {$loc['latitude']}, {$loc['longitude']}");
                        $metadata['location'] = $loc;
                        break;
                    case 'interactive':
                        $interactive = $msgData['interactive'] ?? [];
                        $intType = $interactive['type'] ?? '';
                        if ($intType === 'button_reply') {
                            $body = $interactive['button_reply']['title'] ?? '';
                            $metadata['button_reply'] = $interactive['button_reply'];
                        } elseif ($intType === 'list_reply') {
                            $body = $interactive['list_reply']['title'] ?? '';
                            $metadata['list_reply'] = $interactive['list_reply'];
                        }
                        break;
                    case 'button':
                        $body = $msgData['button']['text'] ?? '[Button]';
                        break;
                    case 'reaction':
                        $body = $msgData['reaction']['emoji'] ?? '';
                        $metadata['reaction'] = $msgData['reaction'];
                        break;
                    default:
                        $body = "[Unsupported message: {$type}]";
                        break;
                }

                if (! empty($referral)) {
                    $metadata['referral'] = $referral;
                }

                $sentAt = isset($msgData['timestamp'])
                    ? Carbon::createFromTimestamp((int) $msgData['timestamp'])
                    : now();

                // 5. Store Incoming Message
                /** @var WhatsAppMessage $message */
                $message = WhatsAppMessage::create([
                    'conversation_id' => $conversation->id,
                    'contact_id' => $contact->id,
                    'whatsapp_message_id' => $wamid,
                    'direction' => 'incoming',
                    'type' => $type,
                    'body' => $body,
                    'status' => 'delivered',
                    'metadata' => ! empty($metadata) ? $metadata : null,
                    'sent_at' => $sentAt,
                    'delivered_at' => now(),
                ]);

                // 6. Handle Media Download if applicable
                if ($mediaPayload && ! empty($mediaPayload['id'])) {
                    $this->downloadAndAttachMedia($message, $mediaPayload, $account);
                }

                // 7. Update Conversation metadata
                $conversation->increment('unread_count');
                $conversation->update([
                    'last_message_at' => $sentAt,
                    'last_message_preview' => $body,
                    'last_message_direction' => 'incoming',
                    'status' => 'open',
                ]);

                // 8. Create In-App Notification for Assigned Agent or Admins
                $this->notifyAgents($conversation, $contact, $body);
            });
        }
    }

    /**
     * Download media binary from Meta and attach to message.
     *
     * @param  array<string, mixed>  $mediaPayload
     */
    protected function downloadAndAttachMedia(WhatsAppMessage $message, array $mediaPayload, ?WhatsAppAccount $account): void
    {
        try {
            $metaMediaId = $mediaPayload['id'];
            $mimeType = $mediaPayload['mime_type'] ?? 'application/octet-stream';
            $caption = $mediaPayload['caption'] ?? null;
            $filename = $mediaPayload['filename'] ?? null;

            $api = WhatsAppCloudApiService::forAccount($account);
            if ($api->isConfigured()) {
                $saved = $api->downloadMedia($metaMediaId, $filename);

                WhatsAppMedia::create([
                    'message_id' => $message->id,
                    'meta_media_id' => $metaMediaId,
                    'disk' => config('whatsapp.media_disk', 'public'),
                    'file_path' => $saved['file_path'],
                    'file_name' => $saved['file_name'],
                    'mime_type' => $saved['mime_type'] ?: $mimeType,
                    'file_size' => $saved['file_size'],
                    'sha256' => $saved['sha256'],
                    'caption' => $caption,
                ]);
            }
        } catch (Exception $e) {
            Log::warning('Failed downloading WhatsApp media attachment: '.$e->getMessage(), [
                'message_id' => $message->id,
            ]);
        }
    }

    /**
     * Match incoming normalized phone number with an existing Lead.
     */
    protected function findMatchingLead(string $normalizedPhone): ?Lead
    {
        // 1. Direct phone equality
        $lead = Lead::where('phone', $normalizedPhone)
            ->orWhere('phone', '+'.$normalizedPhone)
            ->first();

        if ($lead) {
            return $lead;
        }

        // 2. Normalize Egyptian numbers (e.g. 201012345678 <-> 01012345678)
        if (str_starts_with($normalizedPhone, '20')) {
            $localEgyptian = '0'.substr($normalizedPhone, 2);
            $lead = Lead::where('phone', $localEgyptian)
                ->orWhere('phone', 'like', "%{$localEgyptian}%")
                ->first();

            if ($lead) {
                return $lead;
            }
        }

        // 3. Fallback suffix search for last 9 digits
        if (strlen($normalizedPhone) >= 9) {
            $suffix = substr($normalizedPhone, -9);

            return Lead::where('phone', 'like', "%{$suffix}")->first();
        }

        return null;
    }

    /**
     * Trigger in-app notification for the assigned agent or admins.
     */
    protected function notifyAgents(WhatsAppConversation $conversation, WhatsAppContact $contact, ?string $body): void
    {
        try {
            $assignedUser = $conversation->assigned_to ? User::find($conversation->assigned_to) : null;
            $senderName = $contact->profile_name ?: ('+'.$contact->wa_id);
            $preview = $body ? substr($body, 0, 80) : 'Sent an attachment';

            if ($assignedUser) {
                $assignedUser->notify(new WhatsAppMessageNotification($conversation, $contact, $preview));
            }
        } catch (Exception $e) {
            // Notification table optional or logging safe
            Log::info('WhatsApp notification creation skipped: '.$e->getMessage());
        }
    }
}
