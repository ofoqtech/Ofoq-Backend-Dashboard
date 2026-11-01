import { Link, usePage } from '@inertiajs/react';
import {
    FolderKanban,
    FolderTree,
    Inbox,
    LayoutGrid,
    ShieldCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import { index as adminsIndex } from '@/routes/admins';
import { index as employeesIndex } from '@/routes/employees';
import { index as projectsIndex } from '@/routes/projects';
import type { Auth, NavItem } from '@/types';

export function AppSidebar() {
    const { auth, crm } = usePage<{
        auth: Auth;
        crm?: { newLeadsCount?: number };
    }>().props;
    const { t, isRtl } = useTranslation();
    const isAdmin = auth?.user?.role === 'admin';

    const mainNavItems: NavItem[] = [
        {
            title: t('nav.dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('nav.crm'),
            href: '/crm',
            icon: Inbox,
            badge: crm?.newLeadsCount ?? 0,
        },
        ...(isAdmin
            ? [
                  {
                      title: t('nav.admins'),
                      href: adminsIndex(),
                      icon: ShieldCheck,
                  },
              ]
            : []),
        {
            title: t('nav.employees'),
            href: employeesIndex(),
            icon: Users,
        },
        ...(isAdmin
            ? [
                  {
                      title: t('nav.categories'),
                      href: '/categories',
                      icon: FolderTree,
                  },
              ]
            : []),
        {
            title: t('nav.projects'),
            href: projectsIndex(),
            icon: FolderKanban,
        },
    ];

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            side={isRtl ? 'right' : 'left'}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch cacheFor="2m">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
