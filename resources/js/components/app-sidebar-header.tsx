import { ExternalLink, Globe, Moon, Sun } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 md:hidden rtl:-mr-1 rtl:ml-0" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                <NotificationBell />

                <LanguageSwitcher />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="size-8 p-0 text-muted-foreground hover:text-foreground"
                    title={`Switch to ${resolvedAppearance === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                    {resolvedAppearance === 'dark' ? (
                        <Sun className="size-4 text-amber-400" />
                    ) : (
                        <Moon className="size-4 text-slate-600" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>

                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    <a
                        href="https://ofoqpro.tech/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5"
                        title="Open Ofoq Frontend Website"
                    >
                        <Globe className="size-3.5 text-[#20B8D5]" />
                        <span className="hidden sm:inline">Ofoq Website</span>
                        <ExternalLink className="size-3 opacity-60" />
                    </a>
                </Button>
            </div>
        </header>
    );
}
