import { useTranslation } from '@/lib/i18n';

export default function AppLogo() {
    const { isRtl } = useTranslation();

    return (
        <div className="flex items-center gap-2.5 py-1">
            <img
                src="/logo dark.jpeg"
                alt="Ofoq Technology"
                className="size-8 shrink-0 rounded-lg border border-white/20 bg-white/10 object-contain p-0.5"
            />
            <div className="flex min-w-0 flex-col text-start">
                <span className="truncate text-sm leading-tight font-bold tracking-tight text-sidebar-foreground">
                    {isRtl ? 'شركة أفق للتكنولوجيا' : 'Ofoq Technology'}
                </span>
                <span className="text-xs font-medium tracking-wide text-sidebar-primary">
                    {isRtl ? 'لوحة إدارة العمليات' : 'Operations Dashboard'}
                </span>
            </div>
        </div>
    );
}
