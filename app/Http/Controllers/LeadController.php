<?php

namespace App\Http\Controllers;

use App\Enums\LeadPriority;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Service;
use App\Models\ServiceBudget;
use App\Models\User;
use App\Notifications\LeadAssignedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    /**
     * Display a listing of CRM leads and analytics.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Lead::class);

        $statusFilter = $request->query('status');
        $priorityFilter = $request->query('priority');
        $assignedFilter = $request->query('assigned_to');
        $search = $request->query('search');

        $query = Lead::query()
            ->with(['service', 'serviceBudget', 'assignee', 'activities.user'])
            ->latest('id');

        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($priorityFilter && $priorityFilter !== 'all') {
            $query->where('priority', $priorityFilter);
        }

        if ($assignedFilter && $assignedFilter !== 'all') {
            if ($assignedFilter === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $assignedFilter);
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('service_name_snapshot', 'like', "%{$search}%");
            });
        }

        $allLeadsForPipeline = (clone $query)->get();

        // Group leads by pipeline stages for Kanban
        $pipeline = [];
        foreach (LeadStatus::cases() as $case) {
            $pipeline[$case->value] = [
                'status' => $case->value,
                'label' => $case->label(),
                'label_ar' => $case->labelAr(),
                'color' => $case->colorClass(),
                'leads' => $allLeadsForPipeline->filter(fn (Lead $l) => $l->status === $case)->values(),
            ];
        }

        // CRM KPI Analytics (Single fast aggregated query using status index)
        $leadCounts = Lead::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalLeads = (int) $leadCounts->sum();
        $newLeadsCount = (int) ($leadCounts[LeadStatus::New->value] ?? 0);
        $inProgressCount = (int) (
            ($leadCounts[LeadStatus::Contacted->value] ?? 0) +
            ($leadCounts[LeadStatus::Qualified->value] ?? 0) +
            ($leadCounts[LeadStatus::ProposalSent->value] ?? 0) +
            ($leadCounts[LeadStatus::Negotiation->value] ?? 0)
        );
        $wonCount = (int) ($leadCounts[LeadStatus::Won->value] ?? 0);
        $lostCount = (int) ($leadCounts[LeadStatus::Lost->value] ?? 0);
        $conversionRate = $totalLeads > 0 ? round(($wonCount / $totalLeads) * 100, 1) : 0;

        // Marketing Acquisition Channels Breakdown:
        // 1. Meta (Facebook, Messenger, Instagram)
        // 2. TikTok
        // 3. Snapchat (snapshot)
        // 4. LinkedIn
        // 5. Google Ads
        // 6. Direct & Other Sources
        $channelCounts = [];
        foreach ($allLeadsForPipeline as $lead) {
            $ch = $lead->channel;
            $channelCounts[$ch] = ($channelCounts[$ch] ?? 0) + 1;
        }

        $metaCount = ($channelCounts['meta'] ?? 0)
            + ($channelCounts['facebook'] ?? 0)
            + ($channelCounts['instagram'] ?? 0)
            + ($channelCounts['messenger'] ?? 0);
        $tiktokCount = $channelCounts['tiktok'] ?? 0;
        $snapchatCount = ($channelCounts['snapchat'] ?? 0) + ($channelCounts['snapshot'] ?? 0);
        $linkedinCount = $channelCounts['linkedin'] ?? 0;
        $googleCount = ($channelCounts['google'] ?? 0) + ($channelCounts['google_ads'] ?? 0);

        $trackedTotal = $metaCount + $tiktokCount + $snapchatCount + $linkedinCount + $googleCount;
        $otherCount = max(0, $totalLeads - $trackedTotal);

        $channelsData = [
            [
                'key' => 'meta',
                'name' => 'Meta (Facebook, Messenger, Instagram)',
                'name_ar' => 'ميتا (فيسبوك، ماسنجر، انستغرام)',
                'count' => $metaCount,
                'percentage' => $totalLeads > 0 ? round(($metaCount / $totalLeads) * 100, 1) : 0,
                'color' => '#0081FB',
                'badge_class' => 'bg-blue-600/10 text-[#0081FB] border-blue-500/20',
            ],
            [
                'key' => 'tiktok',
                'name' => 'TikTok',
                'name_ar' => 'تيك توك',
                'count' => $tiktokCount,
                'percentage' => $totalLeads > 0 ? round(($tiktokCount / $totalLeads) * 100, 1) : 0,
                'color' => '#000000',
                'badge_class' => 'bg-neutral-900/10 text-neutral-900 dark:text-neutral-100 border-neutral-700/20',
            ],
            [
                'key' => 'snapchat',
                'name' => 'Snapchat',
                'name_ar' => 'سناب شات',
                'count' => $snapchatCount,
                'percentage' => $totalLeads > 0 ? round(($snapchatCount / $totalLeads) * 100, 1) : 0,
                'color' => '#E5C000',
                'badge_class' => 'bg-amber-400/15 text-amber-700 dark:text-yellow-400 border-amber-400/30',
            ],
            [
                'key' => 'linkedin',
                'name' => 'LinkedIn',
                'name_ar' => 'لينكد إن',
                'count' => $linkedinCount,
                'percentage' => $totalLeads > 0 ? round(($linkedinCount / $totalLeads) * 100, 1) : 0,
                'color' => '#0A66C2',
                'badge_class' => 'bg-sky-600/10 text-[#0A66C2] border-sky-600/20',
            ],
            [
                'key' => 'google',
                'name' => 'Google Ads',
                'name_ar' => 'إعلانات جوجل',
                'count' => $googleCount,
                'percentage' => $totalLeads > 0 ? round(($googleCount / $totalLeads) * 100, 1) : 0,
                'color' => '#4285F4',
                'badge_class' => 'bg-sky-500/10 text-sky-600 border-sky-500/20',
            ],
            [
                'key' => 'other',
                'name' => 'Direct & Other Sources',
                'name_ar' => 'مباشر ومصادر أخرى',
                'count' => $otherCount,
                'percentage' => $totalLeads > 0 ? round(($otherCount / $totalLeads) * 100, 1) : 0,
                'color' => '#64748B',
                'badge_class' => 'bg-slate-500/10 text-slate-600 border-slate-500/20',
            ],
        ];

        $teamMembers = User::query()
            ->where('status', 'active')
            ->select('id', 'name', 'email', 'role', 'avatar')
            ->orderBy('name')
            ->get();

        $services = Service::query()
            ->where('is_active', true)
            ->with('budgets')
            ->orderBy('order')
            ->get();

        return Inertia::render('crm/index', [
            'leads' => $allLeadsForPipeline,
            'pipeline' => $pipeline,
            'analytics' => [
                'total_leads' => $totalLeads,
                'new_leads' => $newLeadsCount,
                'in_progress' => $inProgressCount,
                'won' => $wonCount,
                'lost' => $lostCount,
                'conversion_rate' => $conversionRate,
                'channels' => $channelsData,
            ],
            'statuses' => collect(LeadStatus::cases())->map(fn (LeadStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'label_ar' => $s->labelAr(),
                'color' => $s->colorClass(),
            ]),
            'priorities' => collect(LeadPriority::cases())->map(fn (LeadPriority $p) => [
                'value' => $p->value,
                'label' => $p->label(),
                'label_ar' => $p->labelAr(),
                'color' => $p->colorClass(),
            ]),
            'teamMembers' => $teamMembers,
            'services' => $services,
            'filters' => [
                'status' => $statusFilter ?? 'all',
                'priority' => $priorityFilter ?? 'all',
                'assigned_to' => $assignedFilter ?? 'all',
                'search' => $search ?? '',
            ],
            'selectedLeadId' => $request->query('selected') ? (int) $request->query('selected') : null,
        ]);
    }

    /**
     * Store a newly created lead in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Lead::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:150'],
            'company' => ['nullable', 'string', 'max:150'],
            'service_id' => ['nullable', 'exists:services,id'],
            'service_budget_id' => ['nullable', 'exists:service_budgets,id'],
            'priority' => ['required', Rule::enum(LeadPriority::class)],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'internal_notes' => ['nullable', 'string', 'max:2000'],
            'source' => ['nullable', 'string', 'max:60'],
            'utm_source' => ['nullable', 'string', 'max:100'],
            'utm_medium' => ['nullable', 'string', 'max:100'],
            'utm_campaign' => ['nullable', 'string', 'max:150'],
            'form_name' => ['nullable', 'string', 'max:120'],
        ]);

        $service = ! empty($validated['service_id']) ? Service::find($validated['service_id']) : null;
        $budget = ! empty($validated['service_budget_id']) ? ServiceBudget::find($validated['service_budget_id']) : null;

        $lead = Lead::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'company' => $validated['company'] ?? null,
            'service_id' => $service?->id,
            'service_budget_id' => $budget?->id,
            'service_name_snapshot' => $service?->name_en ?? $service?->name_ar,
            'budget_range_snapshot' => $budget ? ($budget->type_en ?? $budget->type_ar).' · '.$budget->range : null,
            'status' => LeadStatus::New,
            'priority' => LeadPriority::from($validated['priority']),
            'assigned_to' => $validated['assigned_to'] ?? null,
            'internal_notes' => $validated['internal_notes'] ?? null,
            'source' => $validated['source'] ?? 'dashboard',
            'utm_source' => $validated['utm_source'] ?? null,
            'utm_medium' => $validated['utm_medium'] ?? null,
            'utm_campaign' => $validated['utm_campaign'] ?? null,
            'form_name' => $validated['form_name'] ?? null,
            'ip_address' => $request->ip(),
        ]);

        $lead->logActivity('created', 'Lead created manually by '.auth()->user()->name.'.', auth()->id());
        cache()->forget('crm_new_leads_count');

        if (! empty($validated['assigned_to'])) {
            $assignee = User::find($validated['assigned_to']);
            if ($assignee && $assignee->id !== auth()->id()) {
                try {
                    $assignee->notify(new LeadAssignedNotification($lead, auth()->user()));
                } catch (\Throwable $e) {
                    Log::warning('Failed to dispatch LeadAssignedNotification: '.$e->getMessage(), [
                        'lead_id' => $lead->id,
                        'assignee_id' => $assignee->id,
                    ]);
                }
            }
        }

        return redirect()->route('crm.index', ['selected' => $lead->id])
            ->with('success', 'Lead created successfully.');
    }

    /**
     * Update lead pipeline status.
     */
    public function updateStatus(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(LeadStatus::class)],
            'lost_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $lead->status;
        $newStatus = LeadStatus::from($validated['status']);

        $lead->status = $newStatus;

        if ($newStatus === LeadStatus::Lost && ! empty($validated['lost_reason'])) {
            $lead->lost_reason = $validated['lost_reason'];
        }

        if ($newStatus !== LeadStatus::New && ! $lead->contacted_at) {
            $lead->contacted_at = now();
        }

        $lead->save();

        $lead->logActivity(
            'status_change',
            "Status changed from '{$oldStatus->label()}' to '{$newStatus->label()}' by ".auth()->user()->name.'.',
            auth()->id()
        );

        cache()->forget('crm_new_leads_count');

        return back()->with('success', 'Lead stage updated.');
    }

    /**
     * Update lead priority.
     */
    public function updatePriority(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $validated = $request->validate([
            'priority' => ['required', Rule::enum(LeadPriority::class)],
        ]);

        $oldPriority = $lead->priority;
        $newPriority = LeadPriority::from($validated['priority']);

        $lead->priority = $newPriority;
        $lead->save();

        $lead->logActivity(
            'priority_change',
            "Priority updated from '{$oldPriority->label()}' to '{$newPriority->label()}' by ".auth()->user()->name.'.',
            auth()->id()
        );

        return back()->with('success', 'Priority updated.');
    }

    /**
     * Assign lead to an employee or administrator.
     */
    public function assign(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('assign', $lead);

        $validated = $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $previousAssigneeId = $lead->assigned_to;
        $lead->assigned_to = $validated['assigned_to'] ?? null;
        $lead->save();

        $assigneeName = $lead->assignee ? $lead->assignee->name : 'Unassigned';
        $lead->logActivity(
            'assigned',
            "Lead assigned to {$assigneeName} by ".auth()->user()->name.'.',
            auth()->id()
        );

        if ($lead->assigned_to && $lead->assigned_to !== $previousAssigneeId) {
            $assignee = User::find($lead->assigned_to);
            if ($assignee && $assignee->id !== auth()->id()) {
                try {
                    $assignee->notify(new LeadAssignedNotification($lead, auth()->user()));
                } catch (\Throwable $e) {
                    Log::warning('Failed to dispatch LeadAssignedNotification: '.$e->getMessage(), [
                        'lead_id' => $lead->id,
                        'assignee_id' => $assignee->id,
                    ]);
                }
            }
        }

        return back()->with('success', 'Lead assignment updated.');
    }

    /**
     * Add an internal note or activity log.
     */
    public function addNote(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('addNote', $lead);

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'type' => ['nullable', 'string', 'in:note,call,meeting,email,whatsapp'],
        ]);

        $lead->logActivity(
            $validated['type'] ?? 'note',
            $validated['content'],
            auth()->id()
        );

        return back()->with('success', 'Note recorded in timeline.');
    }

    /**
     * Check for new incoming leads since a given ID (for real-time sound and push notifications).
     */
    public function realtimeCheck(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Lead::class);

        $lastId = $request->query('last_id');
        $lastActivityId = $request->query('last_activity_id');
        $user = $request->user();

        // Calculate unread notification count for the user
        $unreadCount = $user->unreadNotifications()->count();
        if ($unreadCount === 0 && $user->notifications()->count() === 0) {
            $unreadCount = $user->isAdmin()
                ? Lead::where('status', LeadStatus::New)->count()
                : Lead::where('status', LeadStatus::New)->where(fn ($q) => $q->where('assigned_to', $user->id)->orWhereNull('assigned_to'))->count();
        }

        // If no last_id is provided, initialize client watermark to the current max ID and return recent history
        if ($lastId === null || $lastId === '') {
            $latestId = (int) (Lead::query()->max('id') ?? 0);
            $latestActivityId = (int) (LeadActivity::query()->max('id') ?? 0);

            $recentQuery = Lead::query()->latest('id')->limit(15);
            if ($user->isEmployee()) {
                $recentQuery->where(function ($q) use ($user) {
                    $q->where('assigned_to', $user->id)
                        ->orWhereNull('assigned_to');
                });
            }

            $unreadLeadIds = $user->unreadNotifications()
                ->pluck('data')
                ->map(fn ($d) => $d['lead_id'] ?? null)
                ->filter()
                ->all();

            $hasDbNotifications = $user->notifications()->count() > 0;

            $recentHistory = $recentQuery->get()->map(function (Lead $lead) use ($unreadLeadIds, $hasDbNotifications) {
                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'phone' => $lead->phone,
                    'company' => $lead->company,
                    'channel' => $lead->channel,
                    'channel_label' => $lead->channel_label,
                    'channel_label_ar' => $lead->channel_label_ar,
                    'service_name_snapshot' => $lead->service_name_snapshot,
                    'created_at' => $lead->created_at->diffForHumans(),
                    'is_unread' => in_array($lead->id, $unreadLeadIds, true) || (! $hasDbNotifications && $lead->status === LeadStatus::New),
                ];
            });

            return response()->json([
                'latest_id' => $latestId,
                'latest_activity_id' => $latestActivityId,
                'unread_count' => $unreadCount,
                'new_leads' => [],
                'recent_history' => $recentHistory,
            ]);
        }

        $query = Lead::query()
            ->where('id', '>', (int) $lastId)
            ->latest('id')
            ->limit(10);

        // If employee, limit to unassigned leads or assigned to this employee
        if ($user->isEmployee()) {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                    ->orWhereNull('assigned_to');
            });
        }

        $newLeads = $query->get()->map(function (Lead $lead) {
            return [
                'id' => $lead->id,
                'name' => $lead->name,
                'phone' => $lead->phone,
                'company' => $lead->company,
                'channel' => $lead->channel,
                'channel_label' => $lead->channel_label,
                'channel_label_ar' => $lead->channel_label_ar,
                'service_name_snapshot' => $lead->service_name_snapshot,
                'created_at' => $lead->created_at->diffForHumans(),
                'notification_type' => 'new_lead',
                'is_unread' => true,
            ];
        });

        $currentMaxId = $newLeads->isNotEmpty()
            ? max($newLeads->pluck('id')->all())
            : (int) $lastId;

        // Check for new assignments targeting this user since last_activity_id
        $currentMaxActivityId = (int) (LeadActivity::query()->max('id') ?? 0);
        $assignedAlerts = collect();

        if ($lastActivityId !== null && $lastActivityId !== '') {
            $assignedActivities = LeadActivity::query()
                ->with(['lead', 'user'])
                ->where('id', '>', (int) $lastActivityId)
                ->where('type', 'assigned')
                ->where('user_id', '!=', $user->id)
                ->whereHas('lead', function ($q) use ($user) {
                    $q->where('assigned_to', $user->id);
                })
                ->get();

            $assignedAlerts = $assignedActivities->map(function (LeadActivity $activity) {
                $lead = $activity->lead;

                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'phone' => $lead->phone,
                    'company' => $lead->company,
                    'channel' => $lead->channel,
                    'channel_label' => $lead->channel_label,
                    'channel_label_ar' => $lead->channel_label_ar,
                    'service_name_snapshot' => $lead->service_name_snapshot,
                    'created_at' => $activity->created_at->diffForHumans(),
                    'notification_type' => 'assigned',
                    'assigned_by_name' => $activity->user?->name,
                    'is_assignment' => true,
                    'is_unread' => true,
                ];
            });
        }

        // Merge alerts, preventing duplicate lead IDs in a single poll response
        $existingIds = $newLeads->pluck('id')->flip();
        $mergedAlerts = $newLeads->concat(
            $assignedAlerts->reject(fn ($item) => isset($existingIds[$item['id']]))
        );

        return response()->json([
            'latest_id' => $currentMaxId,
            'latest_activity_id' => $currentMaxActivityId,
            'unread_count' => $unreadCount,
            'new_leads' => $mergedAlerts->values(),
        ]);
    }

    /**
     * Delete the specified lead.
     */
    public function destroy(Lead $lead): RedirectResponse
    {
        Gate::authorize('delete', $lead);

        $lead->delete();
        cache()->forget('crm_new_leads_count');

        return redirect()->route('crm.index')->with('success', 'Lead deleted successfully.');
    }
}
