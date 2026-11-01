import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    Calendar,
    ChevronRight,
    FolderKanban,
    Globe,
    Inbox,
    MessageCircle,
    Phone,
    Plus,
    ShieldCheck,
    Smartphone,
    UserCheck,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { create as createAdmin } from '@/routes/admins';
import { create as createEmployee, index as employeesIndex } from '@/routes/employees';
import { create as createProject, edit as editProject, index as projectsIndex } from '@/routes/projects';
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

export default function Dashboard({ stats, recentProjects, recentEmployees, recentLeads = [] }: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const isAdmin = user.role === 'admin';

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Welcome back, {user.name}
                            </h1>
                            <Badge variant={isAdmin ? 'default' : 'secondary'} className="capitalize">
                                {user.role_label || user.role}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage Ofoq Tech projects, team members, and client delivery operations.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/crm">
                                <Inbox className="mr-1.5 size-4 text-emerald-500" />
                                CRM Pipeline
                            </Link>
                        </Button>
                        {isAdmin && (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={createAdmin()}>
                                        <ShieldCheck className="mr-1.5 size-4 text-primary" />
                                        Add Admin
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={createEmployee()}>
                                        <Users className="mr-1.5 size-4" />
                                        Add Employee
                                    </Link>
                                </Button>
                            </>
                        )}
                        <Button asChild size="sm">
                            <Link href={createProject()}>
                                <Plus className="mr-1.5 size-4" />
                                Add Project
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* CRM Inquiries Card */}
                    <Card className="relative overflow-hidden border-emerald-500/30 bg-emerald-500/[0.02]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">CRM Inquiries</CardTitle>
                            <Inbox className="text-emerald-500 size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold">{stats.totalLeads ?? 0}</div>
                                {(stats.newLeadsCount ?? 0) > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        {stats.newLeadsCount} new
                                    </span>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Client inquiries via website & CRM
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <FolderKanban className="text-muted-foreground size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProjects}</div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Portfolio showcase items
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                            <Users className="text-muted-foreground size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {stats.totalAdmins} admin{stats.totalAdmins !== 1 ? 's' : ''} with full system access
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Web & Mobile Apps</CardTitle>
                            <div className="flex gap-1">
                                <Globe className="text-muted-foreground size-4" />
                                <Smartphone className="text-muted-foreground size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.categories.web + stats.categories.mobile}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {stats.categories.web} Web &bull; {stats.categories.mobile} Mobile
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
                                    <CardTitle>Recent Client Inquiries</CardTitle>
                                    {(stats.newLeadsCount ?? 0) > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            {stats.newLeadsCount} awaiting response
                                        </span>
                                    )}
                                </div>
                                <CardDescription>
                                    Incoming requests submitted through the &quot;Get In Touch&quot; website form
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/crm" className="flex items-center gap-1 text-xs">
                                    Open CRM <ChevronRight className="size-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border/60">
                                {recentLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold truncate text-foreground">
                                                        {lead.name}
                                                    </h3>
                                                    {lead.company && (
                                                        <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                                                            &bull; {lead.company}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                    <span className="truncate">
                                                        {lead.service_name_snapshot || lead.service?.name_en || 'General Solution'}
                                                    </span>
                                                    {lead.budget_range_snapshot && (
                                                        <>
                                                            <span>&bull;</span>
                                                            <span className="truncate text-[11px]">
                                                                {lead.budget_range_snapshot}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span
                                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${lead.status_color}`}
                                            >
                                                {lead.status_label}
                                            </span>

                                            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" asChild>
                                                <a
                                                    href={lead.whatsapp_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-emerald-600"
                                                >
                                                    <MessageCircle className="size-3" />
                                                    WhatsApp
                                                </a>
                                            </Button>

                                            <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs" asChild>
                                                <Link href={`/crm?selected=${lead.id}`}>
                                                    Details
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
                                <CardTitle>Recent Projects</CardTitle>
                                <CardDescription>Latest portfolio entries added to the platform</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={projectsIndex()} className="flex items-center gap-1 text-xs">
                                    View all <ChevronRight className="size-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border/60">
                                {recentProjects.length === 0 ? (
                                    <p className="text-muted-foreground py-6 text-center text-sm">
                                        No projects found yet.
                                    </p>
                                ) : (
                                    recentProjects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {project.image ? (
                                                    <img
                                                        src={project.image}
                                                        alt={typeof project.title === 'object' ? project.title.en || project.title.ar : project.title}
                                                        className="size-11 rounded-lg object-cover border border-border/70 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="size-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                        <Briefcase className="size-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold truncate">
                                                        {project.title_en || (typeof project.title === 'object' ? project.title.en : project.title)}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground truncate" dir="rtl">
                                                        {project.title_ar || (typeof project.title === 'object' ? project.title.ar : '')}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                            {project.category_label_en || (typeof project.category_label === 'object' ? project.category_label.en : project.category_label) || project.category}
                                                        </Badge>
                                                        {project.technologies?.slice(0, 2).map((tech) => (
                                                            <span
                                                                key={tech}
                                                                className="text-[10px] text-muted-foreground bg-secondary/60 rounded px-1.5 py-0"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button asChild variant="outline" size="sm" className="ml-2 shrink-0 text-xs">
                                                <Link href={editProject(project.slug)}>
                                                    Edit
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
                                <CardTitle>Team & Staff</CardTitle>
                                <CardDescription>Active employees and administrators</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={employeesIndex()} className="flex items-center gap-1 text-xs">
                                    Manage <ChevronRight className="size-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border/60">
                                {recentEmployees.length === 0 ? (
                                    <p className="text-muted-foreground py-6 text-center text-sm">
                                        No team members registered yet.
                                    </p>
                                ) : (
                                    recentEmployees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <h4 className="text-sm font-semibold truncate">{emp.name}</h4>
                                                        <Badge variant="secondary" className="text-[10px] px-1 py-0 capitalize">
                                                            {emp.role_label || emp.role}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">{emp.display_title || emp.title_en || emp.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`size-2 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                                                    title={emp.status}
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
