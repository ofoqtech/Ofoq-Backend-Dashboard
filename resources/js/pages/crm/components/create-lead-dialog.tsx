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
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
    const [priority, setPriority] = useState('high');
    const [assignedTo, setAssignedTo] = useState('unassigned');
    const [internalNotes, setInternalNotes] = useState('');
    const [source, setSource] = useState('direct_call');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const activeService = services.find((s) => String(s.id) === selectedServiceId);
    const availableBudgets = activeService?.budgets ?? [];

    const handleServiceChange = (serviceId: string) => {
        setSelectedServiceId(serviceId);
        setSelectedBudgetId('');
    };

    const resetForm = () => {
        setName('');
        setPhone('');
        setEmail('');
        setCompany('');
        setSelectedServiceId('');
        setSelectedBudgetId('');
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
                service_budget_id: selectedBudgetId ? Number(selectedBudgetId) : null,
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
                    <DialogTitle>Record New Client Inquiry</DialogTitle>
                    <DialogDescription>
                        Manually record an incoming inquiry from a direct call, client meeting, or offline event.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-name">
                                Client Full Name <span className="text-destructive">*</span>
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
                                Mobile / Phone <span className="text-destructive">*</span>
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
                            <Label htmlFor="lead-email">Email Address</Label>
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
                            <Label htmlFor="lead-company">Company / Business</Label>
                            <Input
                                id="lead-company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. Al-Noor Medical"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Service Requested</Label>
                            <Select
                                value={selectedServiceId}
                                onValueChange={handleServiceChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name_en || s.name_ar}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Budget Option</Label>
                            <Select
                                value={selectedBudgetId}
                                onValueChange={setSelectedBudgetId}
                                disabled={!selectedServiceId || availableBudgets.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedServiceId ? "Select Budget" : "Choose Service First"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableBudgets.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            {b.type_en || b.type_ar} ({b.range})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Assign Rep</Label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {teamMembers.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Source</Label>
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="direct_call">Phone Call</SelectItem>
                                    <SelectItem value="whatsapp_direct">Direct WhatsApp</SelectItem>
                                    <SelectItem value="walk_in">Office Walk-in</SelectItem>
                                    <SelectItem value="referral">Referral / Network</SelectItem>
                                    <SelectItem value="event">Tech Event / Exhibition</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="lead-notes">Initial Requirements & Notes</Label>
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
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Record Inquiry'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

