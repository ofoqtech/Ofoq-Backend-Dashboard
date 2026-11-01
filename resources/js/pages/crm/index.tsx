import { useEffect, useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Filter,
    Kanban,
    Plus,
    Search,
    Table as TableIcon,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import type { Auth, User } from '@/types/auth';
import type {
    CrmAnalytics,
    Lead,
    PipelineStage,
    PriorityOption,
    Service,
    StatusOption,
} from '@/types/crm';
import { CreateLeadDialog } from './components/create-lead-dialog';
import { CrmKanban } from './components/crm-kanban';
import { CrmStats } from './components/crm-stats';
import { CrmTable } from './components/crm-table';
import { LeadDetailSheet } from './components/lead-detail-sheet';

interface CrmIndexProps {
    leads: Lead[];
    pipeline: Record<string, PipelineStage>;
    analytics: CrmAnalytics;
    statuses: StatusOption[];
    priorities: PriorityOption[];
    teamMembers: User[];
    services: Service[];
    filters: {
        status: string;
        priority: string;
        assigned_to: string;
        search: string;
    };
    selectedLeadId?: number | null;
}

export default function CrmIndex({
    leads,
    pipeline,
    analytics,
    statuses,
    priorities,
    teamMembers,
    services,
    filters,
    selectedLeadId,
}: CrmIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t, isRtl } = useTranslation();
    const isAdmin = auth.user.role === 'admin';

    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedAssignee, setSelectedAssignee] = useState(filters.assigned_to || 'all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);

    // If navigated with ?selected={id}, find and open that lead
    useEffect(() => {
        if (selectedLeadId) {
            const found = leads.find((l) => l.id === selectedLeadId);
            if (found) {
                setActiveLead(found);
            }
        }
    }, [selectedLeadId, leads]);

    // Keep activeLead in sync with updated props (after status/priority/note update)
    useEffect(() => {
        if (activeLead) {
            const fresh = leads.find((l) => l.id === activeLead.id);
            if (fresh) {
                setActiveLead(fresh);
            }
        }
    }, [leads]);

    // Keep local search input state in sync if filters.search changes externally
    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    const handleApplyFilters = (newFilters: Partial<typeof filters>) => {
        const queryParams = {
            search: newFilters.search !== undefined ? newFilters.search : search,
            status: newFilters.status !== undefined ? newFilters.status : selectedStatus,
            priority: newFilters.priority !== undefined ? newFilters.priority : selectedPriority,
            assigned_to: newFilters.assigned_to !== undefined ? newFilters.assigned_to : selectedAssignee,
        };

        // Filter out defaults
        const cleanParams: Record<string, string> = {};
        if (queryParams.search) cleanParams.search = queryParams.search;
        if (queryParams.status && queryParams.status !== 'all') cleanParams.status = queryParams.status;
        if (queryParams.priority && queryParams.priority !== 'all') cleanParams.priority = queryParams.priority;
        if (queryParams.assigned_to && queryParams.assigned_to !== 'all') cleanParams.assigned_to = queryParams.assigned_to;

        router.get('/crm', cleanParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Instant in-memory search filtering for 0ms response on every keystroke
    const filteredLeads = useMemo(() => {
        if (!search.trim()) return leads;
        const term = search.toLowerCase().trim();
        return leads.filter((lead) => {
            const nameMatch = lead.name?.toLowerCase().includes(term);
            const phoneMatch = lead.phone?.toLowerCase().includes(term);
            const emailMatch = lead.email?.toLowerCase().includes(term);
            const companyMatch = lead.company?.toLowerCase().includes(term);
            const serviceMatch = (lead.service_name_snapshot || lead.service?.name_en || lead.service?.name_ar)?.toLowerCase().includes(term);
            const assigneeMatch = lead.assignee?.name?.toLowerCase().includes(term);
            return nameMatch || phoneMatch || emailMatch || companyMatch || serviceMatch || assigneeMatch;
        });
    }, [leads, search]);

    const filteredPipeline = useMemo(() => {
        const res: Record<string, PipelineStage> = {};
        for (const key of Object.keys(pipeline)) {
            res[key] = {
                ...pipeline[key],
                leads: pipeline[key].leads.filter((lead) => {
                    if (!search.trim()) return true;
                    const term = search.toLowerCase().trim();
                    const nameMatch = lead.name?.toLowerCase().includes(term);
                    const phoneMatch = lead.phone?.toLowerCase().includes(term);
                    const emailMatch = lead.email?.toLowerCase().includes(term);
                    const companyMatch = lead.company?.toLowerCase().includes(term);
                    const serviceMatch = (lead.service_name_snapshot || lead.service?.name_en || lead.service?.name_ar)?.toLowerCase().includes(term);
                    const assigneeMatch = lead.assignee?.name?.toLowerCase().includes(term);
                    return nameMatch || phoneMatch || emailMatch || companyMatch || serviceMatch || assigneeMatch;
                }),
            };
        }
        return res;
    }, [pipeline, search]);

    // Live debounced server search (synchronizes backend & URL without requiring Enter)
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentFilterSearch = filters.search || '';
            if (search.trim() !== currentFilterSearch.trim()) {
                handleApplyFilters({ search });
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [search]);

    const handleResetFilters = () => {
        setSearch('');
        setSelectedStatus('all');
        setSelectedPriority('all');
        setSelectedAssignee('all');
        router.get('/crm', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasActiveFilters =
        search !== '' ||
        selectedStatus !== 'all' ||
        selectedPriority !== 'all' ||
        selectedAssignee !== 'all';

    return (
        <>
            <Head title={t('crm.title')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('crm.title')}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {t('crm.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* View Switcher Toggle */}
                        <div className="flex items-center rounded-lg border bg-muted p-0.5">
                            <Button
                                type="button"
                                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('kanban')}
                                className="h-8 gap-1.5 px-3 text-xs"
                            >
                                <Kanban className="size-3.5" />
                                {t('crm.kanban')}
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className="h-8 gap-1.5 px-3 text-xs"
                            >
                                <TableIcon className="size-3.5" />
                                {t('crm.table')}
                            </Button>
                        </div>

                        {/* Add Lead Button */}
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            size="sm"
                            className="h-8 gap-1.5 text-xs shadow-sm"
                        >
                            <Plus className="size-3.5" />
                            {t('crm.record_inquiry')}
                        </Button>
                    </div>
                </div>

                {/* KPI Analytics */}
                <CrmStats analytics={analytics} />

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-2xs md:flex-row md:items-center md:justify-between">
                    {/* Live Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <Search
                            className={`absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none ${
                                isRtl ? 'right-2.5' : 'left-2.5'
                            }`}
                        />
                        <Input
                            type="text"
                            placeholder={t('crm.search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`h-9 text-xs ${isRtl ? 'pr-9 pl-8' : 'pl-9 pr-8'}`}
                            autoComplete="off"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className={`absolute top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
                                    isRtl ? 'left-2.5' : 'right-2.5'
                                }`}
                                title={t('common.clear')}
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Stage Filter */}
                        <Select
                            value={selectedStatus}
                            onValueChange={(val) => {
                                setSelectedStatus(val);
                                handleApplyFilters({ status: val });
                            }}
                        >
                            <SelectTrigger className="h-9 w-[135px] text-xs">
                                <SelectValue placeholder={t('crm.stage')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('crm.all_stages')}</SelectItem>
                                {statuses.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {isRtl ? s.label_ar : s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Priority Filter */}
                        <Select
                            value={selectedPriority}
                            onValueChange={(val) => {
                                setSelectedPriority(val);
                                handleApplyFilters({ priority: val });
                            }}
                        >
                            <SelectTrigger className="h-9 w-[130px] text-xs">
                                <SelectValue placeholder={t('crm.priority')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('crm.all_priorities')}</SelectItem>
                                {priorities.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                        {isRtl ? p.label_ar : p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Assignee Filter */}
                        <Select
                            value={selectedAssignee}
                            onValueChange={(val) => {
                                setSelectedAssignee(val);
                                handleApplyFilters({ assigned_to: val });
                            }}
                        >
                            <SelectTrigger className="h-9 w-[140px] text-xs">
                                <SelectValue placeholder={t('crm.assignee')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('crm.all_reps')}</SelectItem>
                                <SelectItem value="unassigned">{t('common.unassigned')}</SelectItem>
                                {teamMembers.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
                            >
                                <X className="size-3.5" />
                                {t('common.reset')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main View Area */}
                <div className="flex-1">
                    {viewMode === 'kanban' ? (
                        <CrmKanban
                            pipeline={filteredPipeline}
                            onSelectLead={(lead) => setActiveLead(lead)}
                        />
                    ) : (
                        <CrmTable
                            leads={filteredLeads}
                            onSelectLead={(lead) => setActiveLead(lead)}
                        />
                    )}
                </div>
            </div>

            {/* Slide-over Detail Sheet */}
            <LeadDetailSheet
                lead={activeLead}
                isOpen={!!activeLead}
                onClose={() => setActiveLead(null)}
                statuses={statuses}
                priorities={priorities}
                teamMembers={teamMembers}
                isAdmin={isAdmin}
            />

            {/* Create Lead Modal */}
            <CreateLeadDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                services={services}
                priorities={priorities}
                teamMembers={teamMembers}
            />
        </>
    );
}

CrmIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'CRM & Leads',
            href: '/crm',
        },
    ],
};
