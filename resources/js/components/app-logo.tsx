import { useTranslation } from '@/lib/i18n';

export default function AppLogo() {
    const { isRtl } = useTranslation();

    return (
        <div className="flex items-center gap-2.5 py-1">
            <img
                src="/logo dark.jpeg"
                alt="Ofoq Technology"
                className="size-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20 shrink-0"
            />
            <div className="flex flex-col text-start min-w-0">
                <span className="text-sm font-bold leading-tight tracking-tight text-sidebar-foreground truncate">
                    {isRtl ? 'شركة أفق للتكنولوجيا' : 'Ofoq Technology'}
                </span>
                <span className="text-xs text-sidebar-primary font-medium tracking-wide">
                    {isRtl ? 'لوحة إدارة العمليات' : 'Operations Dashboard'}
                </span>
            </div>
        </div>
    );
}
