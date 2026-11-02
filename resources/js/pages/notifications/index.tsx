import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    BellOff,
    BellRing,
    Building2,
    Calendar,
    Clock,
    ExternalLink,
    Filter,
    Inbox,
    MessageCircle,
    Phone,
    Search,
    Sparkles,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { ChannelBadge } from '@/components/channel-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import {
    getNotificationPermission,
    requestNotificationPermission,
    playNotificationChime,
} from '@/lib/notifications';
import { dashboard } from '@/routes';
import type { PaginatedData } from '@/types';
import type { Lead } from '@/types/crm';

interface NotificationsIndexProps {
    notifications: PaginatedData<Lead>;
    filters: {
        search: string;
        channel: string;
        status: string;
    };
    stats: {
        total_alerts: number;
        today_alerts: number;
        new_uncontacted: number;
    };
}

export default function NotificationsIndex({
    notifications,
    filters,
    stats,
}: NotificationsIndexProps) {
    const { t, isRtl } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const [selectedChannel, setSelectedChannel] = useState(filters.channel || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true;
        const saved = localStorage.getItem('ofoq_sound_enabled');
        return saved !== null ? saved === 'true' : true;
    });

    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

    useEffect(() => {
        setPermission(getNotificationPermission());
    }, []);

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        localStorage.setItem('ofoq_sound_enabled', String(next));
        if (next) {
            playNotificationChime();
        }
    };

    const handleEnablePush = async () => {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result === 'granted') {
            setSoundEnabled(true);
            localStorage.setItem('ofoq_sound_enabled', 'true');
        }
    };

    const handleApplyFilters = (newFilters: {
        search?: string;
        channel?: string;
        status?: string;
    }) => {
        const queryParams: Record<string, string> = {};

        const effectiveSearch = newFilters.search !== undefined ? newFilters.search : search;
        const effectiveChannel = newFilters.channel !== undefined ? newFilters.channel : selectedChannel;
        const effectiveStatus = newFilters.status !== undefined ? newFilters.status : selectedStatus;

        if (effectiveSearch) queryParams.search = effectiveSearch;
        if (effectiveChannel && effectiveChannel !== 'all') queryParams.channel = effectiveChannel;
        if (effectiveStatus && effectiveStatus !== 'all') queryParams.status = effectiveStatus;

        router.get('/notifications', queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Live search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim() !== (filters.search || '').trim()) {
                handleApplyFilters({ search });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleResetFilters = () => {
        setSearch('');
        setSelectedChannel('all');
        setSelectedStatus('all');
        router.get(
            '/notifications',
            {},
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const hasActiveFilters =
        search !== '' ||
        selectedChannel !== 'all' ||
        selectedStatus !== 'all';

    const isPushGranted = permission === 'granted';

    return (
        <>
            <Head title={t('notifications.page_title')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                <BellRing className="size-6 text-primary" />
                                {t('notifications.page_title')}
                            </h1>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                {stats.total_alerts}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
                            {t('notifications.page_subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Sound Toggle Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleSound}
                            className="h-8 gap-1.5 text-xs font-medium"
                            title={soundEnabled ? t('notifications.mute_sound') : t('notifications.unmute_sound')}
                        >
                            {soundEnabled ? (
                                <>
                                    <Volume2 className="size-3.5 text-emerald-500" />
                                    <span>{t('notifications.sound_status')}: {t('notifications.enabled')}</span>
                                </>
                            ) : (
                                <>
                                    <VolumeX className="size-3.5 text-muted-foreground" />
                                    <span>{t('notifications.sound_status')}: {t('notifications.disabled')}</span>
                                </>
                            )}
                        </Button>

                        {/* Push Permission Button (if not granted) */}
                        {!isPushGranted && (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={handleEnablePush}
                                className="h-8 gap-1.5 text-xs font-semibold"
                            >
                                <Bell className="size-3.5" />
                                {t('notifications.enable_push')}
                            </Button>
                        )}

                        {/* Quick Jump to CRM Pipeline */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs font-medium"
                            asChild
                        >
                            <Link href="/crm">
                                <Inbox className="size-3.5 text-primary" />
                                <span>{t('crm.title')}</span>
                                <ExternalLink className="size-3 opacity-60" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Card className="border bg-card/70 shadow-2xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                {t('notifications.total_alerts')}
                            </CardTitle>
                            <Bell className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-foreground">
                                {stats.total_alerts}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {isRtl ? 'إجمالي الطلبات الواردة' : 'All-time inquiries logged'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border bg-card/70 shadow-2xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                {t('notifications.today_alerts')}
                            </CardTitle>
                            <Sparkles className="size-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                                {stats.today_alerts}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {isRtl ? 'طلبات تم استلامها اليوم' : 'Inquiries received today'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border bg-card/70 shadow-2xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                {t('notifications.new_uncontacted')}
                            </CardTitle>
                            <Clock className="size-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                                {stats.new_uncontacted}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {isRtl ? 'في انتظار أول رد وتواصل' : 'Awaiting first contact'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Toolbar */}
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
                            placeholder={t('notifications.filter_search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`h-9 text-xs ${isRtl ? 'pr-9 pl-8' : 'pr-8 pl-9'}`}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className={`absolute top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground ${
                                    isRtl ? 'left-2.5' : 'right-2.5'
                                }`}
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Channel Filter */}
                        <Select
                            value={selectedChannel}
                            onValueChange={(val) => {
                                setSelectedChannel(val);
                                handleApplyFilters({ channel: val });
                            }}
                        >
                            <SelectTrigger className="h-9 w-[150px] text-xs">
                                <SelectValue placeholder={t('crm.channel')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t('notifications.all_channels')}
                                </SelectItem>
                                <SelectItem value="meta">
                                    {isRtl ? 'ميتا (فيسبوك، انستغرام)' : 'Meta (FB / IG)'}
                                </SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="snapchat">Snapchat</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="google">Google Ads</SelectItem>
                                <SelectItem value="other">
                                    {t('crm.other_channels')}
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
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
                                <SelectItem value="all">
                                    {t('notifications.all_statuses')}
                                </SelectItem>
                                <SelectItem value="new">{t('crm.stage_new')}</SelectItem>
                                <SelectItem value="contacted">{t('crm.stage_contacted')}</SelectItem>
                                <SelectItem value="qualified">{t('crm.stage_qualified')}</SelectItem>
                                <SelectItem value="proposal_sent">{t('crm.stage_proposal_sent')}</SelectItem>
                                <SelectItem value="negotiation">{t('crm.stage_negotiation')}</SelectItem>
                                <SelectItem value="won">{t('crm.stage_won')}</SelectItem>
                                <SelectItem value="lost">{t('crm.stage_lost')}</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3.5" />
                                {t('common.reset')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications History Feed (Newest to Oldest) */}
                <div className="space-y-3">
                    {notifications.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                                <Bell className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-foreground">
                                {t('notifications.no_alerts_found')}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                                {isRtl
                                    ? 'جرب إعادة ضبط الفلاتر أو البحث للوصول إلى طلبات سابقة.'
                                    : 'Try resetting your search or channel filter to view past records.'}
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="mt-4 text-xs"
                                >
                                    {t('common.reset')}
                                </Button>
                            )}
                        </div>
                    ) : (
                        notifications.data.map((lead: Lead) => {
                            const platformLabel = isRtl
                                ? (lead.channel_label_ar || lead.channel || 'الموقع')
                                : (lead.channel_label || lead.channel || 'Website');

                            return (
                                <Card
                                    key={lead.id}
                                    className="border transition-all duration-200 hover:border-primary/50 hover:shadow-xs bg-card"
                                >
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            {/* Client & Inquiry Core Info */}
                                            <div className="space-y-1.5 min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <ChannelBadge channelKey={lead.channel} size="sm" />

                                                    {lead.utm_campaign && (
                                                        <Badge variant="outline" className="font-mono text-[10px] text-primary">
                                                            📢 {lead.utm_campaign}
                                                        </Badge>
                                                    )}

                                                    {lead.form_name && (
                                                        <span className="text-[11px] text-muted-foreground font-mono">
                                                            📝 {lead.form_name}
                                                        </span>
                                                    )}

                                                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {new Date(lead.created_at).toLocaleString(
                                                            isRtl ? 'ar-EG' : 'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 pt-0.5">
                                                    <h3 className="text-base font-bold text-foreground">
                                                        {lead.name}
                                                    </h3>
                                                    {lead.company && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Building2 className="size-3" />
                                                            {lead.company}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-muted-foreground">
                                                    {isRtl ? 'الخدمة المطلوبة: ' : 'Service: '}
                                                    <span className="font-medium text-foreground">
                                                        {lead.service_name_snapshot || (isRtl ? 'استفسار عام' : 'General Inquiry')}
                                                    </span>
                                                </p>

                                                {lead.internal_notes && (
                                                    <p className="text-xs bg-muted/40 p-2.5 rounded-lg text-muted-foreground mt-2 border border-border/50">
                                                        {lead.internal_notes}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Buttons & Status */}
                                            <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                                                <div className="flex items-center gap-1.5">
                                                    {/* WhatsApp Button */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                                        asChild
                                                    >
                                                        <a
                                                            href={lead.whatsapp_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <MessageCircle className="size-3.5" />
                                                            WhatsApp
                                                        </a>
                                                    </Button>

                                                    {/* Phone Call */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 gap-1.5 text-xs"
                                                        asChild
                                                    >
                                                        <a href={`tel:${lead.phone}`}>
                                                            <Phone className="size-3.5" />
                                                            {lead.phone}
                                                        </a>
                                                    </Button>
                                                </div>

                                                {/* Open in CRM */}
                                                <Button
                                                    size="sm"
                                                    className="h-8 gap-1.5 text-xs font-semibold w-full sm:w-auto"
                                                    asChild
                                                >
                                                    <Link href={`/crm?selected=${lead.id}`}>
                                                        <span>{t('notifications.open_in_crm')}</span>
                                                        <ExternalLink className="size-3" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <span className="text-xs text-muted-foreground">
                            {isRtl ? 'عرض ' : 'Showing '}
                            <span className="font-semibold text-foreground">{notifications.from}</span>
                            {isRtl ? ' إلى ' : ' to '}
                            <span className="font-semibold text-foreground">{notifications.to}</span>
                            {isRtl ? ' من إجمالي ' : ' of '}
                            <span className="font-semibold text-foreground">{notifications.total}</span>
                        </span>

                        <div className="flex items-center gap-1">
                            {notifications.links.map((link: { url: string | null; label: string; active: boolean }, idx: number) => (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8 min-w-8 text-xs px-2.5"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Notifications',
            href: '/notifications',
        },
    ],
};
