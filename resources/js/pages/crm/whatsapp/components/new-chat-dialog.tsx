import { MessageSquarePlus, Phone, User, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { Spinner } from '@/components/ui/spinner';

interface NewChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConversationCreated: (conversationId: number) => void;
    isRtl?: boolean;
}

export function NewChatDialog({
    open,
    onOpenChange,
    onConversationCreated,
    isRtl,
}: NewChatDialogProps) {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [initialMessage, setInitialMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedPhone = phone.trim();
        if (!trimmedPhone) {
            toast.error(isRtl ? 'يرجى إدخال رقم الهاتف' : 'Please enter a phone number');
            return;
        }

        setIsSubmitting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/crm/whatsapp/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    phone: trimmedPhone,
                    name: name.trim() || undefined,
                    initial_message: initialMessage.trim() || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to start conversation');

            toast.success(isRtl ? 'تم بدء المحادثة بنجاح' : 'Conversation started successfully');
            onOpenChange(false);
            setPhone('');
            setName('');
            setInitialMessage('');

            if (data.conversation?.id) {
                onConversationCreated(data.conversation.id);
            }
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Error creating conversation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <MessageSquarePlus className="size-4 text-emerald-600" />
                        <span>{isRtl ? 'بدء محادثة واتساب جديدة' : 'Start New WhatsApp Conversation'}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {isRtl
                            ? 'أدخل رقم هاتف العميل بالصيغة الدولية أو المحلية للبدء في التواصل الفوري عبر واتساب.'
                            : 'Enter customer phone number in international format (+20... or 01...) to start direct messaging.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
                    <div>
                        <Label htmlFor="wa-phone" className="text-xs font-semibold">
                            {isRtl ? 'رقم الهاتف (واتساب)' : 'WhatsApp Phone Number'} *
                        </Label>
                        <div className="relative mt-1.5">
                            <Phone className={`absolute top-2.5 size-4 text-neutral-400 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
                            <Input
                                id="wa-phone"
                                type="text"
                                dir="ltr"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+20 101 234 5678"
                                required
                                className={`text-xs ${isRtl ? 'pr-9 text-right' : 'pl-9 text-left'}`}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="wa-name" className="text-xs font-semibold">
                            {isRtl ? 'اسم جهة الاتصال / العميل (اختياري)' : 'Contact Name (Optional)'}
                        </Label>
                        <div className="relative mt-1.5">
                            <User className={`absolute top-2.5 size-4 text-neutral-400 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
                            <Input
                                id="wa-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={isRtl ? 'أحمد محمد' : 'John Doe'}
                                className={`text-xs ${isRtl ? 'pr-9' : 'pl-9'}`}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="wa-initial-msg" className="text-xs font-semibold">
                            {isRtl ? 'رسالة افتتاحية (اختياري)' : 'Initial Message (Optional)'}
                        </Label>
                        <textarea
                            id="wa-initial-msg"
                            rows={3}
                            value={initialMessage}
                            onChange={(e) => setInitialMessage(e.target.value)}
                            placeholder={
                                isRtl
                                    ? 'مرحباً، نتواصل معك من شركة أفق للبرمجيات...'
                                    : 'Hello, this is Ofoq Technology following up...'
                            }
                            className="mt-1.5 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="text-xs"
                        >
                            {isRtl ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !phone.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                        >
                            {isSubmitting ? <Spinner className="size-3.5" /> : <Send className="size-3.5" />}
                            <span>{isRtl ? 'بدء المحادثة الآن' : 'Start Chat'}</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

