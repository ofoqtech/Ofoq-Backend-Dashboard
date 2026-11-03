import {
    Building2,
    Calendar,
    ChevronRight,
    ExternalLink,
    Mail,
    MessageCircle,
    Phone,
    User as UserIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import type { Lead } from '@/types/crm';
import { ChannelBadge } from './channel-badge';

interface CrmTableProps {
    leads: Lead[];
    onSelectLead: (lead: Lead) => void;
    emptyTitle?: string;
    emptySubtitle?: string;
}

export function CrmTable({
    leads,
    onSelectLead,
    emptyTitle,
    emptySubtitle,
}: CrmTableProps) {
    const { t, isRtl, localized, formatDate } = useTranslation();

    const getStatusLabel = (lead: Lead) => {
        return t(`stage.${lead.status}`, lead.status_label);
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

    if (leads.length === 0) {
        return (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-card/30">
                <p className="text-sm font-semibold text-foreground">
                    {emptyTitle || t('crm.no_leads_found')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {emptySubtitle || t('crm.no_leads_hint')}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                    <thead className="border-b bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        <tr>
                            <th className="px-4 py-3 text-start">
                                {t('crm.client_company')}
                            </th>
                            <th className="px-4 py-3 text-start">
                                {t('crm.contact')}
                            </th>
                            <th className="px-4 py-3 text-start">
                                {t('crm.service_requested')}
                            </th>
                            <th className="px-4 py-3 text-start">
                                {t('crm.channel')}
                            </th>
                            <th className="px-4 py-3 text-start">
                                {t('crm.stage')}
                            </th>
                            <th className="px-4 py-3 text-start">
                                {t('crm.priority')}
                            </th>
                            <th className="px-4 py-3 text-start">
                                {t('crm.assignee')}
                            </th>
                            <th className="px-4 py-3 text-start">
                                {t('crm.submitted')}
                            </th>
                            <th className="px-4 py-3 text-end">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                onClick={() => onSelectLead(lead)}
                                className="group cursor-pointer transition-colors hover:bg-muted/50"
                            >
                                <td className="px-4 py-3 text-start">
                                    <div className="font-semibold text-foreground transition-colors group-hover:text-primary">
                                        {lead.name}
                                    </div>
                                    {lead.company && (
                                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                            <Building2 className="size-3 shrink-0" />
                                            {lead.company}
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3 text-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm text-foreground">
                                            {lead.phone}
                                        </span>
                                        <div
                                            className="flex items-center gap-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <a
                                                href={lead.whatsapp_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={t('crm.chat_whatsapp')}
                                                className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white"
                                            >
                                                <MessageCircle className="size-3.5" />
                                            </a>
                                            <a
                                                href={`tel:${lead.phone}`}
                                                title={t('crm.call')}
                                                className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                                            >
                                                <Phone className="size-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                    {lead.email && (
                                        <div className="mt-0.5 max-w-[180px] truncate text-xs text-muted-foreground">
                                            {lead.email}
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3 text-start">
                                    <div className="max-w-[200px] truncate text-sm font-medium text-foreground">
                                        {getServiceLabel(lead)}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-start whitespace-nowrap">
                                    <div className="flex flex-col gap-0.5 items-start">
                                        <ChannelBadge lead={lead} size="sm" />
                                        {lead.utm_campaign && (
                                            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[130px]" title={lead.utm_campaign}>
                                                {lead.utm_campaign}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-start whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${lead.status_color}`}
                                    >
                                        {getStatusLabel(lead)}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-start whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${lead.priority_color}`}
                                    >
                                        {getPriorityLabel(lead)}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-start whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        {lead.assignee?.avatar ? (
                                            <img
                                                src={lead.assignee.avatar}
                                                alt={lead.assignee.name}
                                                className="size-4 rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <UserIcon className="size-3.5 shrink-0" />
                                        )}
                                        <span>
                                            {lead.assignee?.name ??
                                                t('common.unassigned')}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-start text-sm whitespace-nowrap text-muted-foreground">
                                    {formatDate(lead.created_at)}
                                </td>

                                <td className="px-4 py-3 text-end whitespace-nowrap">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 gap-1 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectLead(lead);
                                        }}
                                    >
                                        {t('common.details')}
                                        <ChevronRight
                                            className={`size-3.5 ${isRtl ? 'rotate-180' : ''}`}
                                        />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
