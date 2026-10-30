import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    ChevronRight,
    FolderKanban,
    Globe,
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

type DashboardProps = {
    stats: {
        totalProjects: number;
        totalEmployees: number;
        totalAdmins: number;
        categories: {
            web: number;
            mobile: number;
            erp: number;
        };
    };
    recentProjects: Project[];
    recentEmployees: User[];
};

export default function Dashboard({ stats, recentProjects, recentEmployees }: DashboardProps) {
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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">ERP & Cloud Systems</CardTitle>
                            <Building2 className="text-muted-foreground size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.categories.erp}</div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Enterprise systems
                            </p>
                        </CardContent>
                    </Card>
                </div>

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
                                                        <span className="text-sm font-medium truncate">
                                                            {emp.name}
                                                        </span>
                                                        <Badge
                                                            variant={emp.role === 'admin' ? 'default' : 'secondary'}
                                                            className="text-[10px] px-1 py-0"
                                                        >
                                                            {emp.role}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {emp.display_title || emp.title_en || (typeof emp.title === 'object' ? emp.title?.en : emp.title) || emp.email}
                                                    </p>
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
