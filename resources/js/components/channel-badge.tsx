import React from 'react';
import { Globe, MessageCircle, Phone, Share2, FileText, Megaphone } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { Lead } from '@/types/crm';

export interface ChannelBadgeProps {
    lead?: Lead;
    channelKey?: string;
    showLabel?: boolean;
    showCampaign?: boolean;
    size?: 'sm' | 'md';
}

function MetaIcon({ className = 'size-3.5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 16.2c-2.4 0-4.3-1.6-5.5-3.8-1.1-2-1.6-4.4-1.6-6.6 0-.7.1-1.4.3-2 .3-.9 1-1.5 2-1.5 1.5 0 2.6 1.4 3.4 3.2.5 1.2 1 2.5 1.4 3.8.4-1.3.9-2.6 1.4-3.8.8-1.8 1.9-3.2 3.4-3.2 1 0 1.7.6 2 1.5.2.6.3 1.3.3 2 0 2.2-.5 4.6-1.6 6.6-1.2 2.2-3.1 3.8-5.5 3.8zm0-2.3c1.7 0 3-1.2 3.9-2.9.8-1.5 1.2-3.3 1.2-4.8 0-.3 0-.6-.1-.8-.1-.3-.3-.4-.5-.4-.7 0-1.4 1-2.1 2.5-.5 1.1-1 2.3-1.4 3.5-.3.8-.7 1.7-1 2.9zm0-10.7c-1.3 0-2.4 1-3.2 2.7-.4 1-.9 2.2-1.3 3.3-.3.8-.6 1.7-1 2.9 1 .7 2.1 1.1 3.3 1.1.2 0 .4 0 .6-.1.4-1.2.7-2.1 1-2.9.4-1.1.9-2.3 1.3-3.3-.3-.4-.5-.7-.7-.7z" />
        </svg>
    );
}

function TikTokIcon({ className = 'size-3.5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
    );
}

function SnapchatIcon({ className = 'size-3.5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.001 2c-3.866 0-6.997 2.676-6.997 6.425 0 .604.103 1.25.132 1.408-.07.03-.23.104-.492.233-.553.272-1.32.784-1.32 1.579 0 .61.474 1.05.996 1.23.12.04.22.06.31.08-.03.22-.05.47-.05.74 0 1.03.41 2.01 1.16 2.82-.44.25-.97.5-1.57.77-.38.17-.67.3-.67.57 0 .42.78.74 1.77.94.49.1.98.15 1.45.17.43.34.88.6 1.34.8.53.23 1.08.35 1.63.35.63 0 1.26-.14 1.83-.41.45-.21.89-.48 1.3-.82.47-.02.96-.07 1.45-.17.99-.2 1.77-.52 1.77-.94 0-.27-.29-.4-.67-.57-.6-.27-1.13-.52-1.57-.77.75-.81 1.16-1.79 1.16-2.82 0-.27-.02-.52-.05-.74.09-.02.19-.04.31-.08.522-.18.996-.62.996-1.23 0-.795-.767-1.307-1.32-1.579-.262-.129-.422-.203-.492-.233.029-.158.132-.804.132-1.408C18.998 4.676 15.867 2 12.001 2z" />
        </svg>
    );
}

function LinkedInIcon({ className = 'size-3.5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
    );
}

function GoogleIcon({ className = 'size-3.5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
    );
}

