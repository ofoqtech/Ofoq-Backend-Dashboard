import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Edit3,
    Mail,
    Phone,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    Users,
    X,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import {
    create as createEmployee,
    destroy as destroyEmployee,
    edit as editEmployee,
    index as employeesIndex,
} from '@/routes/employees';
import type { Auth, PaginatedData, User } from '@/types';

type EmployeesIndexProps = {
    employees: PaginatedData<User>;
    filters: {
        search: string;
        status: string;
    };
    canManageEmployees: boolean;
};

export default function EmployeesIndex({
    employees,
    filters,
    canManageEmployees,
}: EmployeesIndexProps) {
    const { auth, flash } = usePage<{
        auth: Auth;
        flash?: { success?: string; error?: string };
    }>().props;
    const { t, isRtl, localized } = useTranslation();
    const currentUser = auth.user;

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);

    // Keep search in sync if filters.search changes externally
    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    // Live instant search (fires debounced at 250ms when typing or clearing)
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentFilterSearch = filters.search || '';
            if (search.trim() !== currentFilterSearch.trim()) {
                router.get(
                    employeesIndex.url(),
                    {
                        search: search.trim() || undefined,
                        status: status || undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [search, status]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            employeesIndex.url(),
            { search: search.trim() || undefined, status: status || undefined },
            { preserveState: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!employeeToDelete) return;
        router.delete(destroyEmployee.url(employeeToDelete.id), {
            onSuccess: () => setEmployeeToDelete(null),
        });
    };

    const getEmployeeTitle = (emp: User | null | undefined) => {
        if (!emp) return '—';
        if (isRtl) {
            return (
                emp.title_ar ||
                (typeof emp.title === 'object' ? emp.title?.ar : '') ||
                emp.display_title ||
                emp.title_en ||
                '—'
            );
        }
        return (
            emp.title_en ||
            (typeof emp.title === 'object' ? emp.title?.en : emp.title) ||
            emp.display_title ||
            '—'
        );
    };

    return (
        <>
            <Head title={t('employees.title')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Flash Notifications */}
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {t('employees.title')}
                            </h1>
                            <Badge variant="secondary" className="gap-1">
                                <Users className="size-3" />
                                {t('employees.staff_roster')}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('employees.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {canManageEmployees && (
                            <Button asChild size="sm">
                                <Link
                                    href={createEmployee()}
                                    prefetch="hover"
                                    cacheFor="1m"
                                >
                                    <Plus
                                        className={`size-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`}
                                    />
                                    {t('employees.add_employee')}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            {t('employees.filter_title')}
                        </CardTitle>
                        <CardDescription>
                            {t('employees.filter_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-3 sm:flex-row sm:items-center"
                        >
                            <div className="relative flex-1">
                                <Search
                                    className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${
                                        isRtl ? 'right-3' : 'left-3'
                                    }`}
                                />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t(
                                        'employees.search_placeholder',
                                    )}
                                    className={
                                        isRtl ? 'pr-9 pl-8' : 'pr-8 pl-9'
                                    }
                                    autoComplete="off"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className={`absolute top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
                                            isRtl ? 'left-2.5' : 'right-2.5'
                                        }`}
                                        title={t('common.clear')}
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    size="sm"
                                >
                                    {t('common.search')}
                                </Button>
                                {search && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(employeesIndex.url());
                                        }}
                                    >
                                        {t('common.reset')}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Employees Table Card */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-sm">
                                <thead className="border-b bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('common.name')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('employees.job_title')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('common.phone')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('common.status')}
                                        </th>
                                        {canManageEmployees && (
                                            <th className="px-6 py-3.5 text-end">
                                                {t('common.actions')}
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {employees.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    canManageEmployees ? 5 : 4
                                                }
                                                className="px-6 py-10 text-center text-muted-foreground"
                                            >
                                                {t(
                                                    'employees.no_employees_found',
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.data.map((employee) => {
                                            const isSelf =
                                                currentUser.id === employee.id;

                                            return (
                                                <tr
                                                    key={employee.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-6 py-4 text-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                                {employee.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                                    {
                                                                        employee.name
                                                                    }
                                                                    {isSelf && (
                                                                        <span className="text-[10px] font-normal text-muted-foreground">
                                                                            (
                                                                            {t(
                                                                                'common.you',
                                                                            )}
                                                                            )
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Mail className="size-3" />
                                                                    {
                                                                        employee.email
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        <div className="text-xs font-medium text-foreground">
                                                            {getEmployeeTitle(
                                                                employee,
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        {employee.phone ? (
                                                            <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                                                                <Phone className="size-3" />
                                                                {employee.phone}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/60">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        <Badge
                                                            variant={
                                                                employee.status ===
                                                                'active'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className={`gap-1 text-xs capitalize ${
                                                                employee.status ===
                                                                'active'
                                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`size-1.5 rounded-full ${
                                                                    employee.status ===
                                                                    'active'
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-muted-foreground'
                                                                }`}
                                                            />
                                                            {employee.status ===
                                                            'active'
                                                                ? t(
                                                                      'common.active',
                                                                  )
                                                                : t(
                                                                      'common.inactive',
                                                                  )}
                                                        </Badge>
                                                    </td>

                                                    {canManageEmployees && (
                                                        <td className="px-6 py-4 text-end">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Button
                                                                    asChild
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="size-8 p-0"
                                                                    title={t(
                                                                        'common.edit',
                                                                    )}
                                                                >
                                                                    <Link
                                                                        href={editEmployee(
                                                                            employee.id,
                                                                        )}
                                                                    >
                                                                        <Edit3 className="size-3.5" />
                                                                        <span className="sr-only">
                                                                            {t(
                                                                                'common.edit',
                                                                            )}
                                                                        </span>
                                                                    </Link>
                                                                </Button>

                                                                {!isSelf && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="size-8 p-0 text-muted-foreground hover:text-destructive"
                                                                        onClick={() =>
                                                                            setEmployeeToDelete(
                                                                                employee,
                                                                            )
                                                                        }
                                                                        title={t(
                                                                            'common.delete',
                                                                        )}
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                        <span className="sr-only">
                                                                            {t(
                                                                                'common.delete',
                                                                            )}
                                                                        </span>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {employees.last_page > 1 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                            {t('common.showing')} {employees.from}{' '}
                            {t('common.to')} {employees.to} {t('common.of')}{' '}
                            {employees.total} {t('nav.employees')}
                        </div>
                        <div className="flex gap-2">
                            {employees.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    asChild
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                >
                                    <Link
                                        href={link.url || '#'}
                                        prefetch="hover"
                                        cacheFor="1m"
                                        preserveScroll
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog
                open={!!employeeToDelete}
                onOpenChange={(open) => !open && setEmployeeToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('common.confirm')}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{employeeToDelete?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setEmployeeToDelete(null)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            {t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EmployeesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Employees',
            href: employeesIndex(),
        },
    ],
};
