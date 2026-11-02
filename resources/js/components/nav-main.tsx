import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/lib/i18n';
import type { NavItem } from '@/types';

export function NavMain({ items }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = useTranslation();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-sidebar-foreground/70 uppercase">
                {t('nav.platform')}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className="h-10 px-3 text-sm font-medium transition-colors"
                        >
                            <Link
                                href={item.href}
                                prefetch
                                cacheFor="2m"
                                className="flex w-full items-center gap-3 text-start"
                            >
                                {item.icon && (
                                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                                )}
                                <span className="flex-1 truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                                    {item.title}
                                </span>
                                {item.badge != null &&
                                    Number(item.badge) > 0 && (
                                        <span className="ms-auto inline-flex items-center justify-center rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-bold text-white shadow-sm ring-1 ring-emerald-400/20 group-data-[collapsible=icon]:hidden">
                                            {item.badge}
                                        </span>
                                    )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
