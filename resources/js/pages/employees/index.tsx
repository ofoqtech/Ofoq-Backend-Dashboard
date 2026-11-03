import { useEffect, useRef, useState } from 'react';
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
    canManageRoles?: boolean;
};

export default function EmployeesIndex({
    employees,
    filters,
    canManageEmployees,
    canManageRoles = false,
}: EmployeesIndexProps) {
    const { auth, flash } = usePage<{
        auth: Auth;
        flash?: { success?: string; error?: string };
    }>().props;
    const { t, isRtl } = useTranslation();
    const currentUser = auth.user;

    const [search, setSearch] = useState(filters.search || '');
    const status = filters.status || '';
    const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
    const [roleTargetUser, setRoleTargetUser] = useState<{
        user: User;
        targetRole: 'employee' | 'admin';
    } | null>(null);
    const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

    const isFocusedRef = useRef(false);

    // Keep search in sync only if filters.search changes externally (and user is not actively typing)
    useEffect(() => {
        if (!isFocusedRef.current) {
            setSearch(filters.search || '');
        }
    }, [filters.search]);

    // Handle browser back/forward navigation
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            setSearch(params.get('search') || '');
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Live instant search (fires debounced at 300ms when typing or clearing)
    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = search.trim();
            const currentFilterSearch = (filters.search || '').trim();
            if (trimmed !== currentFilterSearch) {
                router.get(
                    employeesIndex.url(),
                    {
                        search: trimmed || undefined,
                        status: status || undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        only: ['employees', 'filters'],
                    },
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = search.trim();
        router.get(
            employeesIndex.url(),
            { search: trimmed || undefined, status: status || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['employees', 'filters'],
            },
        );
    };

    const confirmDelete = () => {
        if (!employeeToDelete) return;
        router.delete(destroyEmployee.url(employeeToDelete.id), {
            onSuccess: () => setEmployeeToDelete(null),
        });
    };

    const confirmRoleChange = () => {
        if (!roleTargetUser) return;
        const targetId = roleTargetUser.user.id;
        setUpdatingRoleId(targetId);
        router.patch(
            `/employees/${targetId}/role`,
            { role: roleTargetUser.targetRole },
            {
                preserveScroll: true,
                onFinish: () => {
                    setUpdatingRoleId(null);
                    setRoleTargetUser(null);
                },
            },
        );
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
                                    onFocus={() => {
                                        isFocusedRef.current = true;
                                    }}
                                    onBlur={() => {
                                        isFocusedRef.current = false;
                                    }}
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
                                        onClick={() => {
                                            setSearch('');
                                            router.get(
                                                employeesIndex.url(),
                                                { status: status || undefined },
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                    only: [
                                                        'employees',
                                                        'filters',
                                                    ],
                                                },
                                            );
                                        }}
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
                                            router.get(
                                                employeesIndex.url(),
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                    only: [
                                                        'employees',
                                                        'filters',
                                                    ],
                                                },
                                            );
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
                                            {t('employees.system_role')}
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
                                                    canManageEmployees ? 6 : 5
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
                                                            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-primary/10">
                                                                {employee.avatar ? (
                                                                    <img
                                                                        src={
                                                                            employee.avatar
                                                                        }
                                                                        alt={
                                                                            employee.name
                                                                        }
                                                                        className="size-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs font-bold text-primary">
                                                                        {employee.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </span>
                                                                )}
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
                                                        {canManageRoles ? (
                                                            <select
                                                                value={
                                                                    employee.role ||
                                                                    'employee'
                                                                }
                                                                onChange={(e) =>
                                                                    setRoleTargetUser(
                                                                        {
                                                                            user: employee,
                                                                            targetRole:
                                                                                e
                                                                                    .target
                                                                                    .value as
                                                                                    | 'employee'
                                                                                    | 'admin',
                                                                        },
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSelf ||
                                                                    updatingRoleId ===
                                                                        employee.id
                                                                }
                                                                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                <option value="employee">
                                                                    {t(
                                                                        'employees.role_employee_short',
                                                                    )}
                                                                </option>
                                                                <option value="admin">
                                                                    {t(
                                                                        'employees.role_admin_short',
                                                                    )}
                                                                </option>
                                                            </select>
                                                        ) : (
                                                            <Badge
                                                                variant={
                                                                    employee.role ===
                                                                    'admin'
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                                className="gap-1 text-xs"
                                                            >
                                                                {employee.role ===
                                                                'admin'
                                                                    ? t(
                                                                          'employees.role_admin_short',
                                                                      )
                                                                    : t(
                                                                          'employees.role_employee_short',
                                                                      )}
                                                            </Badge>
                                                        )}
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
                                                                {!isSelf &&
                                                                    canManageRoles && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="size-8 p-0 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                                                                            title={
                                                                                employee.role ===
                                                                                'admin'
                                                                                    ? t(
                                                                                          'employees.demote_to_employee',
                                                                                      )
                                                                                    : t(
                                                                                          'employees.promote_to_admin',
                                                                                      )
                                                                            }
                                                                            onClick={() =>
                                                                                setRoleTargetUser(
                                                                                    {
                                                                                        user: employee,
                                                                                        targetRole:
                                                                                            employee.role ===
                                                                                            'admin'
                                                                                                ? 'employee'
                                                                                                : 'admin',
                                                                                    },
                                                                                )
                                                                            }
                                                                        >
                                                                            <ShieldCheck className="size-3.5" />
                                                                            <span className="sr-only">
                                                                                {employee.role ===
                                                                                'admin'
                                                                                    ? t(
                                                                                          'employees.demote_to_employee',
                                                                                      )
                                                                                    : t(
                                                                                          'employees.promote_to_admin',
                                                                                      )}
                                                                            </span>
                                                                        </Button>
                                                                    )}

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

            {/* Change Role Confirmation Modal */}
            <Dialog
                open={!!roleTargetUser}
                onOpenChange={(open) => !open && setRoleTargetUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-amber-500" />
                            {t('employees.change_role_title')}
                        </DialogTitle>
                        <DialogDescription className="space-y-2 pt-2">
                            <p>
                                {isRtl
                                    ? 'هل أنت متأكد من تغيير صلاحية النظام للمستخدم '
                                    : 'Are you sure you want to change the system role for '}
                                <strong>{roleTargetUser?.user.name}</strong>
                                {isRtl ? ' إلى ' : ' to '}
                                <span className="font-semibold text-foreground">
                                    {roleTargetUser?.targetRole === 'admin'
                                        ? t('employees.role_admin')
                                        : t('employees.role_employee')}
                                </span>
                                ؟
                            </p>
                            {roleTargetUser?.targetRole === 'admin' && (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    {isRtl
                                        ? 'سيمنح هذا المستخدم صلاحيات تحكم كاملة بالنظام كمسؤول.'
                                        : 'This will grant full administrative privileges on the platform.'}
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setRoleTargetUser(null)}
                            disabled={updatingRoleId !== null}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant={
                                roleTargetUser?.targetRole === 'admin'
                                    ? 'default'
                                    : 'secondary'
                            }
                            className={
                                roleTargetUser?.targetRole === 'admin'
                                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                                    : ''
                            }
                            onClick={confirmRoleChange}
                            disabled={updatingRoleId !== null}
                        >
                            {t('common.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
