import { Sparkles, Send, Check } from 'lucide-react';
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
import type { WhatsAppConversation, WhatsAppTemplate } from '@/types/whatsapp';

interface TemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversation: WhatsAppConversation;
    templates: WhatsAppTemplate[];
    onTemplateSent: () => void;
    isRtl?: boolean;
}

export function TemplateDialog({
    open,
    onOpenChange,
    conversation,
    templates,
    onTemplateSent,
    isRtl,
}: TemplateDialogProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(
        templates[0] || null
    );
    const [paramValues, setParamValues] = useState<Record<string, string>>({});
    const [isSending, setIsSending] = useState(false);

    // Reset or pre-fill parameters when selecting a template
    const handleSelectTemplate = (tpl: WhatsAppTemplate) => {
        setSelectedTemplate(tpl);
        const initialParams: Record<string, string> = {};
        // Match {{1}}, {{2}}, etc.
        const matches = tpl.body_text.match(/{{\d+}}/g) || [];
        matches.forEach((m, idx) => {
            const key = m.replace(/[{}]/g, '');
            // Pre-fill {{1}} with contact/lead name if available
            if (key === '1') {
                initialParams[key] = conversation.lead?.name || conversation.contact.profile_name || '';
            } else {
                initialParams[key] = tpl.example_parameters?.[idx] || '';
            }
        });
        setParamValues(initialParams);
    };

    // Replace {{1}}, {{2}} in preview
    const renderPreview = () => {
        if (!selectedTemplate) return '';
        let text = selectedTemplate.body_text;
        Object.entries(paramValues).forEach(([key, val]) => {
            text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `[${key}]`);
        });
        return text;
    };

    const handleSend = async () => {
        if (!selectedTemplate || isSending) return;

        setIsSending(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/crm/whatsapp/conversations/${conversation.id}/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    template_name: selectedTemplate.name,
                    language: selectedTemplate.language,
                    parameters: Object.values(paramValues),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send template');

            toast.success(isRtl ? 'تم إرسال النموذج بنجاح' : 'Template sent successfully');
            onOpenChange(false);
            onTemplateSent();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Error sending template');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <Sparkles className="size-4 text-purple-600" />
                        <span>{isRtl ? 'إرسال نموذج واتساب معتمد' : 'Send Approved WhatsApp Template'}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {isRtl
                            ? 'يمكنك استخدام النماذج المعتمدة لبدء محادثة جديدة أو متابعة العملاء وفق سياسات ميتا الرسمية.'
                            : 'Use approved WhatsApp Cloud API templates for initial contact and follow-ups per Meta policies.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                    {/* Templates List */}
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        <Label className="text-xs font-semibold text-neutral-500">
                            {isRtl ? 'اختر النموذج' : 'Select Template'}
                        </Label>
                        {templates.length === 0 ? (
                            <div className="p-4 text-center text-xs text-neutral-400 border rounded-xl">
                                {isRtl ? 'لا توجد نماذج معتمدة حالياً' : 'No approved templates found'}
                            </div>
                        ) : (
                            templates.map((tpl) => {
                                const isCurrent = selectedTemplate?.id === tpl.id;
                                return (
                                    <div
                                        key={tpl.id}
                                        onClick={() => handleSelectTemplate(tpl)}
                                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                            isCurrent
                                                ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30'
                                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                                {tpl.name}
                                            </span>
                                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                                                {tpl.language}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-500 line-clamp-2">
                                            {tpl.body_text}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Preview & Parameter Inputs */}
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-neutral-500">
                            {isRtl ? 'معاينة ومتغيرات النموذج' : 'Preview & Variables'}
                        </Label>

                        {/* WhatsApp-style Bubble Preview */}
                        <div className="rounded-2xl bg-emerald-600 text-white p-3 text-xs shadow-sm">
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {renderPreview() || (isRtl ? 'اختر نموذجاً للمعاينة' : 'Select template to preview')}
                            </p>
                            {selectedTemplate?.footer_text && (
                                <p className="text-[10px] text-emerald-100/70 mt-1.5 border-t border-emerald-500/40 pt-1">
                                    {selectedTemplate.footer_text}
                                </p>
                            )}
                        </div>

                        {/* Parameter Inputs */}
                        {Object.keys(paramValues).length > 0 && (
                            <div className="space-y-2 max-h-36 overflow-y-auto">
                                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 block">
                                    {isRtl ? 'قيم المتغيرات' : 'Variable Values'}
                                </span>
                                {Object.keys(paramValues).map((key) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-neutral-400 w-8 shrink-0">
                                            {`{{${key}}}`}
                                        </span>
                                        <Input
                                            type="text"
                                            value={paramValues[key]}
                                            onChange={(e) =>
                                                setParamValues({
                                                    ...paramValues,
                                                    [key]: e.target.value,
                                                })
                                            }
                                            className="h-8 text-xs"
                                            placeholder={`Value for {{${key}}}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
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
                        type="button"
                        size="sm"
                        onClick={handleSend}
                        disabled={isSending || !selectedTemplate}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                    >
                        {isSending ? <Spinner className="size-3.5" /> : <Send className="size-3.5" />}
                        <span>{isRtl ? 'إرسال النموذج الآن' : 'Send Template'}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

