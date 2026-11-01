import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import type { PriorityOption, Service } from '@/types/crm';
import type { User } from '@/types/auth';

interface CreateLeadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    services: Service[];
    priorities: PriorityOption[];
    teamMembers: User[];
}

export function CreateLeadDialog({
    isOpen,
    onClose,
    services,
    priorities,
    teamMembers,
}: CreateLeadDialogProps) {
    const { t, isRtl, localized } = useTranslation();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [priority, setPriority] = useState('high');
    const [assignedTo, setAssignedTo] = useState('unassigned');
    const [internalNotes, setInternalNotes] = useState('');
    const [source, setSource] = useState('direct_call');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setName('');
        setPhone('');
        setEmail('');
        setCompany('');
        setSelectedServiceId('');
        setPriority('high');
        setAssignedTo('unassigned');
        setInternalNotes('');
        setSource('direct_call');
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(
            '/crm',
            {
                name,
                phone,
                email: email || null,
                company: company || null,
                service_id: selectedServiceId ? Number(selectedServiceId) : null,
                priority,
                assigned_to: assignedTo !== 'unassigned' ? Number(assignedTo) : null,
                internal_notes: internalNotes || null,
                source,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    resetForm();
                    onClose();
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('crm.record_dialog_title')}</DialogTitle>
                    <DialogDescription>
                        {t('crm.record_dialog_desc')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-name">
                                {t('crm.client_name')} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="lead-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Eng. Hazem Mansour"
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="lead-phone">
                                {t('crm.mobile_phone')} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="lead-phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. +201012345678"
                                required
                            />
                            {errors.phone && (
                                <p className="text-xs text-destructive">{errors.phone}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-email">{t('crm.email_address')}</Label>
                            <Input
                                id="lead-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="client@company.com"
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="lead-company">{t('crm.company_business')}</Label>
                            <Input
                                id="lead-company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. Al-Noor Medical"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t('crm.service_requested')}</Label>
                        <Select
                            value={selectedServiceId}
                            onValueChange={setSelectedServiceId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('crm.select_service')} />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {isRtl ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label>{t('crm.priority')}</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {isRtl ? p.label_ar : p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>{t('crm.assignee')}</Label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">{t('common.unassigned')}</SelectItem>
                                    {teamMembers.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>{t('crm.source')}</Label>
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="direct_call">{t('crm.source_call')}</SelectItem>
                                    <SelectItem value="whatsapp_direct">{t('crm.source_whatsapp')}</SelectItem>
                                    <SelectItem value="walk_in">{t('crm.source_walk_in')}</SelectItem>
                                    <SelectItem value="referral">{t('crm.source_referral')}</SelectItem>
                                    <SelectItem value="event">{t('crm.source_event')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="lead-notes">{t('crm.initial_notes')}</Label>
                        <textarea
                            id="lead-notes"
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder="Key features discussed, deadlines, or technical notes..."
                            rows={3}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            disabled={isSubmitting}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('common.creating') : t('crm.record_inquiry')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
