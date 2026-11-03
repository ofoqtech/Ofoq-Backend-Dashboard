import React, { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    BellOff,
    BellRing,
    Check,
    Volume2,
    VolumeX,
    ExternalLink,
    Trash2,
    Clock,
    User,
    UserCheck,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';
import {
    getNotificationPermission,
    requestNotificationPermission,
    showLeadNotification,
    playNotificationChime,
    type RealtimeLead,
} from '@/lib/notifications';
import { ChannelBadge } from '@/components/channel-badge';

const STORAGE_KEY_HISTORY = 'ofoq_notifications_history';
const STORAGE_KEY_SOUND = 'ofoq_sound_enabled';

export function NotificationBell() {
    const { isRtl, t } = useTranslation();
    const { url } = usePage();

    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true;
        const saved = localStorage.getItem(STORAGE_KEY_SOUND);
        return saved !== null ? saved === 'true' : true;
    });

    const [permission, setPermission] = useState<
        NotificationPermission | 'unsupported'
    >('default');
    const [history, setHistory] = useState<RealtimeLead[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [unreadCount, setUnreadCount] = useState<number>(0);
    const lastLeadIdRef = useRef<number | null>(null);
    const lastActivityIdRef = useRef<number | null>(null);
    const isInitialMount = useRef(true);

    // Synchronize permission status on mount
    useEffect(() => {
        setPermission(getNotificationPermission());
    }, []);

    const toggleSound = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !soundEnabled;
        setSoundEnabled(next);
        localStorage.setItem(STORAGE_KEY_SOUND, String(next));
        if (next) {
            playNotificationChime();
        }
    };

    const handleEnablePush = async (e: React.MouseEvent) => {
        e.preventDefault();
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result === 'granted') {
            setSoundEnabled(true);
            localStorage.setItem(STORAGE_KEY_SOUND, 'true');
        }
    };

    const handleClearHistory = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setHistory([]);
        setUnreadCount(0);
        localStorage.removeItem(STORAGE_KEY_HISTORY);
    };

    const handleOpenDropdown = (open: boolean) => {
        if (open) {
            setUnreadCount(0);
        }
    };

    const handleSelectLead = (leadId: number) => {
        window.location.href = `/crm?selected=${leadId}`;
    };

    // Background Realtime Lead Poller (every 4.5 seconds)
    useEffect(() => {
        let isMounted = true;

        const checkNewLeads = async () => {
            try {
                const params = new URLSearchParams();
                if (lastLeadIdRef.current !== null) {
                    params.set('last_id', String(lastLeadIdRef.current));
                }
                if (lastActivityIdRef.current !== null) {
                    params.set(
                        'last_activity_id',
                        String(lastActivityIdRef.current),
                    );
                }
                const queryString = params.toString()
                    ? `?${params.toString()}`
                    : '';
                const response = await fetch(
                    `/crm/realtime-check${queryString}`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!response.ok) return;

                const data: {
                    latest_id: number;
                    latest_activity_id?: number;
                    new_leads: RealtimeLead[];
                    recent_history?: RealtimeLead[];
                } = await response.json();

                if (!isMounted) return;

                // First load: initialize watermark and load recent history if local history is empty
                if (isInitialMount.current) {
                    lastLeadIdRef.current = data.latest_id;
                    lastActivityIdRef.current = data.latest_activity_id ?? null;
                    isInitialMount.current = false;

                    if (data.recent_history && data.recent_history.length > 0) {
                        setHistory((prev) => {
                            // Merge and keep sorted newest to oldest
                            const existingIds = new Set(
                                prev.map((item) => item.id),
                            );
                            const additions = data.recent_history!.filter(
                                (item) => !existingIds.has(item.id),
                            );
                            const merged = [...prev, ...additions]
                                .sort((a, b) => b.id - a.id)
                                .slice(0, 30);
                            localStorage.setItem(
                                STORAGE_KEY_HISTORY,
                                JSON.stringify(merged),
                            );
                            return merged;
                        });
                    }
                    return;
                }

                // If new leads arrived since last poll
                if (data.new_leads && data.new_leads.length > 0) {
                    lastLeadIdRef.current = data.latest_id;
                    if (data.latest_activity_id !== undefined) {
                        lastActivityIdRef.current = data.latest_activity_id;
                    }

                    // 1. Play chime sound and trigger push/toast notification
                    data.new_leads.forEach((lead) => {
                        showLeadNotification(lead, {
                            soundEnabled,
                            isRtl,
                            onSelect: (leadId) => {
                                handleSelectLead(leadId);
                            },
                        });
                    });

                    // 2. Add new leads to the top of the history (newest to oldest)
                    setHistory((prev) => {
                        const newIds = new Set(data.new_leads.map((n) => n.id));
                        const filteredOld = prev.filter(
                            (item) => !newIds.has(item.id),
                        );
                        const updated = [...data.new_leads, ...filteredOld]
                            .sort((a, b) => b.id - a.id)
                            .slice(0, 30);
                        localStorage.setItem(
                            STORAGE_KEY_HISTORY,
                            JSON.stringify(updated),
                        );
                        return updated;
                    });

                    setUnreadCount((prev) => prev + data.new_leads.length);

                    // 3. Live refresh the Kanban board if on /crm
                    if (window.location.pathname.startsWith('/crm')) {
                        router.reload({
                            only: ['leads', 'pipeline', 'analytics'],
                        });
                    }
                } else {
                    if (data.latest_id > (lastLeadIdRef.current || 0)) {
                        lastLeadIdRef.current = data.latest_id;
                    }
                    if (
                        data.latest_activity_id !== undefined &&
                        data.latest_activity_id >
                            (lastActivityIdRef.current || 0)
                    ) {
                        lastActivityIdRef.current = data.latest_activity_id;
                    }
                }
            } catch {
                // Quiet retry on next tick
            }
        };

        // Initial check immediately
        checkNewLeads();

        // Polling every 4500ms
        const interval = setInterval(checkNewLeads, 4500);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [soundEnabled, isRtl, url]);

    const isPushGranted = permission === 'granted';
    const isPushDenied = permission === 'denied';

    return (
        <DropdownMenu onOpenChange={handleOpenDropdown}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative size-8 p-0 text-muted-foreground hover:text-foreground"
                    title={
                        isPushGranted && soundEnabled
                            ? isRtl
                                ? 'التنبيهات اللحظية والصوتية مفعلة'
                                : 'Real-time Sound & Alerts Active'
                            : isRtl
                              ? 'الإشعارات وسجل الطلبات'
                              : 'Notifications & Inquiry History'
                    }
                >
                    {soundEnabled ? (
                        <Bell className="size-4 text-primary" />
                    ) : (
                        <BellOff className="size-4 text-muted-foreground" />
                    )}

                    {/* Unread count badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 animate-bounce items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white shadow-xs">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}

                    {/* Live green dot when no unread but sound active */}
                    {unreadCount === 0 && isPushGranted && soundEnabled && (
                        <span className="absolute top-1 right-1 flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                    )}

                    {!soundEnabled && unreadCount === 0 && (
                        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-amber-500" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={isRtl ? 'start' : 'end'}
                className="w-80 overflow-hidden rounded-xl border-border/80 p-0 text-xs shadow-xl sm:w-96"
            >
                {/* Header with Title, Sound Toggle & Clear */}
                <div className="flex items-center justify-between border-b bg-muted/40 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                            <BellRing className="size-4 text-primary" />
                            {isRtl ? 'الإشعارات' : 'Notifications'}
                        </span>
                        {history.length > 0 && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                {history.length}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Sound Toggle Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSound}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title={
                                soundEnabled
                                    ? isRtl
                                        ? 'كتم نغمة الصوت'
                                        : 'Mute Chime Sound'
                                    : isRtl
                                      ? 'تشغيل نغمة الصوت'
                                      : 'Enable Chime Sound'
                            }
                        >
                            {soundEnabled ? (
                                <Volume2 className="size-3.5 text-emerald-500" />
                            ) : (
                                <VolumeX className="size-3.5 text-muted-foreground" />
                            )}
                        </Button>

                        {/* Clear History Button */}
                        {history.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClearHistory}
                                className="size-7 text-muted-foreground hover:text-destructive"
                                title={
                                    isRtl
                                        ? 'مسح سجل الإشعارات'
                                        : 'Clear notification history'
                                }
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Browser Push Permission Banner (if not granted yet) */}
                {!isPushGranted && !isPushDenied && (
                    <div className="flex items-center justify-between gap-2 border-b bg-primary/5 px-3.5 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                            <BellRing className="size-3.5 shrink-0 text-primary" />
                            <span>
                                {isRtl
                                    ? 'تفعيل إشعارات المتصفح والموبايل'
                                    : 'Enable Mobile & Browser Push'}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={handleEnablePush}
                            className="h-6 px-2 text-[10px] font-semibold shadow-none"
                        >
                            {isRtl ? 'تفعيل الآن' : 'Enable'}
                        </Button>
                    </div>
                )}

                {/* Notifications History List (Newest to Oldest) */}
                <div className="max-h-80 divide-y divide-border/40 overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-8 text-center text-muted-foreground">
                            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted/60">
                                <Bell className="size-5 text-muted-foreground/60" />
                            </div>
                            <p className="text-xs font-medium text-foreground">
                                {isRtl
                                    ? 'لا توجد إشعارات سابقة'
                                    : 'No notifications yet'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {isRtl
                                    ? 'ستظهر هنا جميع طلبات واستفسارات العملاء الجديدة فور وصولها'
                                    : 'New incoming client inquiries will appear here instantly'}
                            </p>
                        </div>
                    ) : (
                        history.map((lead) => {
                            const platform = isRtl
                                ? lead.channel_label_ar ||
                                  lead.channel ||
                                  'الموقع'
                                : lead.channel_label ||
                                  lead.channel ||
                                  'Website';

                            return (
                                <div
                                    key={lead.id}
                                    onClick={() => handleSelectLead(lead.id)}
                                    className="group flex cursor-pointer flex-col gap-1 p-3 transition-colors hover:bg-muted/60 active:bg-muted"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-1.5">
                                            <span className="truncate text-xs font-semibold text-foreground">
                                                {lead.name}
                                            </span>
                                            {lead.company && (
                                                <span className="hidden truncate text-[11px] text-muted-foreground sm:inline">
                                                    · {lead.company}
                                                </span>
                                            )}
                                        </div>

                                        {lead.notification_type ===
                                            'assigned' || lead.is_assignment ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                                <UserCheck className="size-2.5" />
                                                {isRtl
                                                    ? 'تكليف جديد'
                                                    : 'Assigned'}
                                            </span>
                                        ) : (
                                            <ChannelBadge
                                                channelKey={lead.channel}
                                                size="sm"
                                            />
                                        )}
                                    </div>

                                    <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span className="max-w-[200px] truncate">
                                            {lead.service_name_snapshot ||
                                                (isRtl
                                                    ? 'استفسار عام'
                                                    : 'General Inquiry')}
                                        </span>

                                        <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-muted-foreground/80">
                                            <Clock className="size-2.5" />
                                            {lead.created_at ||
                                                (isRtl ? 'الآن' : 'Just now')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Link to Notifications History Page */}
                <div className="border-t bg-muted/30 p-2 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-full justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary"
                        asChild
                    >
                        <Link href="/notifications">
                            <span>
                                {isRtl
                                    ? 'عرض سجل الإشعارات بالكامل ➔'
                                    : 'View Full Notification History ➔'}
                            </span>
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
