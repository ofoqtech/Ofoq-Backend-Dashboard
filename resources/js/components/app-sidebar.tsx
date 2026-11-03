import { usePage } from '@inertiajs/react';
import {
    Bell,
    FolderKanban,
    FolderTree,
    Inbox,
    LayoutGrid,
    ShieldCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
    useSidebar,
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
    const { toggleSidebar } = useSidebar();
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
        {
            title: t('nav.notifications'),
            href: '/notifications',
            icon: Bell,
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
                        <SidebarMenuButton
                            size="lg"
                            onClick={toggleSidebar}
                            className="cursor-pointer transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.98]"
                            tooltip={{
                                children: isRtl
                                    ? 'تبديل القائمة الجانبية'
                                    : 'Toggle Sidebar',
                            }}
                        >
                            <AppLogo />
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
