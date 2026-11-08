<?php

namespace App\Services\WhatsApp;

use App\Models\WhatsAppAccount;
use App\Models\WhatsAppContact;
use Exception;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WhatsAppCloudApiService
{
    protected string $phoneNumberId;

    protected string $accessToken;

    protected string $graphVersion;

    protected string $apiUrl;

    protected int $timeout;

    protected int $maxRetries;

    protected ?WhatsAppAccount $account = null;

    public function __construct(?WhatsAppAccount $account = null)
    {
        $this->account = $account ?? WhatsAppAccount::getDefault();

        $this->phoneNumberId = (string) ($this->account?->phone_number_id ?: config('whatsapp.phone_number_id'));
        $this->accessToken = (string) ($this->account?->access_token ?: config('whatsapp.access_token'));
        $this->graphVersion = (string) ($this->account?->graph_version ?: config('whatsapp.graph_version', 'v22.0'));
        $this->apiUrl = (string) config('whatsapp.api_url', 'https://graph.facebook.com');
        $this->timeout = (int) config('whatsapp.timeout', 30);
        $this->maxRetries = (int) config('whatsapp.max_retries', 3);
    }

    public static function forAccount(?WhatsAppAccount $account = null): self
    {
        return new self($account);
    }

    public function isConfigured(): bool
    {
        return ! empty($this->phoneNumberId) && ! empty($this->accessToken);
    }

    public function getPhoneNumberId(): string
    {
        return $this->phoneNumberId;
    }

    public function getAccount(): ?WhatsAppAccount
    {
        return $this->account;
    }

    /**
     * Create authenticated HTTP client with retry and timeout configuration.
     */
    protected function client(): PendingRequest
    {
        return Http::baseUrl("{$this->apiUrl}/{$this->graphVersion}")
            ->withToken($this->accessToken)
            ->timeout($this->timeout)
            ->retry($this->maxRetries, 1000, function ($exception, $request) {
                // Retry on server errors or 429 rate limit
                if ($exception instanceof RequestException) {
                    return $exception->response->status() === 429 || $exception->response->status() >= 500;
                }

                return false;
            });
    }

    /**
     * Send raw payload to Meta Cloud API endpoint.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function postMessages(array $payload): array
    {
        if (! $this->isConfigured()) {
            throw new Exception('WhatsApp Cloud API is not configured. Missing Phone Number ID or Access Token.');
        }

        /** @var Response $response */
        $response = $this->client()->post("/{$this->phoneNumberId}/messages", array_merge([
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
        ], $payload));

        if (! $response->successful()) {
            $error = $response->json('error', []);
            $message = $error['message'] ?? $response->body();
            $code = $error['code'] ?? $response->status();

            Log::error('WhatsApp Cloud API Error: '.$message, [
                'status' => $response->status(),
                'error' => $error,
                'payload_type' => $payload['type'] ?? 'unknown',
            ]);

            throw new Exception("Meta API error [{$code}]: {$message}");
        }

        return $response->json();
    }

    /**
     * Send text message.
     *
     * @return array<string, mixed>
     */
    public function sendText(string $to, string $text, ?string $replyToMessageId = null): array
    {
        $payload = [
            'to' => $this->normalizeTo($to),
            'type' => 'text',
            'text' => [
                'preview_url' => false,
                'body' => $text,
            ],
        ];

        if ($replyToMessageId) {
            $payload['context'] = ['message_id' => $replyToMessageId];
        }

        return $this->postMessages($payload);
    }

    /**
     * Send image message.
     *
     * @return array<string, mixed>
     */
    public function sendImage(string $to, string $mediaIdOrUrl, ?string $caption = null, ?string $replyToMessageId = null): array
    {
        $imageKey = filter_var($mediaIdOrUrl, FILTER_VALIDATE_URL) ? 'link' : 'id';
        $imageData = [$imageKey => $mediaIdOrUrl];

        if ($caption !== null && trim($caption) !== '') {
            $imageData['caption'] = $caption;
        }

        $payload = [
            'to' => $this->normalizeTo($to),
            'type' => 'image',
            'image' => $imageData,
        ];

        if ($replyToMessageId) {
            $payload['context'] = ['message_id' => $replyToMessageId];
        }

        return $this->postMessages($payload);
    }

    /**
     * Send document message (PDF, Word, etc.).
     *
     * @return array<string, mixed>
     */
    public function sendDocument(string $to, string $mediaIdOrUrl, ?string $filename = null, ?string $caption = null, ?string $replyToMessageId = null): array
    {
        $docKey = filter_var($mediaIdOrUrl, FILTER_VALIDATE_URL) ? 'link' : 'id';
        $docData = [$docKey => $mediaIdOrUrl];

        if ($filename !== null && trim($filename) !== '') {
            $docData['filename'] = $filename;
        }
        if ($caption !== null && trim($caption) !== '') {
            $docData['caption'] = $caption;
        }

        $payload = [
            'to' => $this->normalizeTo($to),
            'type' => 'document',
            'document' => $docData,
        ];

        if ($replyToMessageId) {
            $payload['context'] = ['message_id' => $replyToMessageId];
        }

        return $this->postMessages($payload);
    }

    /**
     * Send video message.
     *
     * @return array<string, mixed>
     */
    public function sendVideo(string $to, string $mediaIdOrUrl, ?string $caption = null, ?string $replyToMessageId = null): array
    {
        $videoKey = filter_var($mediaIdOrUrl, FILTER_VALIDATE_URL) ? 'link' : 'id';
        $videoData = [$videoKey => $mediaIdOrUrl];

        if ($caption !== null && trim($caption) !== '') {
            $videoData['caption'] = $caption;
        }

        $payload = [
            'to' => $this->normalizeTo($to),
            'type' => 'video',
            'video' => $videoData,
        ];

        if ($replyToMessageId) {
            $payload['context'] = ['message_id' => $replyToMessageId];
        }

        return $this->postMessages($payload);
    }

    /**
     * Send audio / voice note message.
     *
     * @return array<string, mixed>
     */
    public function sendAudio(string $to, string $mediaIdOrUrl, ?string $replyToMessageId = null): array
    {
        $audioKey = filter_var($mediaIdOrUrl, FILTER_VALIDATE_URL) ? 'link' : 'id';

        $payload = [
            'to' => $this->normalizeTo($to),
            'type' => 'audio',
            'audio' => [
                $audioKey => $mediaIdOrUrl,
            ],
        ];

        if ($replyToMessageId) {
            $payload['context'] = ['message_id' => $replyToMessageId];
        }

        return $this->postMessages($payload);
    }

    /**
     * Send location message.
     *
     * @return array<string, mixed>
     */
    public function sendLocation(string $to, float $latitude, float $longitude, ?string $name = null, ?string $address = null): array
    {
        return $this->postMessages([
            'to' => $this->normalizeTo($to),
            'type' => 'location',
            'location' => array_filter([
                'latitude' => $latitude,
                'longitude' => $longitude,
                'name' => $name,
                'address' => $address,
            ], fn ($v) => $v !== null),
        ]);
    }

    /**
     * Send approved template message.
     *
     * @param  array<array<string, mixed>>  $components
     * @return array<string, mixed>
     */
    public function sendTemplate(string $to, string $templateName, string $languageCode = 'ar', array $components = []): array
    {
        $payload = [
            'to' => $this->normalizeTo($to),
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => $languageCode],
            ],
        ];

        if (! empty($components)) {
            $payload['template']['components'] = $components;
        }

        return $this->postMessages($payload);
    }

    /**
     * Send interactive button message (up to 3 quick action buttons).
     *
     * @param  array<array{id: string, title: string}>  $buttons
     * @return array<string, mixed>
     */
    public function sendInteractiveButtons(string $to, string $bodyText, array $buttons, ?string $header = null, ?string $footer = null): array
    {
        $formattedButtons = [];
        foreach ($buttons as $btn) {
            $formattedButtons[] = [
                'type' => 'reply',
                'reply' => [
                    'id' => $btn['id'],
                    'title' => Str::limit($btn['title'], 20, ''),
                ],
            ];
        }

        $interactive = [
            'type' => 'button',
            'body' => ['text' => $bodyText],
            'action' => ['buttons' => $formattedButtons],
        ];

        if ($header) {
            $interactive['header'] = ['type' => 'text', 'text' => $header];
        }
        if ($footer) {
            $interactive['footer'] = ['text' => $footer];
        }

        return $this->postMessages([
            'to' => $this->normalizeTo($to),
            'type' => 'interactive',
            'interactive' => $interactive,
        ]);
    }

    /**
     * Mark incoming message as read on Meta servers.
     *
     * @return array<string, mixed>
     */
    public function markAsRead(string $messageId): array
    {
        if (! $this->isConfigured()) {
            return [];
        }

        try {
            $response = $this->client()->post("/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'status' => 'read',
                'message_id' => $messageId,
            ]);

            return $response->json() ?? [];
        } catch (Exception $e) {
            Log::warning('WhatsApp markAsRead failed: '.$e->getMessage(), ['message_id' => $messageId]);

            return [];
        }
    }

    /**
     * Upload local media file directly to Meta WhatsApp Cloud API.
     *
     * @return array{id: string}
     */
    public function uploadMedia(string $absoluteFilePath, string $mimeType): array
    {
        if (! $this->isConfigured()) {
            throw new Exception('WhatsApp Cloud API is not configured.');
        }

        if (! file_exists($absoluteFilePath)) {
            throw new Exception("Media file not found at path: {$absoluteFilePath}");
        }

        $filename = basename($absoluteFilePath);

        /** @var Response $response */
        $response = $this->client()
            ->attach('file', file_get_contents($absoluteFilePath), $filename, ['Content-Type' => $mimeType])
            ->post("/{$this->phoneNumberId}/media", [
                'messaging_product' => 'whatsapp',
                'type' => $mimeType,
            ]);

        if (! $response->successful()) {
            throw new Exception('Meta Media Upload failed: '.$response->body());
        }

        return $response->json();
    }

    /**
     * Download media binary from Meta WhatsApp Cloud API and save locally.
     *
     * @return array{file_path: string, file_name: string, mime_type: string, file_size: int, sha256: string}
     */
    public function downloadMedia(string $metaMediaId, ?string $customFileName = null): array
    {
        if (! $this->isConfigured()) {
            throw new Exception('WhatsApp Cloud API is not configured.');
        }

        // 1. Get media metadata from Graph API
        /** @var Response $metaResponse */
        $metaResponse = $this->client()->get("/{$metaMediaId}");

        if (! $metaResponse->successful()) {
            throw new Exception("Failed to fetch media metadata for ID [{$metaMediaId}]: ".$metaResponse->body());
        }

        $data = $metaResponse->json();
        $mediaUrl = $data['url'] ?? null;
        $mimeType = $data['mime_type'] ?? 'application/octet-stream';
        $sha256 = $data['sha256'] ?? null;
        $fileSize = (int) ($data['file_size'] ?? 0);

        if (! $mediaUrl) {
            throw new Exception('Meta did not return a valid download URL.');
        }

        // 2. Download raw media binary using token authentication
        /** @var Response $binaryResponse */
        $binaryResponse = Http::withToken($this->accessToken)
            ->timeout($this->timeout)
            ->get($mediaUrl);

        if (! $binaryResponse->successful()) {
            throw new Exception("Failed to download media binary for ID [{$metaMediaId}].");
        }

        $extension = $this->guessExtensionFromMime($mimeType);
        $fileName = $customFileName ?: (Str::random(40).'.'.$extension);
        $disk = (string) config('whatsapp.media_disk', 'public');
        $storageDir = (string) config('whatsapp.media_path', 'whatsapp_media');
        $fullPath = $storageDir.'/'.$fileName;

        Storage::disk($disk)->put($fullPath, $binaryResponse->body());

        return [
            'file_path' => $fullPath,
            'file_name' => $fileName,
            'mime_type' => $mimeType,
            'file_size' => $fileSize ?: strlen($binaryResponse->body()),
            'sha256' => $sha256 ?: hash('sha256', $binaryResponse->body()),
        ];
    }

    /**
     * Helper to normalize destination phone number to digits only.
     */
    protected function normalizeTo(string $phone): string
    {
        return WhatsAppContact::normalizePhoneNumber($phone);
    }

    protected function guessExtensionFromMime(string $mime): string
    {
        return match ($mime) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'audio/ogg', 'audio/ogg; codecs=opus' => 'ogg',
            'audio/mpeg', 'audio/mp3' => 'mp3',
            'audio/aac' => 'aac',
            'audio/amr' => 'amr',
            'video/mp4' => 'mp4',
            'video/3gpp' => '3gp',
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/vnd.ms-excel' => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
            default => 'bin',
        };
    }
}
