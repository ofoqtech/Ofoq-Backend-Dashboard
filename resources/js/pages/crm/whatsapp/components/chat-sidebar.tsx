import { Link, router } from '@inertiajs/react';
import {
    Check,
    CheckCheck,
    Clock,
    Filter,
    MessageSquarePlus,
    Search,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type {
    WhatsAppAccountInfo,
    WhatsAppConversation,
    WhatsAppConversationStatus,
} from '@/types/whatsapp';

interface ChatSidebarProps {
    conversations: WhatsAppConversation[];
    selectedConversationId?: number | null;
    account: WhatsAppAccountInfo;
    totalUnread: number;
    currentFilter: string;
    searchQuery: string;
    onSelectConversation: (conversation: WhatsAppConversation) => void;
    onOpenNewChat: () => void;
    isRtl?: boolean;
}

export function ChatSidebar({
    conversations,
    selectedConversationId,
    account,
    totalUnread,
    currentFilter,
    searchQuery,
    onSelectConversation,
    onOpenNewChat,
    isRtl,
}: ChatSidebarProps) {
    const [search, setSearch] = useState(searchQuery || '');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/crm/whatsapp',
            { search, status: currentFilter !== 'all' ? currentFilter : undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (status: string) => {
        router.get(
            '/crm/whatsapp',
            { status, search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    const formatTimestamp = (dateStr?: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();

        if (isToday) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getInitials = (name?: string | null, phone?: string | null) => {
        if (name) {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name.slice(0, 2).toUpperCase();
        }
        return phone ? phone.slice(-2) : 'WA';
    };

    return (
        <div className="flex h-full flex-col border-r border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 select-none">
            {/* Header / Account Status */}
            <div className="p-3.5 border-b border-neutral-200/90 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <span className="text-base font-bold">W</span>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                <span>{isRtl ? 'محادثات واتساب' : 'WhatsApp Chats'}</span>
                                {totalUnread > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                                        {totalUnread}
                                    </span>
                                )}
                            </h2>
                            <p className="text-[11px] text-neutral-500 truncate max-w-[170px]">
                                {account.display_phone_number || account.name}
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        onClick={onOpenNewChat}
                        className="h-8 gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 font-medium shadow-sm transition-transform active:scale-95"
                    >
                        <MessageSquarePlus className="size-3.5" />
                        <span>{isRtl ? 'جديدة' : 'New'}</span>
                    </Button>
                </div>

                {/* Search & Filter Bar */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 mt-2.5">
                    <div className="relative flex-1">
                        <Search className={`absolute top-2.5 size-3.5 text-neutral-400 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
                        <Input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={isRtl ? 'بحث في المحادثات...' : 'Search chats...'}
                            className={`h-8 text-xs bg-neutral-100/80 dark:bg-neutral-800 border-none ${
                                isRtl ? 'pr-8 pl-2.5' : 'pl-8 pr-2.5'
                            }`}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8 shrink-0 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                title={isRtl ? 'تصفية المحادثات' : 'Filter chats'}
                            >
                                <Filter className="size-3.5 text-neutral-600 dark:text-neutral-300" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="w-44 text-xs">
                            <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                                {isRtl ? 'جميع المحادثات' : 'All Conversations'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange('open')}>
                                {isRtl ? 'قيد المتابعة (Open)' : 'Open Chats'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange('pending')}>
                                {isRtl ? 'معلقة (Pending)' : 'Pending'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange('closed')}>
                                {isRtl ? 'مغلقة (Closed)' : 'Closed'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange('unassigned')}>
                                {isRtl ? 'غير معينة (Unassigned)' : 'Unassigned'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </form>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-400">
                        {isRtl ? 'لا توجد محادثات مطابقة' : 'No conversations found'}
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isSelected = selectedConversationId === conv.id;
                        const contactName = conv.contact.profile_name || conv.lead?.name || conv.contact.phone_number;
                        const phone = conv.contact.phone_number || `+${conv.contact.wa_id}`;
                        const initials = getInitials(conv.contact.profile_name || conv.lead?.name, conv.contact.phone_number);

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv)}
                                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors relative ${
                                    isSelected
                                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-l-emerald-600 dark:border-l-emerald-500'
                                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                }`}
                            >
                                <Avatar className="size-11 shrink-0 border border-neutral-200/80 dark:border-neutral-700">
                                    <AvatarImage src={conv.contact.avatar_url || undefined} />
                                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <p className="truncate text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            {contactName}
                                        </p>
                                        <span className="text-[10px] text-neutral-400 shrink-0">
                                            {formatTimestamp(conv.last_message_at || conv.updated_at)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-1">
                                        <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                                            {conv.last_message_direction === 'outgoing' && (
                                                <span className="inline-block text-emerald-600 mr-1 font-semibold">✓</span>
                                            )}
                                            {conv.last_message_preview || (isRtl ? 'بدء محادثة...' : 'Started chat...')}
                                        </p>

                                        {conv.unread_count > 0 && (
                                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>

                                    {/* Sub-tags: Assigned agent or CRM Lead badge */}
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        {conv.lead && (
                                            <span className="text-[9px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                                                CRM Lead #{conv.lead.id}
                                            </span>
                                        )}
                                        {conv.assignee ? (
                                            <span className="text-[9px] text-neutral-500 truncate max-w-[100px] flex items-center gap-0.5">
                                                <UserCheck className="size-2.5 text-emerald-500" />
                                                <span>{conv.assignee.name}</span>
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 flex items-center gap-0.5">
                                                <UserX className="size-2.5" />
                                                <span>{isRtl ? 'غير معين' : 'Unassigned'}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

