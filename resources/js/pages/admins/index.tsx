import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Edit3,
    Mail,
    Phone,
    Plus,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Trash2,
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
    create as createAdmin,
    destroy as destroyAdmin,
    edit as editAdmin,
    index as adminsIndex,
} from '@/routes/admins';
import type { PaginatedData, User } from '@/types';

type AdminsIndexProps = {
    admins: PaginatedData<User>;
    filters: {
        search: string;
        status: string;
    };
    currentAdminId: number;
};

export default function AdminsIndex({
    admins,
    filters,
    currentAdminId,
}: AdminsIndexProps) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;
    const { t, isRtl } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const status = filters.status || '';
    const [adminToDelete, setAdminToDelete] = useState<User | null>(null);

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
                    adminsIndex.url(),
                    {
                        search: trimmed || undefined,
                        status: status || undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        only: ['admins', 'filters'],
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
            adminsIndex.url(),
            { search: trimmed || undefined, status: status || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['admins', 'filters'],
            },
        );
    };

    const confirmDelete = () => {
        if (!adminToDelete) return;
        router.delete(destroyAdmin.url(adminToDelete.id), {
            onSuccess: () => setAdminToDelete(null),
        });
    };

    const getAdminTitle = (admin: User | null | undefined) => {
        if (!admin) return '';
        if (isRtl) {
            return (
                admin.title_ar ||
                (typeof admin.title === 'object' ? admin.title?.ar : '') ||
                admin.title_en ||
                (typeof admin.title === 'object'
                    ? admin.title?.en
                    : admin.title) ||
                'مدير النظام'
            );
        }
        return (
            admin.title_en ||
            (typeof admin.title === 'object' ? admin.title?.en : admin.title) ||
            'System Administrator'
        );
    };

    const totalAdminsCount = admins.total;

    return (
        <>
            <Head title={t('admins.title')} />

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
                                {t('admins.title')}
                            </h1>
                            <Badge
                                variant="secondary"
                                className="gap-1 border-amber-500/20 bg-amber-500/10 text-amber-600"
                            >
                                <ShieldCheck className="size-3" />
                                {t('admins.security_access')}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('admins.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button asChild size="sm">
                            <Link
                                href={createAdmin()}
                                prefetch="hover"
                                cacheFor="1m"
                            >
                                <Plus
                                    className={`size-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`}
                                />
                                {t('admins.add_admin')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Search Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            {t('admins.filter_title')}
                        </CardTitle>
                        <CardDescription>
                            {t('admins.filter_desc')}
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
                                    placeholder={t('admins.search_placeholder')}
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
                                                adminsIndex.url(),
                                                { status: status || undefined },
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                    only: ['admins', 'filters'],
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
                                                adminsIndex.url(),
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                    only: ['admins', 'filters'],
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

                {/* Admins Table Card */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-sm">
                                <thead className="border-b bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('admins.admin_col')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('admins.title_col')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('common.phone')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('common.status')}
                                        </th>
                                        <th className="px-6 py-3.5 text-end">
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {admins.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-10 text-center text-muted-foreground"
                                            >
                                                {t('admins.no_admins_found')}
                                            </td>
                                        </tr>
                                    ) : (
                                        admins.data.map((admin) => {
                                            const isSelf =
                                                currentAdminId === admin.id;

                                            return (
                                                <tr
                                                    key={admin.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-6 py-4 text-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
                                                                {admin.avatar ? (
                                                                    <img
                                                                        src={
                                                                            admin.avatar
                                                                        }
                                                                        alt={
                                                                            admin.name
                                                                        }
                                                                        className="size-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Shield className="size-4" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                                    {admin.name}
                                                                    {isSelf && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="h-4 border-primary px-1.5 py-0 text-[10px] text-primary"
                                                                        >
                                                                            {t(
                                                                                'common.you',
                                                                            )}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Mail className="size-3" />
                                                                    {
                                                                        admin.email
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        <div className="text-xs font-medium text-foreground">
                                                            {getAdminTitle(
                                                                admin,
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        {admin.phone ? (
                                                            <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                                                                <Phone className="size-3" />
                                                                {admin.phone}
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
                                                                admin.status ===
                                                                'active'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className={`gap-1 text-xs capitalize ${
                                                                admin.status ===
                                                                'active'
                                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`size-1.5 rounded-full ${
                                                                    admin.status ===
                                                                    'active'
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-muted-foreground'
                                                                }`}
                                                            />
                                                            {admin.status ===
                                                            'active'
                                                                ? t(
                                                                      'common.active',
                                                                  )
                                                                : t(
                                                                      'common.inactive',
                                                                  )}
                                                        </Badge>
                                                    </td>

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
                                                                    href={editAdmin(
                                                                        admin.id,
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

                                                            {!isSelf &&
                                                                totalAdminsCount >
                                                                    1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="size-8 p-0 text-muted-foreground hover:text-destructive"
                                                                        title={t(
                                                                            'common.delete',
                                                                        )}
                                                                        onClick={() =>
                                                                            setAdminToDelete(
                                                                                admin,
                                                                            )
                                                                        }
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
                {admins.last_page > 1 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                            {t('common.showing')} {admins.from} {t('common.to')}{' '}
                            {admins.to} {t('common.of')} {admins.total}{' '}
                            {t('nav.admins')}
                        </div>
                        <div className="flex gap-2">
                            {admins.links.map((link, idx) => (
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
                open={!!adminToDelete}
                onOpenChange={(open) => !open && setAdminToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <div className="mb-1 flex items-center gap-2 text-destructive">
                            <ShieldAlert className="size-5" />
                            <DialogTitle>{t('common.confirm')}</DialogTitle>
                        </div>
                        <DialogDescription>
                            Are you sure you want to revoke administrative
                            access and delete{' '}
                            <strong>{adminToDelete?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setAdminToDelete(null)}
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

AdminsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Administrators',
            href: adminsIndex(),
        },
    ],
};
