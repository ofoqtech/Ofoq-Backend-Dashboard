import { useEffect, useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Clock,
    Filter,
    Kanban,
    Layers,
    Plus,
    Search,
    Sparkles,
    Table as TableIcon,
    Trophy,
    X,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
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
import { CrmChannelsBreakdown } from './components/crm-channels-breakdown';
import { CrmKanban } from './components/crm-kanban';
import { CrmPagination } from './components/crm-pagination';
import { CrmStats } from './components/crm-stats';
import { CrmTable } from './components/crm-table';
import { LeadDetailSheet } from './components/lead-detail-sheet';

type CrmSubPage = 'all' | 'kanban' | 'new' | 'in_progress' | 'won' | 'lost';

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

    // Sub-page tab state (sync with URL ?tab=...)
    const [activeTab, setActiveTab] = useState<CrmSubPage>(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get('tab') as CrmSubPage;
            if (
                ['all', 'kanban', 'new', 'in_progress', 'won', 'lost'].includes(
                    tabParam
                )
            ) {
                return tabParam;
            }
        }
        return 'all';
    });

    // Per-page filter controls
    const [search, setSearch] = useState(filters.search || '');
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [selectedPriority, setSelectedPriority] = useState<string>(
        filters.priority || 'all'
    );
    const [selectedAssignee, setSelectedAssignee] = useState<string>(
        filters.assigned_to || 'all'
    );
    const [selectedStage, setSelectedStage] = useState<string>(
        filters.status || 'all'
    );
    const [selectedInProgressStage, setSelectedInProgressStage] =
        useState<string>('all');

    // Per-page pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

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

    // Change sub-page tab and sync URL
    const handleTabChange = (newTab: CrmSubPage) => {
        setActiveTab(newTab);
        setCurrentPage(1);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', newTab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    // Reset filters
    const handleResetFilters = () => {
        setSearch('');
        setSelectedChannel('');
        setSelectedPriority('all');
        setSelectedAssignee('all');
        setSelectedStage('all');
        setSelectedInProgressStage('all');
        setCurrentPage(1);
    };

    // Calculate sub-page tab badge counts
    const tabCounts = useMemo(() => {
        const newCount = leads.filter((l) => l.status === 'new').length;
        const inProgressCount = leads.filter((l) =>
            ['contacted', 'qualified', 'proposal_sent', 'negotiation'].includes(
                l.status
            )
        ).length;
        const wonCount = leads.filter((l) => l.status === 'won').length;
        const lostCount = leads.filter((l) => l.status === 'lost').length;

        return {
            all: leads.length,
            kanban: leads.length,
            new: newCount,
            in_progress: inProgressCount,
            won: wonCount,
            lost: lostCount,
        };
    }, [leads]);

    // Sub-pages metadata configuration
    const subPageTabs: {
        key: CrmSubPage;
        title: string;
        icon: typeof Layers;
        count: number;
        badgeClass: string;
    }[] = [
        {
            key: 'all',
            title: t('crm.tab_all', 'All Inquiries'),
            icon: Layers,
            count: tabCounts.all,
            badgeClass: 'bg-muted text-muted-foreground',
        },
        {
            key: 'kanban',
            title: t('crm.tab_kanban', 'Pipeline Board'),
            icon: Kanban,
            count: tabCounts.kanban,
            badgeClass: 'bg-primary/10 text-primary',
        },
        {
            key: 'new',
            title: t('crm.tab_new', 'New Inquiries'),
            icon: Sparkles,
            count: tabCounts.new,
            badgeClass:
                'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold',
        },
        {
            key: 'in_progress',
            title: t('crm.tab_in_progress', 'In Progress'),
            icon: Clock,
            count: tabCounts.in_progress,
            badgeClass:
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold',
        },
        {
            key: 'won',
            title: t('crm.tab_won', 'Won Deals'),
            icon: Trophy,
            count: tabCounts.won,
            badgeClass:
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold',
        },
        {
            key: 'lost',
            title: t('crm.tab_lost', 'Lost Deals'),
            icon: XCircle,
            count: tabCounts.lost,
            badgeClass:
                'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold',
        },
    ];

    // Get base leads for active sub-page
    const baseLeads = useMemo(() => {
        switch (activeTab) {
            case 'new':
                return leads.filter((l) => l.status === 'new');
            case 'in_progress':
                return leads.filter((l) =>
                    [
                        'contacted',
                        'qualified',
                        'proposal_sent',
                        'negotiation',
                    ].includes(l.status)
                );
            case 'won':
                return leads.filter((l) => l.status === 'won');
            case 'lost':
                return leads.filter((l) => l.status === 'lost');
            case 'all':
            case 'kanban':
            default:
                return leads;
        }
    }, [leads, activeTab]);

    // Apply active page filters
    const filteredLeads = useMemo(() => {
        return baseLeads.filter((lead) => {
            // Channel filter
            if (selectedChannel) {
                if (selectedChannel === 'other') {
                    if (
                        [
                            'meta',
                            'facebook',
                            'instagram',
                            'messenger',
                            'tiktok',
                            'snapchat',
                            'snapshot',
                            'linkedin',
                            'google',
                        ].includes(lead.channel || '')
                    ) {
                        return false;
                    }
                } else if (selectedChannel === 'meta') {
                    if (
                        ![
                            'meta',
                            'facebook',
                            'instagram',
                            'messenger',
                        ].includes(lead.channel || '')
                    ) {
                        return false;
                    }
                } else if (selectedChannel === 'snapchat') {
                    if (
                        !['snapchat', 'snapshot'].includes(lead.channel || '')
                    ) {
                        return false;
                    }
                } else if (lead.channel !== selectedChannel) {
                    return false;
                }
            }

            // Priority filter
            if (
                selectedPriority !== 'all' &&
                lead.priority !== selectedPriority
            ) {
                return false;
            }

            // Assignee filter
            if (selectedAssignee !== 'all') {
                if (selectedAssignee === 'unassigned') {
                    if (lead.assigned_to != null) return false;
                } else if (String(lead.assigned_to) !== selectedAssignee) {
                    return false;
                }
            }

            // Stage filter on 'all' tab
            if (activeTab === 'all' && selectedStage !== 'all') {
                if (lead.status !== selectedStage) return false;
            }

            // In-progress sub-stage filter on 'in_progress' tab
            if (
                activeTab === 'in_progress' &&
                selectedInProgressStage !== 'all'
            ) {
                if (lead.status !== selectedInProgressStage) return false;
            }

            // Text search keyword filter
            if (search.trim()) {
                const term = search.toLowerCase().trim();
                const nameMatch = lead.name?.toLowerCase().includes(term);
                const phoneMatch = lead.phone?.toLowerCase().includes(term);
                const emailMatch = lead.email?.toLowerCase().includes(term);
                const companyMatch = lead.company?.toLowerCase().includes(term);
                const serviceMatch = (
                    lead.service_name_snapshot ||
                    lead.service?.name_en ||
                    lead.service?.name_ar
                )
                    ?.toLowerCase()
                    .includes(term);
                const assigneeMatch = lead.assignee?.name
                    ?.toLowerCase()
                    .includes(term);
                const campaignMatch = lead.utm_campaign
                    ?.toLowerCase()
                    .includes(term);
                const formMatch = lead.form_name?.toLowerCase().includes(term);
                const channelMatch = (lead.channel || '')
                    .toLowerCase()
                    .includes(term);

                if (
                    !(
                        nameMatch ||
                        phoneMatch ||
                        emailMatch ||
                        companyMatch ||
                        serviceMatch ||
                        assigneeMatch ||
                        campaignMatch ||
                        formMatch ||
                        channelMatch
                    )
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [
        baseLeads,
        selectedChannel,
        selectedPriority,
        selectedAssignee,
        selectedStage,
        selectedInProgressStage,
        search,
        activeTab,
    ]);

    // Pagination calculations
    const totalItems = filteredLeads.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginationFrom =
        totalItems > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0;
    const paginationTo = Math.min(safeCurrentPage * pageSize, totalItems);

    const paginatedLeads = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredLeads.slice(start, start + pageSize);
    }, [filteredLeads, safeCurrentPage, pageSize]);

    // Kanban pipeline filtering with identical search & filters
    const filteredPipeline = useMemo(() => {
        const res: Record<string, PipelineStage> = {};
        for (const key of Object.keys(pipeline)) {
            res[key] = {
                ...pipeline[key],
                leads: pipeline[key].leads.filter((lead) => {
                    // Channel filter
                    if (selectedChannel) {
                        if (selectedChannel === 'other') {
                            if (
                                [
                                    'meta',
                                    'facebook',
                                    'instagram',
                                    'messenger',
                                    'tiktok',
                                    'snapchat',
                                    'snapshot',
                                    'linkedin',
                                    'google',
                                ].includes(lead.channel || '')
                            ) {
                                return false;
                            }
                        } else if (selectedChannel === 'meta') {
                            if (
                                ![
                                    'meta',
                                    'facebook',
                                    'instagram',
                                    'messenger',
                                ].includes(lead.channel || '')
                            ) {
                                return false;
                            }
                        } else if (selectedChannel === 'snapchat') {
                            if (
                                !['snapchat', 'snapshot'].includes(
                                    lead.channel || ''
                                )
                            ) {
                                return false;
                            }
                        } else if (lead.channel !== selectedChannel) {
                            return false;
                        }
                    }

                    // Priority filter
                    if (
                        selectedPriority !== 'all' &&
                        lead.priority !== selectedPriority
                    ) {
                        return false;
                    }

                    // Assignee filter
                    if (selectedAssignee !== 'all') {
                        if (selectedAssignee === 'unassigned') {
                            if (lead.assigned_to != null) return false;
                        } else if (
                            String(lead.assigned_to) !== selectedAssignee
                        ) {
                            return false;
                        }
                    }

                    // Search filter
                    if (search.trim()) {
                        const term = search.toLowerCase().trim();
                        const nameMatch = lead.name?.toLowerCase().includes(term);
                        const phoneMatch = lead.phone?.toLowerCase().includes(term);
                        const emailMatch = lead.email?.toLowerCase().includes(term);
                        const companyMatch = lead.company
                            ?.toLowerCase()
                            .includes(term);
                        const serviceMatch = (
                            lead.service_name_snapshot ||
                            lead.service?.name_en ||
                            lead.service?.name_ar
                        )
                            ?.toLowerCase()
                            .includes(term);
                        const assigneeMatch = lead.assignee?.name
                            ?.toLowerCase()
                            .includes(term);
                        const campaignMatch = lead.utm_campaign
                            ?.toLowerCase()
                            .includes(term);
                        const formMatch = lead.form_name
                            ?.toLowerCase()
                            .includes(term);
                        const channelMatch = (lead.channel || '')
                            .toLowerCase()
                            .includes(term);

                        if (
                            !(
                                nameMatch ||
                                phoneMatch ||
                                emailMatch ||
                                companyMatch ||
                                serviceMatch ||
                                assigneeMatch ||
                                campaignMatch ||
                                formMatch ||
                                channelMatch
                            )
                        ) {
                            return false;
                        }
                    }

                    return true;
                }),
            };
        }
        return res;
    }, [pipeline, selectedChannel, selectedPriority, selectedAssignee, search]);

    const hasActiveFilters =
        search !== '' ||
        selectedChannel !== '' ||
        selectedPriority !== 'all' ||
        selectedAssignee !== 'all' ||
        (activeTab === 'all' && selectedStage !== 'all') ||
        (activeTab === 'in_progress' && selectedInProgressStage !== 'all');

    // Contextual empty messages per tab
    const emptyMessage = useMemo(() => {
        if (hasActiveFilters) {
            return {
                title: t('crm.no_leads_found'),
                subtitle: t('crm.no_leads_hint'),
            };
        }

        switch (activeTab) {
            case 'new':
                return {
                    title: t('crm.no_new_leads'),
                    subtitle: isRtl
                        ? 'كافة الاستفسارات تم استلامها والتواصل مع أصحابها.'
                        : 'All inquiries have been reached out to.',
                };
            case 'in_progress':
                return {
                    title: t('crm.no_in_progress'),
                    subtitle: isRtl
                        ? 'يمكنك نقل الطلبات الجديدة إلى مرحلة التواصل للبدء في المتابعة.'
                        : 'Move new leads to Contacted stage to track active discussions.',
                };
            case 'won':
                return {
                    title: t('crm.no_won_deals'),
                    subtitle: isRtl
                        ? 'عند إتمام التعاقد مع العميل، قم بنقل طلبه إلى مرحلة صفقات ناجحة.'
                        : 'Mark leads as Won when the deal agreement is finalized.',
                };
            case 'lost':
                return {
                    title: t('crm.no_lost_deals'),
                    subtitle: isRtl
                        ? 'الطلبات المفقودة أو غير المكتملة ستظهر هنا مع أسباب الخسارة.'
                        : 'Lost inquiries will appear here along with cancellation reasons.',
                };
            default:
                return {
                    title: t('crm.no_leads_found'),
                    subtitle: t('crm.no_leads_hint'),
                };
        }
    }, [hasActiveFilters, activeTab, t, isRtl]);

    return (
        <>
            <Head title={t('crm.title')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('crm.title')}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {t('crm.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Quick Add Inquiry Button */}
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            size="sm"
                            className="h-8 gap-1.5 text-xs shadow-sm cursor-pointer"
                        >
                            <Plus className="size-3.5" />
                            {t('crm.record_inquiry')}
                        </Button>
                    </div>
                </div>

                {/* KPI Analytics */}
                <CrmStats analytics={analytics} />

                {/* Acquisition Channels Breakdown */}
                <CrmChannelsBreakdown
                    channels={analytics.channels || []}
                    selectedChannel={selectedChannel}
                    onSelectChannel={(channel) => {
                        setSelectedChannel(channel);
                        setCurrentPage(1);
                    }}
                />

                {/* Enhanced CRM Sub-Pages Section (Body flex-1) */}
                <div className="flex flex-1 flex-col gap-4">
                    {/* Sub-Pages Tab Navigation Bar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/60 pb-1.5 scrollbar-none">
                        {subPageTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabChange(tab.key)}
                                    className={cn(
                                        'group relative flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer select-none',
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'size-4',
                                            isActive
                                                ? 'text-primary-foreground'
                                                : 'text-muted-foreground group-hover:text-foreground'
                                        )}
                                    />
                                    <span>{tab.title}</span>
                                    <span
                                        className={cn(
                                            'flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-xs font-mono font-bold leading-none',
                                            isActive
                                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                                : tab.badgeClass
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Filter Toolbar for Active Page */}
                    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-2xs md:flex-row md:items-center md:justify-between">
                        {/* Live Search Input */}
                        <div className="relative max-w-sm flex-1">
                            <Search
                                className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${
                                    isRtl ? 'right-2.5' : 'left-2.5'
                                }`}
                            />
                            <Input
                                type="text"
                                placeholder={t('crm.search_placeholder')}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className={`h-9 text-xs ${isRtl ? 'pr-9 pl-8' : 'pr-8 pl-9'}`}
                                autoComplete="off"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        setCurrentPage(1);
                                    }}
                                    className={`absolute top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
                                        isRtl ? 'left-2.5' : 'right-2.5'
                                    }`}
                                    title={t('common.clear')}
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Stage Filter on 'All' Tab */}
                            {activeTab === 'all' && (
                                <Select
                                    value={selectedStage}
                                    onValueChange={(val) => {
                                        setSelectedStage(val);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[135px] text-xs">
                                        <SelectValue
                                            placeholder={t('crm.stage')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('crm.all_stages')}
                                        </SelectItem>
                                        {statuses.map((s) => (
                                            <SelectItem
                                                key={s.value}
                                                value={s.value}
                                            >
                                                {isRtl ? s.label_ar : s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Sub-Stage Filter on 'In Progress' Tab */}
                            {activeTab === 'in_progress' && (
                                <Select
                                    value={selectedInProgressStage}
                                    onValueChange={(val) => {
                                        setSelectedInProgressStage(val);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-[150px] text-xs">
                                        <SelectValue
                                            placeholder={t('crm.stage')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t(
                                                'crm.all_in_progress',
                                                'All Active Stages'
                                            )}
                                        </SelectItem>
                                        {statuses
                                            .filter((s) =>
                                                [
                                                    'contacted',
                                                    'qualified',
                                                    'proposal_sent',
                                                    'negotiation',
                                                ].includes(s.value)
                                            )
                                            .map((s) => (
                                                <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                >
                                                    {isRtl
                                                        ? s.label_ar
                                                        : s.label}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Channel Filter */}
                            <Select
                                value={selectedChannel || 'all'}
                                onValueChange={(val) => {
                                    setSelectedChannel(
                                        val === 'all' ? '' : val
                                    );
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 w-[145px] text-xs">
                                    <SelectValue
                                        placeholder={t('crm.channel')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('crm.all_channels', 'All Channels')}
                                    </SelectItem>
                                    <SelectItem value="meta">
                                        {isRtl
                                            ? 'ميتا (فيسبوك، انستغرام)'
                                            : 'Meta (FB / IG)'}
                                    </SelectItem>
                                    <SelectItem value="tiktok">
                                        TikTok
                                    </SelectItem>
                                    <SelectItem value="snapchat">
                                        Snapchat
                                    </SelectItem>
                                    <SelectItem value="linkedin">
                                        LinkedIn
                                    </SelectItem>
                                    <SelectItem value="google">
                                        Google Ads
                                    </SelectItem>
                                    <SelectItem value="other">
                                        {t(
                                            'crm.other_channels',
                                            'Other Sources'
                                        )}
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Priority Filter */}
                            <Select
                                value={selectedPriority}
                                onValueChange={(val) => {
                                    setSelectedPriority(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 w-[130px] text-xs">
                                    <SelectValue
                                        placeholder={t('crm.priority')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('crm.all_priorities')}
                                    </SelectItem>
                                    {priorities.map((p) => (
                                        <SelectItem
                                            key={p.value}
                                            value={p.value}
                                        >
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
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 w-[140px] text-xs">
                                    <SelectValue
                                        placeholder={t('crm.assignee')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('crm.all_reps')}
                                    </SelectItem>
                                    <SelectItem value="unassigned">
                                        {t('common.unassigned')}
                                    </SelectItem>
                                    {teamMembers.map((m) => (
                                        <SelectItem
                                            key={m.id}
                                            value={String(m.id)}
                                        >
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
                                    className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X className="size-3.5" />
                                    {t('common.reset')}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Active Sub-Page Main View */}
                    <div className="flex-1">
                        {activeTab === 'kanban' ? (
                            <CrmKanban
                                pipeline={filteredPipeline}
                                onSelectLead={(lead) => setActiveLead(lead)}
                            />
                        ) : (
                            <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                                <CrmTable
                                    leads={paginatedLeads}
                                    onSelectLead={(lead) => setActiveLead(lead)}
                                    emptyTitle={emptyMessage.title}
                                    emptySubtitle={emptyMessage.subtitle}
                                />
                                <CrmPagination
                                    currentPage={safeCurrentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    pageSize={pageSize}
                                    from={paginationFrom}
                                    to={paginationTo}
                                    onPageChange={setCurrentPage}
                                    onPageSizeChange={(newSize) => {
                                        setPageSize(newSize);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        )}
                    </div>
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
