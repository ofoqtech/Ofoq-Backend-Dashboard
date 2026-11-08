import {
    Paperclip,
    Send,
    Smile,
    Sparkles,
    Zap,
    X,
} from 'lucide-react';
import { useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import type { WhatsAppConversation, WhatsAppQuickReply } from '@/types/whatsapp';

interface ChatComposerProps {
    conversation: WhatsAppConversation;
    quickReplies: WhatsAppQuickReply[];
    onOpenTemplates: () => void;
    onMessageSent: () => void;
    isRtl?: boolean;
}

const QUICK_EMOJIS = ['👍', '👋', '🤝', '✅', '❤️', '💼', '🚀', '⭐'];

export function ChatComposer({
    conversation,
    quickReplies,
    onOpenTemplates,
    onMessageSent,
    isRtl,
}: ChatComposerProps) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            toast.error(isRtl ? 'حجم الملف يتجاوز الحد الأقصى (50 ميجابايت)' : 'File size exceeds limit (50MB)');
            return;
        }

        setSelectedFile(file);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setFilePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        if (isSending) return;

        // Sending File Attachment
        if (selectedFile) {
            setIsSending(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            if (message.trim()) {
                formData.append('caption', message.trim());
            }

            try {
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                const res = await fetch(`/crm/whatsapp/conversations/${conversation.id}/media`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    body: formData,
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || (isRtl ? 'فشل إرسال الملف' : 'Failed to send file'));
                }

                toast.success(isRtl ? 'تم إرسال الملف بنجاح' : 'File sent successfully');
                clearFile();
                setMessage('');
                onMessageSent();
            } catch (err: unknown) {
                const error = err as Error;
                toast.error(error.message || 'Error sending media');
            } finally {
                setIsSending(false);
            }
            return;
        }

        // Sending Text Message
        const trimmed = message.trim();
        if (!trimmed) return;

        setIsSending(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/crm/whatsapp/conversations/${conversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ message: trimmed }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || (isRtl ? 'فشل إرسال الرسالة' : 'Failed to send message'));
            }

            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            onMessageSent();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Error sending message');
        } finally {
            setIsSending(false);
        }
    };

    const insertEmoji = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        textareaRef.current?.focus();
    };

    const insertQuickReply = (qr: WhatsAppQuickReply) => {
        setMessage((prev) => (prev ? `${prev}\n${qr.content}` : qr.content));
        textareaRef.current?.focus();
    };

    return (
        <div className="border-t border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm p-3">
            {/* Selected File Attachment Preview Bar */}
            {selectedFile && (
                <div className="mb-2 flex items-center justify-between gap-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        {filePreview ? (
                            <img src={filePreview} alt="Preview" className="size-10 rounded-lg object-cover" />
                        ) : (
                            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                <Paperclip className="size-5" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-emerald-950 dark:text-emerald-100">
                                {selectedFile.name}
                            </p>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                                {Math.round(selectedFile.size / 1024)} KB
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-neutral-500 hover:text-red-500"
                        onClick={clearFile}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            )}

            {/* Quick Action Tools Bar */}
            <div className="mb-2 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1">
                    {/* File Attachment Hidden Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        title={isRtl ? 'إرفاق ملف أو صورة' : 'Attach file or image'}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="size-4" />
                    </Button>

                    {/* Quick Replies Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 px-2.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                                <Zap className="size-3.5 text-amber-500" />
                                <span>{isRtl ? 'رد سريع' : 'Quick Reply'}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRtl ? 'end' : 'start'} className="w-64 max-h-60 overflow-y-auto">
                            {quickReplies.length === 0 ? (
                                <div className="p-2 text-xs text-neutral-400 text-center">
                                    {isRtl ? 'لا توجد ردود سريعة مسجلة' : 'No quick replies'}
                                </div>
                            ) : (
                                quickReplies.map((qr) => (
                                    <DropdownMenuItem
                                        key={qr.id}
                                        onClick={() => insertQuickReply(qr)}
                                        className="cursor-pointer flex flex-col items-start gap-0.5 py-1.5"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-semibold text-xs">{qr.title}</span>
                                            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">{qr.shortcut}</span>
                                        </div>
                                        <span className="text-[11px] text-neutral-500 line-clamp-1">{qr.content}</span>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* WhatsApp Template Selector Modal Button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                        onClick={onOpenTemplates}
                    >
                        <Sparkles className="size-3.5 text-purple-500" />
                        <span>{isRtl ? 'النماذج المعتمدة' : 'Templates'}</span>
                    </Button>
                </div>

                {/* Popular Emojis Bar */}
                <div className="hidden sm:flex items-center gap-0.5">
                    {QUICK_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="size-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Composer */}
            <div className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        selectedFile
                            ? isRtl
                                ? 'أضف وصفاً للملف (اختياري)...'
                                : 'Add a caption (optional)...'
                            : isRtl
                              ? 'اكتب رسالتك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)'
                              : 'Type a message... (Enter to send, Shift+Enter for new line)'
                    }
                    className="flex-1 max-h-32 min-h-[44px] resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                <Button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending || (!message.trim() && !selectedFile)}
                    className="size-11 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                    {isSending ? (
                        <Spinner className="size-5" />
                    ) : (
                        <Send className={`size-5 ${isRtl ? 'rotate-180' : ''}`} />
                    )}
                </Button>
            </div>
        </div>
    );
}

