<?php

namespace App\Http\Controllers;

use App\Enums\LeadPriority;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\Service;
use App\Models\ServiceBudget;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
            'ip_address' => $request->ip(),
        ]);

        $lead->logActivity('created', 'Lead created manually by '.auth()->user()->name.'.', auth()->id());
        cache()->forget('crm_new_leads_count');

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

        $lead->assigned_to = $validated['assigned_to'] ?? null;
        $lead->save();

        $assigneeName = $lead->assignee ? $lead->assignee->name : 'Unassigned';
        $lead->logActivity(
            'assigned',
            "Lead assigned to {$assigneeName} by ".auth()->user()->name.'.',
            auth()->id()
        );

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
