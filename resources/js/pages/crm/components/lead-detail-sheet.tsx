import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Calendar,
    Clock,
    FileText,
    FolderPlus,
    Mail,
    MessageCircle,
    Phone,
    PlusCircle,
    Send,
    SlidersHorizontal,
    Tag,
    Trash2,
    UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n';
import type { Lead, PriorityOption, StatusOption } from '@/types/crm';
import type { User } from '@/types/auth';

interface LeadDetailSheetProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    statuses: StatusOption[];
    priorities: PriorityOption[];
    teamMembers: User[];
    isAdmin: boolean;
}

export function LeadDetailSheet({
    lead,
    isOpen,
    onClose,
    statuses,
    priorities,
    teamMembers,
    isAdmin,
}: LeadDetailSheetProps) {
    const { t, isRtl, localized, formatDate } = useTranslation();

    const [noteContent, setNoteContent] = useState('');
    const [noteType, setNoteType] = useState<'note' | 'call' | 'whatsapp' | 'meeting' | 'proposal_sent'>('note');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!lead) return null;

    const handleStatusChange = (newStatus: string) => {
        router.patch(
            `/crm/${lead.id}/status`,
            { status: newStatus },
            { preserveScroll: true }
        );
    };

    const handlePriorityChange = (newPriority: string) => {
        router.patch(
            `/crm/${lead.id}/priority`,
            { priority: newPriority },
            { preserveScroll: true }
        );
    };

    const handleAssignChange = (userId: string) => {
        router.patch(
            `/crm/${lead.id}/assign`,
            { assigned_to: userId === 'unassigned' ? null : Number(userId) },
            { preserveScroll: true }
        );
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteContent.trim()) return;

        setIsSubmittingNote(true);
        router.post(
            `/crm/${lead.id}/notes`,
            { content: noteContent, type: noteType },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNoteContent('');
                    setIsSubmittingNote(false);
                },
                onError: () => {
                    setIsSubmittingNote(false);
                },
            }
        );
    };

    const handleDeleteLead = () => {
        setIsDeleting(true);
        router.delete(`/crm/${lead.id}`, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
                setIsDeleting(false);
                onClose();
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-cyan-500';
            case 'contacted':
                return 'bg-blue-500';
            case 'qualified':
                return 'bg-indigo-500';
            case 'proposal_sent':
                return 'bg-purple-500';
            case 'negotiation':
                return 'bg-amber-500';
            case 'won':
                return 'bg-emerald-500';
            case 'lost':
                return 'bg-rose-500';
            default:
                return 'bg-slate-400';
        }
    };

    const getPriorityDotColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-rose-500';
            case 'high':
                return 'bg-amber-500';
            case 'medium':
                return 'bg-blue-500';
            case 'low':
                return 'bg-slate-400';
            default:
                return 'bg-slate-400';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'created':
                return <PlusCircle className="size-3.5 text-blue-500" />;
            case 'status_change':
                return <ArrowRight className="size-3.5 text-amber-500" />;
            case 'assigned':
                return <UserCheck className="size-3.5 text-indigo-500" />;
            case 'whatsapp':
                return <MessageCircle className="size-3.5 text-emerald-500" />;
            case 'call':
                return <Phone className="size-3.5 text-sky-500" />;
            case 'proposal_sent':
                return <Send className="size-3.5 text-purple-500" />;
            default:
                return <FileText className="size-3.5 text-muted-foreground" />;
        }
    };

    const getServiceLabel = () => {
        const localizedName = localized({
            en: lead.service?.name_en || lead.service_name_snapshot,
            ar: lead.service?.name_ar || lead.service_name_snapshot,
        });
        return localizedName || t('common.custom_inquiry');
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    side={isRtl ? 'left' : 'right'}
                    className="flex w-full flex-col overflow-y-auto sm:max-w-xl p-0"
                >
                    {/* Header Banner */}
                    <div className="border-b bg-muted/40 p-6">
                        <SheetHeader className="text-start">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${lead.status_color}`}
                                    >
                                        {t(`stage.${lead.status}`, lead.status_label)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${lead.priority_color}`}
                                    >
                                        {t(`priority.${lead.priority}`, lead.priority_label)}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">ID #{lead.id}</span>
                            </div>

                            <SheetTitle className="mt-2 text-xl font-bold tracking-tight">
                                {lead.name}
                            </SheetTitle>

                            {lead.company && (
                                <SheetDescription className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <Building2 className="size-4 text-muted-foreground" />
                                    {lead.company}
                                </SheetDescription>
                            )}
                        </SheetHeader>

                        {/* Quick Contact Action Buttons */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                asChild
                            >
                                <a
                                    href={lead.whatsapp_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5"
                                >
                                    <MessageCircle className="size-4" />
                                    {t('crm.chat_whatsapp')}
                                </a>
                            </Button>

                            <Button size="sm" variant="outline" asChild>
                                <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5">
                                    <Phone className="size-4" />
                                    {lead.phone}
                                </a>
                            </Button>

                            {lead.email && (
                                <Button size="sm" variant="ghost" asChild>
                                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5">
                                        <Mail className="size-4" />
                                        {t('crm.email')}
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 p-6">
                        {/* Status & Priority Management Card */}
                        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b pb-2.5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <SlidersHorizontal className="size-3.5 text-primary" />
                                    {t('crm.lead_stage_mgmt')}
                                </h4>
                                <span className="text-[10px] text-muted-foreground">{t('common.auto_saved')}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Pipeline Stage */}
                                <div className="space-y-1.5 min-w-0">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <span className={`size-2 rounded-full shrink-0 ${getStatusDotColor(lead.status)}`} />
                                        <span>{t('crm.pipeline_stage')}</span>
                                    </label>
                                    <Select
                                        value={lead.status}
                                        onValueChange={handleStatusChange}
                                    >
                                        <SelectTrigger className="w-full min-w-0 h-10 text-xs bg-background/80 shadow-2xs font-medium border-input">
                                            <SelectValue placeholder={t('crm.stage')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem key={s.value} value={s.value} className="text-xs py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`size-2 rounded-full shrink-0 ${getStatusDotColor(s.value)}`} />
                                                        <span className="font-medium">
                                                            {isRtl ? s.label_ar : s.label}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Priority Level */}
                                <div className="space-y-1.5 min-w-0">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <span className={`size-2 rounded-full shrink-0 ${getPriorityDotColor(lead.priority)}`} />
                                        <span>{t('crm.priority_level')}</span>
                                    </label>
                                    <Select
                                        value={lead.priority}
                                        onValueChange={handlePriorityChange}
                                    >
                                        <SelectTrigger className="w-full min-w-0 h-10 text-xs bg-background/80 shadow-2xs font-medium border-input">
                                            <SelectValue placeholder={t('crm.priority')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorities.map((p) => (
                                                <SelectItem key={p.value} value={p.value} className="text-xs py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`size-2 rounded-full shrink-0 ${getPriorityDotColor(p.value)}`} />
                                                        <span className="font-medium">
                                                            {isRtl ? p.label_ar : p.label}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Assigned Representative */}
                            <div className="pt-2 border-t space-y-1.5 min-w-0">
                                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <UserCheck className="size-3.5 text-muted-foreground" />
                                        {t('crm.assigned_rep')}
                                    </span>
                                    {!isAdmin && (
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                            {t('crm.assigned_by_admin')}
                                        </span>
                                    )}
                                </label>
                                <Select
                                    value={lead.assigned_to ? String(lead.assigned_to) : 'unassigned'}
                                    onValueChange={handleAssignChange}
                                    disabled={!isAdmin}
                                >
                                    <SelectTrigger className="w-full min-w-0 h-10 text-xs bg-background/80 shadow-2xs font-medium border-input">
                                        <SelectValue placeholder={t('crm.assignee')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned" className="text-xs py-2">
                                            <span className="italic text-muted-foreground">{t('common.unassigned')}</span>
                                        </SelectItem>
                                        {teamMembers.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)} className="text-xs py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{m.name}</span>
                                                    <span className="text-[10px] text-muted-foreground capitalize">
                                                        ({m.role})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Inquiry Details Snapshot Card */}
                        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t('crm.project_scope_details')}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground">{t('crm.service_requested')}</span>
                                    <p className="font-semibold text-foreground mt-0.5">
                                        {getServiceLabel()}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground">{t('crm.budget_range')}</span>
                                    <p className="font-medium text-foreground mt-0.5">
                                        {lead.budget_range_snapshot || t('common.not_specified')}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground">{t('crm.first_submitted')}</span>
                                    <p className="text-foreground mt-0.5 flex items-center gap-1.5">
                                        <Calendar className="size-3.5 text-muted-foreground" />
                                        {formatDate(lead.created_at, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground">{t('crm.inquiry_source')}</span>
                                    <p className="text-foreground mt-0.5 flex items-center gap-1.5">
                                        <Tag className="size-3.5 text-muted-foreground" />
                                        <span className="capitalize">{lead.source?.replace('_', ' ')}</span>
                                    </p>
                                </div>
                            </div>

                            {lead.internal_notes && (
                                <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                                    <span className="font-semibold text-foreground block mb-1">
                                        {t('crm.initial_message')}
                                    </span>
                                    {lead.internal_notes}
                                </div>
                            )}

                            {lead.lost_reason && (
                                <div className="mt-2 rounded-lg bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-700 dark:text-rose-400">
                                    <span className="font-semibold block mb-1">{t('crm.reason_lost')}</span>
                                    {lead.lost_reason}
                                </div>
                            )}

                            {/* Convert to Project Quick Action */}
                            <div className="pt-2 border-t flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {t('crm.ready_initiate')}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-xs font-medium"
                                    asChild
                                >
                                    <a
                                        href={`/projects/create?title=${encodeURIComponent(
                                            `${lead.name} Project`
                                        )}&client=${encodeURIComponent(lead.name)}`}
                                    >
                                        <FolderPlus className="size-3.5 text-primary" />
                                        {t('crm.convert_to_project')}
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Add Communication / Note Box */}
                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                {t('crm.log_communication')}
                            </h4>

                            <form onSubmit={handleAddNote} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={noteType}
                                        onValueChange={(val) => setNoteType(val as any)}
                                    >
                                        <SelectTrigger className="w-44 h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="note">{t('activity.note')}</SelectItem>
                                            <SelectItem value="call">{t('activity.call')}</SelectItem>
                                            <SelectItem value="whatsapp">{t('activity.whatsapp')}</SelectItem>
                                            <SelectItem value="meeting">{t('activity.meeting')}</SelectItem>
                                            <SelectItem value="proposal_sent">{t('activity.proposal_sent')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder={t('crm.note_placeholder')}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    required
                                />

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isSubmittingNote || !noteContent.trim()}
                                        className="text-xs"
                                    >
                                        {isSubmittingNote ? t('common.saving') : t('crm.add_to_timeline')}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Activity & Notes Timeline */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t('crm.activity_timeline')} ({lead.activities?.length ?? 0})
                            </h4>

                            {(!lead.activities || lead.activities.length === 0) ? (
                                <p className="text-xs text-muted-foreground italic">{t('crm.no_activities')}</p>
                            ) : (
                                <div
                                    className={`relative space-y-4 before:absolute ${
                                        isRtl
                                            ? 'pr-6 before:right-2'
                                            : 'pl-6 before:left-2'
                                    } before:top-2 before:bottom-2 before:w-0.5 before:bg-border`}
                                >
                                    {lead.activities.map((act) => (
                                        <div key={act.id} className="relative group">
                                            <div
                                                className={`absolute top-0.5 flex size-4.5 items-center justify-center rounded-full bg-background border shadow-xs ${
                                                    isRtl ? '-right-6' : '-left-6'
                                                }`}
                                            >
                                                {getActivityIcon(act.type)}
                                            </div>

                                            <div className="rounded-lg border bg-card/60 p-3 shadow-xs">
                                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground">
                                                        {act.user?.name ?? t('common.website_system')}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[11px]">
                                                        <Clock className="size-3" />
                                                        {formatDate(act.created_at, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                                                    {act.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Admin Danger Zone */}
                        {isAdmin && (
                            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h5 className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                                            {t('crm.delete_lead')}
                                        </h5>
                                        <p className="text-[11px] text-muted-foreground">
                                            {t('crm.delete_lead_desc')}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="h-8 text-xs gap-1"
                                    >
                                        <Trash2 className="size-3.5" />
                                        {t('common.delete')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Confirm Delete Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('crm.delete_confirm_title')}</DialogTitle>
                        <DialogDescription>
                            {t('crm.delete_confirm_msg')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteLead}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('common.deleting') : t('crm.delete_permanent')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