export function ChannelBadge({
    lead,
    channelKey,
    showLabel = true,
    showCampaign = false,
    size = 'sm',
}: ChannelBadgeProps) {
    const { isRtl } = useTranslation();
    const key = channelKey || lead?.channel || 'website';

    const iconSize = size === 'sm' ? 'size-3 shrink-0' : 'size-3.5 shrink-0';
    const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

    let icon: React.ReactNode = <Globe className={iconSize} />;
    let badgeClass =
        'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    let labelEn = 'Website Form';
    let labelAr = 'نموذج الموقع';

    // Check specific sub-platform for Meta if lead info exists
    const rawAttribution = (
        lead?.utm_source ||
        lead?.source ||
        lead?.referrer ||
        ''
    ).toLowerCase();

    switch (key) {
        case 'meta':
        case 'facebook':
        case 'instagram':
        case 'messenger':
            icon = <MetaIcon className={iconSize} />;
            badgeClass =
                'bg-blue-600/10 text-[#0081FB] dark:text-blue-400 border-blue-500/20';
            if (
                rawAttribution.includes('instagram') ||
                rawAttribution.includes('ig') ||
                key === 'instagram'
            ) {
                labelEn = 'Meta · Instagram';
                labelAr = 'ميتا · انستغرام';
            } else if (
                rawAttribution.includes('messenger') ||
                key === 'messenger'
            ) {
                labelEn = 'Meta · Messenger';
                labelAr = 'ميتا · ماسنجر';
            } else if (
                rawAttribution.includes('facebook') ||
                rawAttribution.includes('fb') ||
                key === 'facebook'
            ) {
                labelEn = 'Meta · Facebook';
                labelAr = 'ميتا · فيسبوك';
            } else {
                labelEn = 'Meta';
                labelAr = 'ميتا';
            }
            break;
        case 'tiktok':
            icon = <TikTokIcon className={iconSize} />;
            badgeClass =
                'bg-neutral-900/10 text-neutral-900 dark:bg-white/10 dark:text-white border-neutral-700/20';
            labelEn = 'TikTok';
            labelAr = 'تيك توك';
            break;
        case 'snapchat':
        case 'snapshot':
            icon = <SnapchatIcon className={iconSize} />;
            badgeClass =
                'bg-amber-400/15 text-amber-700 dark:text-yellow-400 border-amber-400/30';
            labelEn = 'Snapchat';
            labelAr = 'سناب شات';
            break;
        case 'linkedin':
            icon = <LinkedInIcon className={iconSize} />;
            badgeClass =
                'bg-sky-600/10 text-[#0A66C2] dark:text-sky-400 border-sky-600/20';
            labelEn = 'LinkedIn';
            labelAr = 'لينكد إن';
            break;
        case 'google':
        case 'google_ads':
            icon = <GoogleIcon className={iconSize} />;
            badgeClass =
                'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
            labelEn = 'Google Ads';
            labelAr = 'إعلانات جوجل';
            break;
        case 'whatsapp':
            icon = <MessageCircle className={iconSize} />;
            badgeClass =
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            labelEn = 'WhatsApp';
            labelAr = 'واتساب';
            break;
        case 'call':
            icon = <Phone className={iconSize} />;
            badgeClass =
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            labelEn = 'Direct Call';
            labelAr = 'مكالمة هاتفية';
            break;
        case 'referral':
            icon = <Share2 className={iconSize} />;
            badgeClass =
                'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            labelEn = 'Referral';
            labelAr = 'توصية';
            break;
        default:
            icon = lead?.form_name ? (
                <FileText className={iconSize} />
            ) : (
                <Globe className={iconSize} />
            );
            badgeClass =
                'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
            labelEn = lead?.form_name || 'Website';
            labelAr = lead?.form_name || 'الموقع';
            break;
    }

    const campaignName = lead?.campaign_name || lead?.utm_campaign;

    return (
        <div className="inline-flex flex-wrap items-center gap-1">
            <span
                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-semibold ${textSize} ${badgeClass}`}
                title={campaignName ? `Campaign: ${campaignName}` : undefined}
            >
                {icon}
                {showLabel && <span>{isRtl ? labelAr : labelEn}</span>}
            </span>

            {showCampaign && campaignName && (
                <span
                    className={`inline-flex items-center gap-1 rounded-md border border-purple-500/25 bg-purple-500/10 px-1.5 py-0.5 font-mono text-purple-700 dark:text-purple-300 font-semibold ${textSize}`}
                    title={`Campaign: ${campaignName}`}
                >
                    <Megaphone className={iconSize} />
                    <span className="max-w-[130px] truncate">{campaignName}</span>
                </span>
            )}
        </div>
    );
}
