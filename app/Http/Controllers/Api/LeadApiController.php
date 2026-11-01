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
            'source' => $validated['source'] ?? 'get_in_touch',
            'ip_address' => $request->ip(),
        ]);

        // Record initial timeline activity
        $lead->logActivity('created', 'Inquiry submitted from website Get In Touch form.', null);

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
            'data' => $lead,
        ], 201, [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
