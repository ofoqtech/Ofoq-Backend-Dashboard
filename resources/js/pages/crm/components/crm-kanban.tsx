import {
    Building2,
    Calendar,
    ChevronRight,
    MessageCircle,
    Phone,
    User as UserIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import type { Lead, PipelineStage } from '@/types/crm';

interface CrmKanbanProps {
    pipeline: Record<string, PipelineStage>;
    onSelectLead: (lead: Lead) => void;
}

export function CrmKanban({ pipeline, onSelectLead }: CrmKanbanProps) {
    const { t, isRtl, localized, formatDate } = useTranslation();
    const stageKeys = Object.keys(pipeline);

    const getStageAccentColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'border-t-blue-500';
            case 'contacted':
                return 'border-t-sky-500';
            case 'qualified':
                return 'border-t-indigo-500';
            case 'proposal_sent':
                return 'border-t-purple-500';
            case 'negotiation':
                return 'border-t-amber-500';
            case 'won':
                return 'border-t-emerald-500';
            case 'lost':
                return 'border-t-rose-500';
            default:
                return 'border-t-muted';
        }
    };

    const getPriorityLabel = (lead: Lead) => {
        return t(`priority.${lead.priority}`, lead.priority_label);
    };

    const getServiceLabel = (lead: Lead) => {
        const localizedName = localized({
            en: lead.service?.name_en || lead.service_name_snapshot,
            ar: lead.service?.name_ar || lead.service_name_snapshot,
        });
        return localizedName || t('common.general');
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
            {stageKeys.map((key) => {
                const stage = pipeline[key];
                const leads = stage.leads;
                const stageTitle = isRtl ? (stage.label_ar || stage.label) : stage.label;

                return (
                    <div
                        key={key}
                        className="flex w-80 shrink-0 flex-col rounded-xl border bg-muted/30 p-3 shadow-2xs"
                    >
                        {/* Column Header */}
                        <div
                            className={`flex items-center justify-between border-t-4 ${getStageAccentColor(
                                stage.status
                            )} -mt-3 -mx-3 px-3 pt-3 pb-2 mb-2 bg-card rounded-t-xl border-b`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm tracking-tight text-foreground">
                                    {stageTitle}
                                </span>
                            </div>
                            <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                                {leads.length}
                            </span>
                        </div>

                        {/* Cards List */}
                        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                            {leads.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                                    {t('crm.no_leads_stage')}
                                </div>
                            ) : (
                                leads.map((lead) => (
                                    <Card
                                        key={lead.id}
                                        onClick={() => onSelectLead(lead)}
                                        className="group cursor-pointer border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                                    >
                                        <CardContent className="p-3.5 space-y-2.5">
                                            {/* Priority & Time */}
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span
                                                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${lead.priority_color}`}
                                                >
                                                    {getPriorityLabel(lead)}
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {formatDate(lead.created_at, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>

                                            {/* Name & Company */}
                                            <div>
                                                <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                    {lead.name}
                                                </h4>
                                                {lead.company && (
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                        <Building2 className="size-3 shrink-0" />
                                                        {lead.company}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Service & Budget pill */}
                                            <div className="rounded-md bg-muted/60 p-2 text-xs space-y-1">
                                                <div className="font-medium text-foreground truncate">
                                                    {getServiceLabel(lead)}
                                                </div>
                                                {lead.budget_range_snapshot && (
                                                    <div className="text-[11px] text-muted-foreground truncate">
                                                        {lead.budget_range_snapshot}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Assignee & Quick Actions */}
                                            <div className="flex items-center justify-between pt-1 border-t text-xs">
                                                <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[140px]">
                                                    <UserIcon className="size-3 shrink-0" />
                                                    <span className="truncate text-[11px]">
                                                        {lead.assignee?.name ?? t('common.unassigned')}
                                                    </span>
                                                </div>

                                                <div
                                                    className="flex items-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <a
                                                        href={lead.whatsapp_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title={t('crm.chat_whatsapp')}
                                                        className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                                    >
                                                        <MessageCircle className="size-3.5" />
                                                    </a>
                                                    <a
                                                        href={`tel:${lead.phone}`}
                                                        title={t('crm.call')}
                                                        className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
                                                    >
                                                        <Phone className="size-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
