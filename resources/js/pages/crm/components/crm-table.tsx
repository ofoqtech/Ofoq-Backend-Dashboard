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
import type { Lead } from '@/types/crm';

interface CrmTableProps {
    leads: Lead[];
    onSelectLead: (lead: Lead) => void;
}

export function CrmTable({ leads, onSelectLead }: CrmTableProps) {
    if (leads.length === 0) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm font-medium text-foreground">No leads found</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your filters or search keywords.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Client & Company</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Service & Budget</th>
                            <th className="px-4 py-3">Stage</th>
                            <th className="px-4 py-3">Priority</th>
                            <th className="px-4 py-3">Assignee</th>
                            <th className="px-4 py-3">Submitted</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                onClick={() => onSelectLead(lead)}
                                className="group cursor-pointer transition-colors hover:bg-muted/50"
                            >
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {lead.name}
                                    </div>
                                    {lead.company && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <Building2 className="size-3" />
                                            {lead.company}
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs">{lead.phone}</span>
                                        <div
                                            className="flex items-center gap-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <a
                                                href={lead.whatsapp_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="WhatsApp Chat"
                                                className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                            >
                                                <MessageCircle className="size-3.5" />
                                            </a>
                                            <a
                                                href={`tel:${lead.phone}`}
                                                title="Call"
                                                className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
                                            >
                                                <Phone className="size-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                    {lead.email && (
                                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                                            {lead.email}
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="font-medium text-xs text-foreground truncate max-w-[200px]">
                                        {lead.service_name_snapshot || lead.service?.name_en || 'General'}
                                    </div>
                                    {lead.budget_range_snapshot && (
                                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                            {lead.budget_range_snapshot}
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${lead.status_color}`}
                                    >
                                        {lead.status_label}
                                    </span>
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${lead.priority_color}`}
                                    >
                                        {lead.priority_label}
                                    </span>
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <UserIcon className="size-3.5" />
                                        <span>{lead.assignee?.name ?? 'Unassigned'}</span>
                                    </div>
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                                    {new Date(lead.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </td>

                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 gap-1 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectLead(lead);
                                        }}
                                    >
                                        Details
                                        <ChevronRight className="size-3.5" />
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

