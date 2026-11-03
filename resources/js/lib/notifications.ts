import { toast } from 'sonner';

export interface RealtimeLead {
    id: number;
    name: string;
    phone: string;
    company?: string | null;
    channel?: string;
    channel_label?: string;
    channel_label_ar?: string;
    service_name_snapshot?: string | null;
    created_at?: string;
    notification_type?: 'new_lead' | 'assigned';
    assigned_by_name?: string | null;
    is_assignment?: boolean;
}

// Global cached AudioContext to reuse and keep unlocked after user interaction
let cachedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
        if (!cachedAudioCtx) {
            const AudioCtx =
                window.AudioContext ||
                (
                    window as unknown as {
                        webkitAudioContext: typeof AudioContext;
                    }
                ).webkitAudioContext;
            if (AudioCtx) {
                cachedAudioCtx = new AudioCtx();
            }
        }
        if (cachedAudioCtx && cachedAudioCtx.state === 'suspended') {
            cachedAudioCtx.resume().catch(() => {});
        }
        return cachedAudioCtx;
    } catch {
        return null;
    }
}

/**
 * Play a high-fidelity, melodic two-tone notification chime using the Web Audio API.
 * Synthesizes pure crystal tones with zero external file dependencies or latency.
 */
export function playNotificationChime() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // Tone 1: Note A5 (880 Hz) - Crystal bell strike
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Tone 2: Note D6 (1174.66 Hz) - Harmonious high chime
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1174.66, now + 0.1);
        gain2.gain.setValueAtTime(0.3, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.55);

        // Tone 3: Note A6 (1760 Hz) - Shimmering overtone
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1760, now + 0.2);
        gain3.gain.setValueAtTime(0.18, now + 0.2);
        gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.2);
        osc3.stop(now + 0.8);
    } catch (e) {
        console.warn('Notification audio playback prevented by browser:', e);
    }
}

/**
 * Register Service Worker for background and mobile lock-screen push notifications.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });
        return registration;
    } catch (e) {
        console.warn('Service worker registration failed:', e);
        return null;
    }
}

/**
 * Check if the browser supports notifications and get current permission.
 */
export function getNotificationPermission():
    | NotificationPermission
    | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

/**
 * Request native browser notification permission and unlock AudioContext.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'denied';
    }

    // Unlock AudioContext on this user interaction
    getAudioContext();

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        await registerServiceWorker();
    }

    return permission;
}

/**
 * Display an instant alert (Sound + System/Mobile Notification + In-App Toast).
 */
export function showLeadNotification(
    lead: RealtimeLead,
    options: {
        soundEnabled?: boolean;
        isRtl?: boolean;
        onSelect?: (leadId: number) => void;
    } = {},
) {
    const { soundEnabled = true, isRtl = false, onSelect } = options;

    // 1. Play audible alert chime
    if (soundEnabled) {
        playNotificationChime();
    }

    // 2. Trigger mobile phone vibration pattern
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate([250, 100, 250]);
        } catch {
            // Ignored on unsupported devices
        }
    }

    const platformLabel = isRtl
        ? lead.channel_label_ar || lead.channel || 'الموقع'
        : lead.channel_label || lead.channel || 'Website';

    const serviceLabel =
        lead.service_name_snapshot ||
        (isRtl ? 'طلب استفسار جديد' : 'New Client Inquiry');

    const isAssignment =
        lead.notification_type === 'assigned' || !!lead.is_assignment;

    const title = isAssignment
        ? isRtl
            ? `📋 تم تكليفك بطلب عميل: ${lead.name}`
            : `📋 Lead Assigned to You: ${lead.name}`
        : isRtl
          ? `🔔 عميل جديد: ${lead.name}`
          : `🔔 New Lead: ${lead.name}`;

    const body = isAssignment
        ? isRtl
            ? `قام ${lead.assigned_by_name || 'مدير النظام'} بتكليفك بمتابعة هذا العميل (${serviceLabel})`
            : `Assigned to you by ${lead.assigned_by_name || 'Admin'} (${serviceLabel})`
        : `${platformLabel ? `[${platformLabel}] ` : ''}${serviceLabel}${lead.company ? ` · ${lead.company}` : ''} (${lead.phone})`;

    const targetUrl = `/crm?selected=${lead.id}`;

    // 3. Native Operating System & Mobile Notification
    if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
    ) {
        const notificationOptions = {
            body,
            icon: '/logo dark.jpeg',
            badge: '/favicon.svg',
            tag: `lead-${lead.id}`,
            data: { url: targetUrl },
        };

        if (
            'serviceWorker' in navigator &&
            navigator.serviceWorker.controller
        ) {
            navigator.serviceWorker.ready
                .then((reg) => reg.showNotification(title, notificationOptions))
                .catch(() => {
                    const n = new Notification(title, notificationOptions);
                    n.onclick = () => {
                        window.focus();
                        window.location.href = targetUrl;
                    };
                });
        } else {
            try {
                const n = new Notification(title, notificationOptions);
                n.onclick = () => {
                    window.focus();
                    window.location.href = targetUrl;
                };
            } catch {
                // Handled gracefully
            }
        }
    }

    // 4. Interactive In-App Sonner Toast
    toast.success(title, {
        description: body,
        duration: 9000,
        action: {
            label: isRtl ? 'عرض الطلب ➔' : 'View Lead ➔',
            onClick: () => {
                if (onSelect) {
                    onSelect(lead.id);
                } else {
                    window.location.href = targetUrl;
                }
            },
        },
    });
}
