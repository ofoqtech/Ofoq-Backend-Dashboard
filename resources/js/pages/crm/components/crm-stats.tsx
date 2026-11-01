import { CheckCircle2, Clock, Inbox, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { CrmAnalytics } from '@/types/crm';

interface CrmStatsProps {
    analytics: CrmAnalytics;
}

export function CrmStats({ analytics }: CrmStatsProps) {
    const stats = [
        {
            title: 'Total Inquiries',
            value: analytics.total_leads,
            subtitle: 'All-time client requests',
            icon: Inbox,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        },
        {
            title: 'New / Uncontacted',
            value: analytics.new_leads,
            subtitle: 'Awaiting first response',
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10 dark:bg-amber-500/20',
            highlight: analytics.new_leads > 0,
        },
        {
            title: 'In Progress',
            value: analytics.in_progress,
            subtitle: 'Under discussion / proposal',
            icon: Users,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        },
        {
            title: 'Won Deals',
            value: analytics.won,
            subtitle: 'Successfully converted',
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        },
        {
            title: 'Conversion Rate',
            value: `${analytics.conversion_rate}%`,
            subtitle: `${analytics.won} won out of ${analytics.total_leads} total`,
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
                        stat.highlight ? 'border-amber-400/50 bg-amber-500/[0.03]' : ''
                    }`}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                            <div className={`flex size-8 items-center justify-center rounded-lg ${stat.bg}`}>
                                <stat.icon className={`size-4 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{stat.subtitle}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

