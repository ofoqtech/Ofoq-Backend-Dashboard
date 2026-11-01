import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { locale, toggleLocale } = useTranslation();

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className={`h-8 gap-1.5 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ${className}`}
            title={locale === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
        >
            <Languages className="size-3.5 text-[#20B8D5]" />
            <span>{locale === 'en' ? 'العربية' : 'English'}</span>
        </Button>
    );
}

