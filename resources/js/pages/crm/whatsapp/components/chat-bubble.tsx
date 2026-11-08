import {
    AlertCircle,
    Check,
    CheckCheck,
    Clock,
    Download,
    FileText,
    MapPin,
    Play,
    Pause,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { WhatsAppMessage } from '@/types/whatsapp';

interface ChatBubbleProps {
    message: WhatsAppMessage;
    isRtl?: boolean;
}

export function ChatBubble({ message, isRtl }: ChatBubbleProps) {
    const isOutgoing = message.direction === 'outgoing';
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
    };

    const formatTime = (dateStr?: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderStatus = () => {
        if (!isOutgoing) return null;

        switch (message.status) {
            case 'pending':
                return <Clock className="size-3 text-neutral-400" />;
            case 'sent':
                return <Check className="size-3.5 text-neutral-400" />;
            case 'delivered':
                return <CheckCheck className="size-3.5 text-neutral-400" />;
            case 'read':
                return <CheckCheck className="size-3.5 text-emerald-500 dark:text-emerald-400" />;
            case 'failed':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertCircle className="size-3.5 text-red-500 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-red-950 text-red-200 border-red-800 text-xs max-w-xs">
                                {message.error_message || 'Message delivery failed.'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            default:
                return null;
        }
    };

    const media = message.media;

    return (
        <div
            className={`flex w-full my-1.5 ${
                isOutgoing
                    ? isRtl
                        ? 'justify-start'
                        : 'justify-end'
                    : isRtl
                      ? 'justify-end'
                      : 'justify-start'
            }`}
        >
            <div
                className={`relative max-w-[82%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm transition-all ${
                    isOutgoing
                        ? 'bg-emerald-600 text-white dark:bg-emerald-700/90 rounded-br-none dark:text-emerald-50'
                        : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none border border-neutral-200/80 dark:border-neutral-700/80'
                }`}
            >
                {/* Outgoing Agent Sender Tag */}
                {isOutgoing && message.sender && (
                    <div className="text-[11px] font-medium text-emerald-100/80 dark:text-emerald-200/70 mb-1 flex items-center gap-1">
                        <span>{message.sender.name}</span>
                    </div>
                )}

                {/* Media: Image */}
                {message.type === 'image' && media?.url && (
                    <div className="mb-2 overflow-hidden rounded-xl bg-neutral-950/10">
                        <img
                            src={media.url}
                            alt={media.file_name || 'WhatsApp Image'}
                            className="max-h-80 w-auto rounded-xl object-contain cursor-pointer hover:opacity-95 transition-opacity"
                            loading="lazy"
                            onClick={() => window.open(media.url, '_blank')}
                        />
                    </div>
                )}

                {/* Media: Video */}
                {message.type === 'video' && media?.url && (
                    <div className="mb-2 overflow-hidden rounded-xl bg-neutral-950/20">
                        <video
                            src={media.url}
                            controls
                            className="max-h-80 w-full rounded-xl"
                        />
                    </div>
                )}

                {/* Media: Voice Note / Audio */}
                {message.type === 'audio' && media?.url && (
                    <div className="mb-2 flex items-center gap-3 p-2 rounded-xl bg-neutral-950/10 dark:bg-neutral-900/30">
                        <button
                            type="button"
                            onClick={toggleAudio}
                            className={`flex size-9 items-center justify-center rounded-full transition-transform active:scale-95 ${
                                isOutgoing
                                    ? 'bg-white text-emerald-700 hover:bg-neutral-100'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                        </button>
                        <audio
                            ref={audioRef}
                            src={media.url}
                            onEnded={() => setIsPlaying(false)}
                            className="hidden"
                        />
                        <div className="flex-1 min-w-[140px]">
                            <div className="h-1.5 w-full bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div className={`h-full ${isPlaying ? 'animate-pulse bg-emerald-400' : 'bg-emerald-500'} w-2/3 rounded-full`} />
                            </div>
                            <span className="text-[10px] opacity-75 mt-1 block">
                                {isRtl ? 'رسالة صوتية' : 'Voice Message'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Media: Document */}
                {message.type === 'document' && media?.url && (
                    <a
                        href={media.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`mb-2 flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                            isOutgoing
                                ? 'bg-emerald-700/60 border-emerald-500/40 hover:bg-emerald-700/80 text-white'
                                : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                        }`}
                    >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                            <FileText className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">{media.file_name}</p>
                            <p className="text-[10px] opacity-75">
                                {media.file_size ? `${Math.round(media.file_size / 1024)} KB` : 'Document'}
                            </p>
                        </div>
                        <Download className="size-4 shrink-0 opacity-70" />
                    </a>
                )}

                {/* Media: Location */}
                {message.type === 'location' && (() => {
                    const loc = (message.metadata?.location && typeof message.metadata.location === 'object')
                        ? (message.metadata.location as { latitude?: number; longitude?: number })
                        : null;
                    return (
                        <div className="mb-2 flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-950/10">
                            <MapPin className="size-5 shrink-0 text-red-500 mt-0.5" />
                            <div className="text-xs">
                                <p className="font-semibold">{message.body || (isRtl ? 'موقع جغرافي' : 'Shared Location')}</p>
                                {loc?.latitude != null && loc?.longitude != null ? (
                                    <a
                                        href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] underline opacity-90 hover:opacity-100 mt-1 inline-block"
                                    >
                                        {isRtl ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    );
                })()}

                {/* Message Body Text */}
                {message.body && message.type !== 'audio' && (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.body}
                    </p>
                )}

                {/* Template Tag if template */}
                {message.type === 'template' && (
                    <div className="mt-1 text-[10px] font-mono opacity-80 border-t border-emerald-500/30 pt-1">
                        📋 {isRtl ? 'نموذج واتساب معتمد' : 'WhatsApp Template'}
                    </div>
                )}

                {/* Timestamp & Status Icon */}
                <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] select-none ${
                        isOutgoing ? 'text-emerald-100/80 dark:text-emerald-200/70' : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                >
                    <span>{formatTime(message.sent_at || message.created_at)}</span>
                    {renderStatus()}
                </div>
            </div>
        </div>
    );
}
