import { Head, router } from '@inertiajs/react';
import {
    MessageSquare,
    MessageSquarePlus,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, User } from '@/types';
import type {
    WhatsAppAccountInfo,
    WhatsAppConversation,
    WhatsAppMessage,
    WhatsAppQuickReply,
    WhatsAppTemplate,
} from '@/types/whatsapp';
import { ChatSidebar } from './components/chat-sidebar';
import { ChatWindow } from './components/chat-window';
import { CustomerSidebar } from './components/customer-sidebar';
import { NewChatDialog } from './components/new-chat-dialog';

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
}

interface WhatsAppInboxProps {
    conversations: Paginated<WhatsAppConversation> | WhatsAppConversation[];
    selectedConversation?: WhatsAppConversation | null;
    messages: WhatsAppMessage[];
    employees: User[];
    templates: WhatsAppTemplate[];
    quickReplies: WhatsAppQuickReply[];
    account: WhatsAppAccountInfo;
    totalUnread: number;
    filters: {
        status?: string;
        assigned_to?: string;
        search?: string;
        conversation_id?: number | null;
    };
}

export default function WhatsAppInbox({
    conversations: rawConversations,
    selectedConversation: initialSelected,
    messages,
    employees,
    templates,
    quickReplies,
    account,
    totalUnread,
    filters,
}: WhatsAppInboxProps) {
    const { t, isRtl } = useTranslation();

    const conversationList: WhatsAppConversation[] = Array.isArray(rawConversations)
        ? rawConversations
        : rawConversations.data || [];

    const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(
        initialSelected || (conversationList.length > 0 ? conversationList[0] : null)
    );
    const [showCustomerSidebar, setShowCustomerSidebar] = useState(true);
    const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

    useEffect(() => {
        if (initialSelected) {
            setSelectedConversation(initialSelected);
        } else if (conversationList.length > 0 && !selectedConversation) {
            setSelectedConversation(conversationList[0]);
        }
    }, [initialSelected, conversationList]);

    const handleSelectConversation = (conversation: WhatsAppConversation) => {
        setSelectedConversation(conversation);
        router.get(
            '/crm/whatsapp',
            {
                conversation_id: conversation.id,
                status: filters.status,
                search: filters.search,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleUpdateConversation = (updated: WhatsAppConversation) => {
        setSelectedConversation(updated);
    };

    const handleNewChatCreated = (conversationId: number) => {
        router.get(
            '/crm/whatsapp',
            { conversation_id: conversationId },
            { preserveState: false }
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('nav.dashboard'),
            href: dashboard(),
        },
        {
            title: t('nav.crm'),
            href: '/crm',
        },
        {
            title: isRtl ? 'صندوق محادثات واتساب' : 'WhatsApp Inbox',
            href: '/crm/whatsapp',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isRtl ? 'صندوق محادثات واتساب - Meta Cloud API' : 'WhatsApp Inbox - Meta Cloud API'} />

            <div className="flex h-[calc(100vh-65px)] flex-col bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
                {/* Top Meta Cloud Status Banner if not configured */}
                {!account.is_active && (
                    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200 shrink-0">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="size-4 text-amber-500 shrink-0" />
                            <span>
                                {isRtl
                                    ? 'تنبيه: لم يتم ضبط بيانات Meta WhatsApp Cloud API في ملف البيئة .env بعد (WHATSAPP_PHONE_NUMBER_ID و WHATSAPP_ACCESS_TOKEN).'
                                    : 'Notice: Meta WhatsApp Cloud API credentials are not yet fully configured in your .env (WHATSAPP_PHONE_NUMBER_ID & WHATSAPP_ACCESS_TOKEN). Outbound messages will run in simulated mode.'}
                            </span>
                        </div>
                    </div>
                )}

                {/* 3-Column WhatsApp Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Column: Conversations List */}
                    <div className="w-full md:w-[320px] lg:w-[360px] shrink-0 h-full">
                        <ChatSidebar
                            conversations={conversationList}
                            selectedConversationId={selectedConversation?.id}
                            account={account}
                            totalUnread={totalUnread}
                            currentFilter={filters.status || 'open'}
                            searchQuery={filters.search || ''}
                            onSelectConversation={handleSelectConversation}
                            onOpenNewChat={() => setNewChatDialogOpen(true)}
                            isRtl={isRtl}
                        />
                    </div>

                    {/* Middle Column: Chat Window */}
                    <div className="flex-1 h-full min-w-0">
                        {selectedConversation ? (
                            <ChatWindow
                                key={selectedConversation.id}
                                conversation={selectedConversation}
                                messages={messages}
                                employees={employees}
                                templates={templates}
                                quickReplies={quickReplies}
                                showCustomerSidebar={showCustomerSidebar}
                                onToggleCustomerSidebar={() => setShowCustomerSidebar(!showCustomerSidebar)}
                                onUpdateConversation={handleUpdateConversation}
                                isRtl={isRtl}
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-white dark:bg-neutral-900/40">
                                <div className="flex size-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                                    <MessageSquare className="size-8" />
                                </div>
                                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                    {isRtl ? 'مرحباً بك في صندوق محادثات واتساب' : 'WhatsApp Business CRM Inbox'}
                                </h3>
                                <p className="text-xs text-neutral-500 max-w-sm mt-1 mb-4">
                                    {isRtl
                                        ? 'اختر محادثة من القائمة للبدء، أو ابدأ محادثة جديدة مع أحد العملاء مباشرة عبر واجهة ميتا الرسمية.'
                                        : 'Select a conversation from the sidebar to chat, or start a new conversation with a customer.'}
                                </p>
                                <Button
                                    type="button"
                                    onClick={() => setNewChatDialogOpen(true)}
                                    className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    <MessageSquarePlus className="size-4" />
                                    <span>{isRtl ? 'بدء محادثة جديدة' : 'Start New Conversation'}</span>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Customer Details & CRM Actions */}
                    {selectedConversation && showCustomerSidebar && (
                        <div className="hidden xl:block w-[320px] shrink-0 h-full">
                            <CustomerSidebar
                                conversation={selectedConversation}
                                employees={employees}
                                onClose={() => setShowCustomerSidebar(false)}
                                onUpdateConversation={handleUpdateConversation}
                                isRtl={isRtl}
                            />
                        </div>
                    )}
                </div>

                {/* New Chat Dialog Modal */}
                <NewChatDialog
                    open={newChatDialogOpen}
                    onOpenChange={setNewChatDialogOpen}
                    onConversationCreated={handleNewChatCreated}
                    isRtl={isRtl}
                />
            </div>
        </AppLayout>
    );
}

