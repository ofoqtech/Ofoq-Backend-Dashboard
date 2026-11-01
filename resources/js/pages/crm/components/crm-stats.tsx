import { CheckCircle2, Clock, Inbox, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import type { CrmAnalytics } from '@/types/crm';

interface CrmStatsProps {
    analytics: CrmAnalytics;
}

export function CrmStats({ analytics }: CrmStatsProps) {
    const { t } = useTranslation();

    const stats = [
        {
            title: t('crm.total_inquiries'),
            value: analytics.total_leads,
            subtitle: t('crm.all_time_requests'),
            icon: Inbox,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        },
        {
            title: t('crm.new_uncontacted'),
            value: analytics.new_leads,
            subtitle: t('crm.awaiting_first_response'),
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10 dark:bg-amber-500/20',
            highlight: analytics.new_leads > 0,
        },
        {
            title: t('crm.in_progress'),
            value: analytics.in_progress,
            subtitle: t('crm.under_discussion'),
            icon: Users,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        },
        {
            title: t('crm.won_deals'),
            value: analytics.won,
            subtitle: t('crm.successfully_converted'),
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        },
        {
            title: t('crm.conversion_rate'),
            value: `${analytics.conversion_rate}%`,
            subtitle: `${analytics.won} ${t('crm.won_of_total')} ${analytics.total_leads}`,
            icon: TrendingUp,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10 dark:bg-violet-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
                <Card
                    key={stat.title}
                    className={`relative overflow-hidden border transition-all duration-200 hover:shadow-sm ${
                        stat.highlight
                            ? 'border-amber-400/50 bg-amber-500/[0.03]'
                            : ''
                    }`}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                {stat.title}
                            </span>
                            <div
                                className={`flex size-8 items-center justify-center rounded-lg ${stat.bg}`}
                            >
                                <stat.icon className={`size-4 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold tracking-tight">
                                {stat.value}
                            </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            {stat.subtitle}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
