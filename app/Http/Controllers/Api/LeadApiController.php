<?php

namespace App\Http\Controllers\Api;

use App\Enums\LeadPriority;
use App\Enums\LeadStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Service;
use App\Models\ServiceBudget;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class LeadApiController extends Controller
{
    /**
     * Get active services with budget tiers formatted for the frontend ContactFormSection.
     */
    public function services(Request $request): JsonResponse
    {
        $locale = $request->query('locale', 'en');

        $services = Service::query()
            ->where('is_active', true)
            ->with(['budgets'])
            ->orderBy('order', 'asc')
            ->get();

        $formatted = $services->map(fn (Service $service) => $service->toFrontendApiFormat($locale))->values();

        return response()->json([
            'success' => true,
            'count' => $formatted->count(),
            'data' => $formatted,
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Handle the frontend service form submission (ContactFormSection.jsx).
     */
    public function submitServiceForm(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'mobile' => ['required', 'string', 'max:40'],
            'service_id' => ['required'],
            'email' => ['nullable', 'email', 'max:150'],
            'company' => ['nullable', 'string', 'max:150'],
            'message' => ['nullable', 'string', 'max:2000'],
            'source' => ['nullable', 'string', 'max:60'],
            'utm_source' => ['nullable', 'string', 'max:100'],
            'utm_medium' => ['nullable', 'string', 'max:100'],
            'utm_campaign' => ['nullable', 'string', 'max:150'],
            'utm_content' => ['nullable', 'string', 'max:150'],
            'form_name' => ['nullable', 'string', 'max:120'],
            'landing_page' => ['nullable', 'string', 'max:1000'],
            'referrer' => ['nullable', 'string', 'max:1000'],
        ]);

        $serviceId = null;
        $serviceBudgetId = null;
        $serviceNameSnapshot = null;
        $budgetRangeSnapshot = null;

        // The frontend passes selectedBudget as service_id:
        $rawServiceId = $validated['service_id'];

        $budget = ServiceBudget::with('service')->find($rawServiceId);
        if ($budget) {
            $serviceBudgetId = $budget->id;
            $serviceId = $budget->service_id;
            $serviceNameSnapshot = $budget->service?->name_en ?? $budget->service?->name_ar;
            $budgetRangeSnapshot = ($budget->type_en ?? $budget->type_ar).' · '.$budget->range;
        } else {
            // Check if service_id is actually a Service ID directly
            $service = Service::find($rawServiceId);
            if ($service) {
                $serviceId = $service->id;
                $serviceNameSnapshot = $service->name_en ?? $service->name_ar;
            }
        }

        $referrer = $validated['referrer'] ?? $request->header('referer');
        $utmSource = $validated['utm_source'] ?? null;

        // Auto-detect advertising & social platform from HTTP Referer if UTM is omitted
        if (empty($utmSource) && ! empty($referrer)) {
            $refLower = strtolower($referrer);
            if (
                str_contains($refLower, 'facebook.com') ||
                str_contains($refLower, 'instagram.com') ||
                str_contains($refLower, 'messenger.com') ||
                str_contains($refLower, 'meta.com')
            ) {
                $utmSource = 'meta';
            } elseif (str_contains($refLower, 'tiktok.com')) {
                $utmSource = 'tiktok';
            } elseif (str_contains($refLower, 'snapchat.com')) {
                $utmSource = 'snapchat';
            } elseif (str_contains($refLower, 'linkedin.com') || str_contains($refLower, 'lnkd.in')) {
                $utmSource = 'linkedin';
            } elseif (str_contains($refLower, 'google.')) {
                $utmSource = 'google';
            }
        }

        $formName = $validated['form_name'] ?? ($validated['source'] ?? 'Get In Touch Form');

        $lead = Lead::create([
            'name' => $validated['name'],
            'phone' => $validated['mobile'],
            'email' => $validated['email'] ?? null,
            'company' => $validated['company'] ?? null,
            'service_id' => $serviceId,
            'service_budget_id' => $serviceBudgetId,
            'service_name_snapshot' => $serviceNameSnapshot,
            'budget_range_snapshot' => $budgetRangeSnapshot,
            'status' => LeadStatus::New,
            'priority' => LeadPriority::High,
            'internal_notes' => $validated['message'] ?? null,
            'source' => $validated['source'] ?? ($utmSource ?: 'website_form'),
            'utm_source' => $utmSource,
            'utm_medium' => $validated['utm_medium'] ?? null,
            'utm_campaign' => $validated['utm_campaign'] ?? null,
            'utm_content' => $validated['utm_content'] ?? null,
            'form_name' => $formName,
            'landing_page' => $validated['landing_page'] ?? null,
            'referrer' => $referrer,
            'ip_address' => $request->ip(),
        ]);

        // Record initial timeline activity with marketing context
        $timelineContext = array_filter([
            'Platform' => $lead->channel_label,
            'Campaign' => $lead->utm_campaign,
            'Form' => $lead->form_name,
        ]);
        $activityText = 'Inquiry received'.($timelineContext ? ' ['.implode(' | ', array_map(fn ($k, $v) => "{$k}: {$v}", array_keys($timelineContext), $timelineContext)).']' : '.');
        $lead->logActivity('created', $activityText, null);

        // Notify active admins
        try {
            $admins = User::query()
                ->where('role', Role::Admin)
                ->where('status', 'active')
                ->get();

            if ($admins->isNotEmpty()) {
                Notification::send($admins, new NewLeadNotification($lead));
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch NewLeadNotification: '.$e->getMessage(), [
                'lead_id' => $lead->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your project request has been received. Our team will contact you shortly.',
            'data' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'service' => $lead->service_name_snapshot,
            ],
        ], 201, [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
