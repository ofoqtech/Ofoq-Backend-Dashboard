<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessWhatsAppWebhookJob;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppWebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Handle Meta webhook verification challenge (GET).
     */
    public function verify(Request $request): Response|JsonResponse
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $configuredToken = config('whatsapp.webhook_verify_token');
        $accountToken = WhatsAppAccount::getDefault()?->webhook_verify_token;
        $expectedToken = $accountToken ?: $configuredToken;

        if ($mode === 'subscribe' && ! empty($token) && hash_equals((string) $expectedToken, (string) $token)) {
            Log::info('Meta WhatsApp Webhook successfully verified.');

            return response((string) $challenge, 200, ['Content-Type' => 'text/plain']);
        }

        Log::warning('Meta WhatsApp Webhook verification failed. Invalid token.', [
            'mode' => $mode,
            'provided_token' => $token,
        ]);

        return response()->json(['error' => 'Invalid verify token or mode.'], 403);
    }

    /**
     * Handle incoming Meta webhook payload (POST).
     */
    public function handle(Request $request): JsonResponse
    {
        $rawPayload = $request->getContent();
        $signature = $request->header('X-Hub-Signature-256');

        $appSecret = config('whatsapp.app_secret') ?: WhatsAppAccount::getDefault()?->app_secret;

        // Verify HMAC-SHA256 signature when App Secret is configured
        if (! empty($appSecret)) {
            if (empty($signature)) {
                Log::warning('WhatsApp Webhook rejected: missing X-Hub-Signature-256 header.');

                return response()->json(['error' => 'Missing signature.'], 403);
            }

            $expectedSignature = 'sha256='.hash_hmac('sha256', $rawPayload, $appSecret);
            if (! hash_equals($expectedSignature, $signature)) {
                Log::warning('WhatsApp Webhook rejected: invalid X-Hub-Signature-256 signature.');

                return response()->json(['error' => 'Invalid signature.'], 403);
            }
        }

        $decoded = json_decode($rawPayload, true);
        if (! is_array($decoded)) {
            Log::warning('WhatsApp Webhook received malformed non-JSON payload.');

            return response()->json(['error' => 'Malformed payload.'], 400);
        }

        // Store webhook event for audit trail and idempotency
        $event = WhatsAppWebhookEvent::create([
            'event_id' => $decoded['entry'][0]['id'] ?? null,
            'payload' => $decoded,
            'processed' => false,
        ]);

        // Asynchronously process incoming messages and delivery receipts
        ProcessWhatsAppWebhookJob::dispatch($event->id);

        return response()->json(['status' => 'received'], 200);
    }
}
