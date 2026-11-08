import { Link } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Calendar,
    ChevronDown,
    ExternalLink,
    FileEdit,
    Globe,
    Mail,
    Phone,
    Plus,
    Tag,
    UserCheck,
    UserX,
    X,
} from 'lucide-react';
import { useState } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import type { User } from '@/types/auth';
import type { WhatsAppConversation } from '@/types/whatsapp';

interface CustomerSidebarProps {
    conversation: WhatsAppConversation;
    employees: User[];
    onClose: () => void;
    onUpdateConversation: (updated: WhatsAppConversation) => void;
    isRtl?: boolean;
}

const LEAD_STATUSES = [
    { value: 'new', label: 'New Lead', labelAr: 'طلب جديد', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { value: 'contacted', label: 'Contacted', labelAr: 'تم التواصل', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { value: 'qualified', label: 'Qualified', labelAr: 'مؤهل للشراء', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    { value: 'proposal_sent', label: 'Proposal Sent', labelAr: 'أرسل العرض', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
    { value: 'negotiation', label: 'Negotiation', labelAr: 'مفاوضات', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
    { value: 'won', label: 'Won Deal', labelAr: 'تم التعاقد 🎉', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { value: 'lost', label: 'Lost', labelAr: 'مفقود', color: 'bg-red-500/10 text-red-600 border-red-200' },
];

export function CustomerSidebar({
    conversation,
    employees,
    onClose,
    onUpdateConversation,
    isRtl,
}: CustomerSidebarProps) {
    const [noteContent, setNoteContent] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const contact = conversation.contact;
    const lead = conversation.lead;

    const handleAssign = async (employeeId: number | null) => {
        setIsAssigning(true);
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
            if (!res.ok) throw new Error(data.message || 'Failed to assign conversation');

            toast.success(isRtl ? 'تم تحديث تعيين المحادثة' : 'Assigned successfully');
            onUpdateConversation(data.conversation);
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Error assigning employee');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!lead) return;
        setIsUpdatingStatus(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/crm/whatsapp/conversations/${conversation.id}/lead-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update status');

            toast.success(isRtl ? 'تم تحديث حالة العميل' : 'Lead status updated');
            if (data.lead) {
                onUpdateConversation({
                    ...conversation,
                    lead: data.lead,
                });
            }
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Error updating status');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = noteContent.trim();
        if (!trimmed || !lead) return;

        setIsSavingNote(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/crm/whatsapp/conversations/${conversation.id}/lead-notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ content: trimmed }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to add note');

            toast.success(isRtl ? 'تمت إضافة الملاحظة' : 'Note added successfully');
            setNoteContent('');

            if (data.activity && lead) {
                const updatedActivities = [data.activity, ...(lead.activities || [])];
                onUpdateConversation({
                    ...conversation,
                    lead: {
                        ...lead,
                        activities: updatedActivities,
                    },
                });
            }
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Error adding note');
        } finally {
            setIsSavingNote(false);
        }
    };

    return (
        <div className="flex h-full flex-col border-l border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-y-auto select-none">
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-neutral-200/90 dark:border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Tag className="size-3.5 text-emerald-600" />
                    <span>{isRtl ? 'ملف العميل في الـ CRM' : 'Customer CRM Profile'}</span>
                </h3>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    onClick={onClose}
                >
                    <X className="size-4" />
                </Button>
            </div>

            {/* Profile Avatar & Contact Info */}
            <div className="p-4 border-b border-neutral-200/90 dark:border-neutral-800 text-center">
                <Avatar className="size-16 mx-auto mb-2.5 border-2 border-emerald-500/20">
                    <AvatarImage src={contact.avatar_url || undefined} />
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-lg">
                        {(contact.profile_name || lead?.name || 'WA').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {contact.profile_name || lead?.name || `+${contact.wa_id}`}
                </h4>

                <p className="text-xs text-neutral-500 font-mono mt-0.5" dir="ltr">
                    +{contact.wa_id}
                </p>

                {lead?.company && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1 mt-1">
                        <Building2 className="size-3 text-neutral-400" />
                        <span>{lead.company}</span>
                    </p>
                )}

                {/* Direct Link to CRM Pipeline */}
                {lead && (
                    <Link
                        href={`/crm?search=${encodeURIComponent(lead.phone)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline mt-2.5"
                    >
                        <span>{isRtl ? 'فتح في لوحة متابعة العملاء' : 'Open in CRM Pipeline'}</span>
                        <ExternalLink className="size-3" />
                    </Link>
                )}
            </div>

            {/* CRM Lead Details */}
            {lead ? (
                <div className="p-4 space-y-4 text-xs">
                    {/* Status Dropdown */}
                    <div>
                        <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 block">
                            {isRtl ? 'مرحلة العميل في الـ CRM' : 'CRM Pipeline Stage'}
                        </label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isUpdatingStatus}
                                    className="w-full justify-between text-xs h-8 font-medium"
                                >
                                    <span>
                                        {isRtl ? lead.status_label_ar || lead.status : lead.status_label || lead.status}
                                    </span>
                                    {isUpdatingStatus ? <Spinner className="size-3" /> : <ChevronDown className="size-3.5 opacity-60" />}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                {LEAD_STATUSES.map((st) => (
                                    <DropdownMenuItem
                                        key={st.value}
                                        onClick={() => handleStatusChange(st.value)}
                                        className="cursor-pointer text-xs"
                                    >
                                        <span className={`inline-block size-2 rounded-full mr-2 ${st.color.split(' ')[0]}`} />
                                        <span>{isRtl ? st.labelAr : st.label}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Assigned Employee Dropdown */}
                    <div>
                        <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 block">
                            {isRtl ? 'الموظف المسؤول' : 'Assigned Employee'}
                        </label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isAssigning}
                                    className="w-full justify-between text-xs h-8 font-medium"
                                >
                                    <span className="flex items-center gap-1.5 truncate">
                                        {conversation.assignee ? (
                                            <>
                                                <UserCheck className="size-3 text-emerald-500" />
                                                <span>{conversation.assignee.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserX className="size-3 text-amber-500" />
                                                <span>{isRtl ? 'غير معين' : 'Unassigned'}</span>
                                            </>
                                        )}
                                    </span>
                                    {isAssigning ? <Spinner className="size-3" /> : <ChevronDown className="size-3.5 opacity-60" />}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem onClick={() => handleAssign(null)} className="cursor-pointer text-xs text-amber-600">
                                    {isRtl ? 'إلغاء التعيين (Unassigned)' : 'Unassigned'}
                                </DropdownMenuItem>
                                {employees.map((emp) => (
                                    <DropdownMenuItem
                                        key={emp.id}
                                        onClick={() => handleAssign(emp.id)}
                                        className="cursor-pointer text-xs"
                                    >
                                        <span>{emp.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Service & Budget Snapshot */}
                    {(lead.service_name_snapshot || lead.budget_range_snapshot) && (
                        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-3 border border-neutral-200/80 dark:border-neutral-700/80">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                                {isRtl ? 'الخدمة والميزانية التقديرية' : 'Service & Budget'}
                            </span>
                            {lead.service_name_snapshot && (
                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {lead.service_name_snapshot}
                                </p>
                            )}
                            {lead.budget_range_snapshot && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                                    {lead.budget_range_snapshot}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Acquisition Channel */}
                    <div>
                        <span className="text-[11px] font-semibold text-neutral-500 mb-1 block">
                            {isRtl ? 'مصدر العميل (قناة التسويق)' : 'Acquisition Channel'}
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <Globe className="size-3" />
                            <span>{isRtl ? lead.channel_label_ar || 'واتساب مباشر' : lead.channel_label || 'WhatsApp Direct'}</span>
                        </div>
                    </div>

                    {/* Add Internal Note */}
                    <div className="border-t border-neutral-200/90 dark:border-neutral-800 pt-3">
                        <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 block">
                            {isRtl ? 'إضافة ملاحظة للعميل' : 'Add Note to Lead'}
                        </label>
                        <form onSubmit={handleAddNote} className="space-y-2">
                            <textarea
                                rows={2}
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder={isRtl ? 'اكتب ملاحظة جديدة...' : 'Write note here...'}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 p-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSavingNote || !noteContent.trim()}
                                className="w-full h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                            >
                                {isSavingNote ? <Spinner className="size-3" /> : <Plus className="size-3" />}
                                <span>{isRtl ? 'حفظ الملاحظة' : 'Save Note'}</span>
                            </Button>
                        </form>
                    </div>

                    {/* Activity Log / Notes Stream */}
                    {lead.activities && lead.activities.length > 0 && (
                        <div className="border-t border-neutral-200/90 dark:border-neutral-800 pt-3">
                            <span className="text-[11px] font-semibold text-neutral-500 mb-2 flex items-center gap-1">
                                <Activity className="size-3 text-neutral-400" />
                                <span>{isRtl ? 'سجل الأنشطة والمتابعات' : 'Activity Timeline'}</span>
                            </span>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {lead.activities.map((act) => (
                                    <div
                                        key={act.id}
                                        className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-[11px]"
                                    >
                                        <p className="text-neutral-800 dark:text-neutral-200 leading-tight">
                                            {act.content}
                                        </p>
                                        <span className="text-[9px] text-neutral-400 mt-1 block">
                                            {act.user?.name ? `${act.user.name} · ` : ''}
                                            {new Date(act.created_at).toLocaleDateString([], {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 text-center text-xs text-neutral-400">
                    <p>{isRtl ? 'لا يوجد عميل مرتبط بهذا الرقم حالياً.' : 'No CRM Lead linked to this contact.'}</p>
                </div>
            )}
        </div>
    );
}

