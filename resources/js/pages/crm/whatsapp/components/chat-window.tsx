import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    ExternalLink,
    MoreVertical,
    PanelRightClose,
    PanelRightOpen,
    Phone,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/auth';
import type {
    WhatsAppConversation,
    WhatsAppMessage,
    WhatsAppQuickReply,
    WhatsAppTemplate,
} from '@/types/whatsapp';
import { ChatBubble } from './chat-bubble';
import { ChatComposer } from './chat-composer';
import { TemplateDialog } from './template-dialog';

interface ChatWindowProps {
    conversation: WhatsAppConversation;
    messages: WhatsAppMessage[];
    employees: User[];
    templates: WhatsAppTemplate[];
    quickReplies: WhatsAppQuickReply[];
    showCustomerSidebar: boolean;
    onToggleCustomerSidebar: () => void;
    onUpdateConversation: (updated: WhatsAppConversation) => void;
    isRtl?: boolean;
}

export function ChatWindow({
    conversation,
    messages: initialMessages,
    employees,
    templates,
    quickReplies,
    showCustomerSidebar,
    onToggleCustomerSidebar,
    onUpdateConversation,
    isRtl,
}: ChatWindowProps) {
    const [messages, setMessages] = useState<WhatsAppMessage[]>(initialMessages);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Keep messages synced when initialMessages changes (e.g. conversation switches)
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages, conversation.id]);

    // Scroll to bottom on message updates
    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    };

    useEffect(() => {
        scrollToBottom(false);
    }, [conversation.id]);

    useEffect(() => {
        scrollToBottom(true);
    }, [messages.length]);

    // Polling for new incoming messages for the active conversation
    useEffect(() => {
        const interval = setInterval(async () => {
            if (!conversation.id) return;
            const lastMsgId = messages.length > 0 ? messages[messages.length - 1].id : null;

            try {
                const url = lastMsgId
                    ? `/crm/whatsapp/conversations/${conversation.id}/messages?after_id=${lastMsgId}`
                    : `/crm/whatsapp/conversations/${conversation.id}/messages`;

                const res = await fetch(url, {
                    headers: { Accept: 'application/json' },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages((prev) => {
                            const existingIds = new Set(prev.map((m) => m.id));
                            const fresh = data.messages.filter((m: WhatsAppMessage) => !existingIds.has(m.id));
                            if (fresh.length === 0) return prev;
                            return [...prev, ...fresh];
                        });
                    }

                    if (data.conversation) {
                        onUpdateConversation(data.conversation);
                    }
                }
            } catch {
                // Background polling fail silent
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [conversation.id, messages]);

    const handleAssign = async (employeeId: number | null) => {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/crm/whatsapp/conversations/${conversation.id}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ assigned_to: employeeId }),
            });

            const data = await res.json();
            if (res.ok && data.conversation) {
                toast.success(isRtl ? 'تم تحديث المسؤول' : 'Assigned successfully');
                onUpdateConversation(data.conversation);
            }
        } catch {
            toast.error('Failed to assign');
        }
    };

    const handleStatusChange = async (status: string) => {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/crm/whatsapp/conversations/${conversation.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ status }),
            });

            const data = await res.json();
            if (res.ok && data.conversation) {
                toast.success(isRtl ? 'تم تحديث حالة المحادثة' : 'Status updated');
                onUpdateConversation(data.conversation);
            }
        } catch {
            toast.error('Failed to update status');
        }
    };

    const fetchLatestMessages = async () => {
        try {
            const res = await fetch(`/crm/whatsapp/conversations/${conversation.id}/messages`, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.messages) {
                    setMessages(data.messages);
                }
            }
        } catch {
            // Ignore
        }
    };

    const contact = conversation.contact;
    const lead = conversation.lead;
    const contactName = contact.profile_name || lead?.name || contact.phone_number;

    return (
        <div className="flex h-full flex-col bg-neutral-100/70 dark:bg-neutral-950">
            {/* Chat Top Header */}
            <div className="flex items-center justify-between border-b border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-neutral-200/80 dark:border-neutral-700">
                        <AvatarImage src={contact.avatar_url || undefined} />
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
                            {(contact.profile_name || lead?.name || 'WA').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                {contactName}
                            </h3>
                            {lead && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-500/10 text-blue-600 border-blue-200">
                                    {lead.status_label || lead.status}
                                </Badge>
                            )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono" dir="ltr">
                            +{contact.wa_id}
                        </p>
                    </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2">
                    {/* Assigned Agent Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs border-neutral-200 dark:border-neutral-700 font-medium"
                            >
                                {conversation.assignee ? (
                                    <>
                                        <UserCheck className="size-3 text-emerald-500" />
                                        <span className="max-w-[90px] truncate">{conversation.assignee.name}</span>
                                    </>
                                ) : (
                                    <>
                                        <UserX className="size-3 text-amber-500" />
                                        <span>{isRtl ? 'غير معين' : 'Unassigned'}</span>
                                    </>
                                )}
                                <ChevronDown className="size-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuItem onClick={() => handleAssign(null)} className="cursor-pointer text-amber-600">
                                {isRtl ? 'إلغاء التعيين' : 'Unassign'}
                            </DropdownMenuItem>
                            {employees.map((emp) => (
                                <DropdownMenuItem key={emp.id} onClick={() => handleAssign(emp.id)} className="cursor-pointer">
                                    {emp.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Conversation Status Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs border-neutral-200 dark:border-neutral-700 capitalize font-medium"
                            >
                                <span>{conversation.status}</span>
                                <ChevronDown className="size-3 opacity-50 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 text-xs">
                            <DropdownMenuItem onClick={() => handleStatusChange('open')}>
                                {isRtl ? 'قيد المتابعة (Open)' : 'Open'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                                {isRtl ? 'معلقة (Pending)' : 'Pending'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                                {isRtl ? 'إغلاق المحادثة (Closed)' : 'Closed'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Toggle Customer Info Sidebar */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCustomerSidebar}
                        className="size-8 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title={showCustomerSidebar ? 'Hide Customer Profile' : 'Show Customer Profile'}
                    >
                        {showCustomerSidebar ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
                    </Button>
                </div>
            </div>

            {/* Chat Message Stream */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]"
            >
                {/* 24-hour Meta Window Notice */}
                <div className="mx-auto my-3 max-w-md rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-center text-[11px] text-amber-800 dark:text-amber-300">
                    💡 {isRtl
                        ? 'تتيح منصة واتساب للأعمال إرسال رسائل حرة للرد خلال 24 ساعة من آخر رسالة للعميل. لبدء محادثات جديدة، استخدم النماذج المعتمدة.'
                        : 'Meta allows free-form replies within a 24-hour customer care window. Outside the window, use approved message templates.'}
                </div>

                {messages.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-400">
                        {isRtl ? 'لا توجد رسائل سابقة في هذه المحادثة.' : 'No messages in this chat yet.'}
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} isRtl={isRtl} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Composer */}
            <ChatComposer
                conversation={conversation}
                quickReplies={quickReplies}
                onOpenTemplates={() => setTemplateDialogOpen(true)}
                onMessageSent={fetchLatestMessages}
                isRtl={isRtl}
            />

            {/* Template Selector Modal */}
            <TemplateDialog
                open={templateDialogOpen}
                onOpenChange={setTemplateDialogOpen}
                conversation={conversation}
                templates={templates}
                onTemplateSent={fetchLatestMessages}
                isRtl={isRtl}
            />
        </div>
    );
}

