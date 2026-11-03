import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    ChevronRight,
    FolderKanban,
    Globe,
    Inbox,
    MessageCircle,
    Plus,
    ShieldCheck,
    Smartphone,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import { create as createAdmin } from '@/routes/admins';
import {
    create as createEmployee,
    index as employeesIndex,
} from '@/routes/employees';
import {
    create as createProject,
    edit as editProject,
    index as projectsIndex,
} from '@/routes/projects';
import type { Auth, Project, User } from '@/types';
import type { Lead } from '@/types/crm';

type DashboardProps = {
    stats: {
        totalProjects: number;
        totalEmployees: number;
        totalAdmins: number;
        totalCategories: number;
        totalLeads?: number;
        newLeadsCount?: number;
        categories: {
            web: number;
            mobile: number;
            erp: number;
            [key: string]: number;
        };
    };
    recentProjects: Project[];
    recentEmployees: User[];
    recentLeads?: Lead[];
};

export default function Dashboard({
    stats,
    recentProjects,
    recentEmployees,
    recentLeads = [],
}: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t, localized, isRtl } = useTranslation();
    const user = auth.user;
    const isAdmin = user.role === 'admin';

    const getRoleLabel = (role: string) => {
        if (isRtl) {
            return role === 'admin' ? 'مدير عام' : 'مهندس ومطور';
        }
        return role === 'admin' ? 'Administrator' : 'Employee Staff';
    };

    return (
        <>
            <Head title={t('nav.dashboard')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {t('dashboard.welcome')}, {user.name}
                            </h1>
                            <Badge
                                variant={isAdmin ? 'default' : 'secondary'}
                                className="text-xs font-semibold capitalize"
                            >
                                {getRoleLabel(user.role)}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href="/crm"
                                prefetch
                                cacheFor="2m"
                                className="gap-1.5"
                            >
                                <Inbox className="size-4 text-emerald-500" />
                                {t('dashboard.crm_pipeline')}
                            </Link>
                        </Button>
                        {isAdmin && (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <Link
                                        href={createAdmin()}
                                        prefetch="hover"
                                        cacheFor="1m"
                                        className="gap-1.5"
                                    >
                                        <ShieldCheck className="size-4 text-primary" />
                                        {t('dashboard.add_admin')}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <Link
                                        href={createEmployee()}
                                        prefetch="hover"
                                        cacheFor="1m"
                                        className="gap-1.5"
                                    >
                                        <Users className="size-4" />
                                        {t('dashboard.add_employee')}
                                    </Link>
                                </Button>
                            </>
                        )}
                        <Button asChild size="sm">
                            <Link
                                href={createProject()}
                                prefetch="hover"
                                cacheFor="1m"
                                className="gap-1.5"
                            >
                                <Plus className="size-4" />
                                {t('dashboard.add_project')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* CRM Inquiries Card */}
                    <Card className="relative overflow-hidden border-emerald-500/30 bg-emerald-500/[0.02]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.crm_inquiries')}
                            </CardTitle>
                            <Inbox className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold">
                                    {stats.totalLeads ?? 0}
                                </div>
                                {(stats.newLeadsCount ?? 0) > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        {stats.newLeadsCount}{' '}
                                        {t('dashboard.new_tag')}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('dashboard.recent_inquiries_desc')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.total_projects')}
                            </CardTitle>
                            <FolderKanban className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalProjects}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('dashboard.portfolio_items')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.team_members')}
                            </CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalEmployees}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.totalAdmins}{' '}
                                {t('dashboard.admins_count')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.web_mobile')}
                            </CardTitle>
                            <div className="flex gap-1">
                                <Globe className="size-4 text-muted-foreground" />
                                <Smartphone className="size-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.categories.web + stats.categories.mobile}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.categories.web} {t('dashboard.web')}{' '}
                                &bull; {stats.categories.mobile}{' '}
                                {t('dashboard.mobile')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* CRM Recent Inquiries Section */}
                {recentLeads.length > 0 && (
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle>
                                        {t('dashboard.recent_inquiries')}
                                    </CardTitle>
                                    {(stats.newLeadsCount ?? 0) > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            {stats.newLeadsCount}{' '}
                                            {t('dashboard.awaiting_response')}
                                        </span>
                                    )}
                                </div>
                                <CardDescription>
                                    {t('dashboard.recent_inquiries_desc')}
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link
                                    href="/crm"
                                    prefetch
                                    cacheFor="2m"
                                    className="flex items-center gap-1 text-xs"
                                >
                                    {t('dashboard.open_crm')}{' '}
                                    <ChevronRight className="size-3.5 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border/60">
                                {recentLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600">
                                                {lead.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="truncate text-sm font-semibold text-foreground">
                                                        {lead.name}
                                                    </h3>
                                                    {lead.company && (
                                                        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                                                            &bull;{' '}
                                                            {lead.company}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="truncate">
                                                        {isRtl
                                                            ? lead.service
                                                                  ?.name_ar ||
                                                              lead.service_name_snapshot
                                                            : lead.service
                                                                  ?.name_en ||
                                                              lead.service_name_snapshot}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <span
                                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${lead.status_color}`}
                                            >
                                                {isRtl
                                                    ? lead.status_label_ar
                                                    : lead.status_label}
                                            </span>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-2.5 text-xs"
                                                asChild
                                            >
                                                <a
                                                    href={lead.whatsapp_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-emerald-600"
                                                >
                                                    <MessageCircle className="size-3" />
                                                    {t('dashboard.whatsapp')}
                                                </a>
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2.5 text-xs"
                                                asChild
                                            >
                                                <Link
                                                    href={`/crm?selected=${lead.id}`}
                                                >
                                                    {t('common.details')}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content Grid: Recent Projects & Team */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                    {/* Recent Projects Table/List (4 columns) */}
                    <Card className="lg:col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>
                                    {t('dashboard.recent_projects')}
                                </CardTitle>
                                <CardDescription>
                                    {t('dashboard.recent_projects_desc')}
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link
                                    href={projectsIndex()}
                                    prefetch
                                    cacheFor="2m"
                                    className="flex items-center gap-1 text-xs"
                                >
                                    {t('common.view_all')}{' '}
                                    <ChevronRight className="size-3.5 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border/60">
                                {recentProjects.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        {t('dashboard.no_projects')}
                                    </p>
                                ) : (
                                    recentProjects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                {project.image ? (
                                                    <img
                                                        src={project.image}
                                                        alt={localized(
                                                            project.title,
                                                        )}
                                                        className="size-11 shrink-0 rounded-lg border border-border/70 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                        <Briefcase className="size-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-semibold">
                                                        {localized(
                                                            project.title,
                                                        )}
                                                    </h3>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                        <Badge
                                                            variant="outline"
                                                            className="px-1.5 py-0 text-[10px]"
                                                        >
                                                            {isRtl
                                                                ? project.category_label_ar ||
                                                                  (typeof project.category_label ===
                                                                  'object'
                                                                      ? project
                                                                            .category_label
                                                                            ?.ar
                                                                      : project.category_label) ||
                                                                  project.category
                                                                : project.category_label_en ||
                                                                  (typeof project.category_label ===
                                                                  'object'
                                                                      ? project
                                                                            .category_label
                                                                            ?.en
                                                                      : project.category_label) ||
                                                                  project.category}
                                                        </Badge>
                                                        {project.technologies
                                                            ?.slice(0, 2)
                                                            .map((tech) => (
                                                                <span
                                                                    key={tech}
                                                                    className="rounded bg-secondary/60 px-1.5 py-0 text-[10px] text-muted-foreground"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="ms-2 shrink-0 text-xs"
                                            >
                                                <Link
                                                    href={editProject(
                                                        project.slug,
                                                    )}
                                                >
                                                    {t('common.edit')}
                                                </Link>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members List (3 columns) */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>
                                    {t('dashboard.team_staff')}
                                </CardTitle>
                                <CardDescription>
                                    {t('dashboard.team_staff_desc')}
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link
                                    href={employeesIndex()}
                                    prefetch
                                    cacheFor="2m"
                                    className="flex items-center gap-1 text-xs"
                                >
                                    {t('dashboard.manage')}{' '}
                                    <ChevronRight className="size-3.5 rtl:rotate-180" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border/60">
                                {recentEmployees.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        {t('dashboard.no_team')}
                                    </p>
                                ) : (
                                    recentEmployees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-primary/10">
                                                    {emp.avatar ? (
                                                        <img
                                                            src={emp.avatar}
                                                            alt={emp.name}
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-bold text-primary">
                                                            {emp.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <h4 className="truncate text-sm font-semibold">
                                                            {emp.name}
                                                        </h4>
                                                        <Badge
                                                            variant="secondary"
                                                            className="px-1 py-0 text-[10px] capitalize"
                                                        >
                                                            {getRoleLabel(
                                                                emp.role,
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {isRtl
                                                            ? emp.title_ar ||
                                                              emp.display_title ||
                                                              emp.email
                                                            : emp.title_en ||
                                                              emp.display_title ||
                                                              emp.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`size-2 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                                                    title={
                                                        emp.status === 'active'
                                                            ? t('common.active')
                                                            : t(
                                                                  'common.inactive',
                                                              )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
