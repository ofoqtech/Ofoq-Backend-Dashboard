import { useEffect, useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import {
    create as createAdmin,
    destroy as destroyAdmin,
    edit as editAdmin,
    index as adminsIndex,
} from '@/routes/admins';
import type { Auth, PaginatedData, User } from '@/types';

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
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [adminToDelete, setAdminToDelete] = useState<User | null>(null);

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
                    adminsIndex.url(),
                    { search: search.trim() || undefined, status: status || undefined },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [search, status]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            adminsIndex.url(),
            { search: search.trim() || undefined, status: status || undefined },
            { preserveState: true, replace: true }
        );
    };

    const confirmDelete = () => {
        if (!adminToDelete) return;
        router.delete(destroyAdmin.url(adminToDelete.id), {
            onSuccess: () => setAdminToDelete(null),
        });
    };

    const totalAdminsCount = admins.total;

    return (
        <>
            <Head title="System Administrators - Ofoq Technology" />

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
                                System Administrators
                            </h1>
                            <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                                <ShieldCheck className="size-3" />
                                Admin Authority
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage users with full administration privileges across the entire dashboard.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button asChild size="sm">
                            <Link href={createAdmin()}>
                                <Plus className="mr-1.5 size-4" />
                                Add Administrator
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Search Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Filter Administrators</CardTitle>
                        <CardDescription>Search by administrator name, email, or job title</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by administrator name, email, or job title..."
                                    className="pl-9 pr-8"
                                    autoComplete="off"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        title="Clear search"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button type="submit" variant="secondary" size="sm">
                                    Search
                                </Button>
                                {search && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(adminsIndex.url());
                                        }}
                                    >
                                        Reset
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
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Administrator</th>
                                        <th className="px-6 py-3.5">Title (Arabic & English)</th>
                                        <th className="px-6 py-3.5">Contact</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {admins.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                                                No administrators found matching the criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        admins.data.map((admin) => {
                                            const isSelf = currentAdminId === admin.id;

                                            return (
                                                <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-amber-500/20">
                                                                <Shield className="size-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                                    {admin.name}
                                                                    {isSelf && (
                                                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-primary text-primary">
                                                                            You
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                    <Mail className="size-3" />
                                                                    {admin.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="space-y-0.5">
                                                            <div className="font-medium text-foreground text-xs">
                                                                {admin.title_en || (typeof admin.title === 'object' ? admin.title?.en : admin.title) || 'System Administrator'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-arabic" dir="rtl">
                                                                {admin.title_ar || (typeof admin.title === 'object' ? admin.title?.ar : '') || 'مدير النظام'}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {admin.phone ? (
                                                            <span className="text-xs flex items-center gap-1 text-muted-foreground font-mono">
                                                                <Phone className="size-3" />
                                                                {admin.phone}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/60">—</span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant={admin.status === 'active' ? 'default' : 'secondary'}
                                                            className={`gap-1 text-xs capitalize ${
                                                                admin.status === 'active'
                                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`size-1.5 rounded-full ${
                                                                    admin.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'
                                                                }`}
                                                            />
                                                            {admin.status}
                                                        </Badge>
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button asChild variant="ghost" size="sm" className="size-8 p-0" title="Edit Administrator">
                                                                <Link href={editAdmin(admin.id)}>
                                                                    <Edit3 className="size-3.5" />
                                                                    <span className="sr-only">Edit</span>
                                                                </Link>
                                                            </Button>

                                                            {!isSelf && totalAdminsCount > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="size-8 p-0 text-muted-foreground hover:text-destructive"
                                                                    title="Delete Administrator"
                                                                    onClick={() => setAdminToDelete(admin)}
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    <span className="sr-only">Delete</span>
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
                            Showing {admins.from} to {admins.to} of {admins.total} administrators
                        </div>
                        <div className="flex gap-2">
                            {admins.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    asChild
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                >
                                    <Link
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!adminToDelete} onOpenChange={(open) => !open && setAdminToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-1">
                            <ShieldAlert className="size-5" />
                            <DialogTitle>Confirm Delete Administrator</DialogTitle>
                        </div>
                        <DialogDescription>
                            Are you sure you want to revoke administrative access and delete <strong>{adminToDelete?.name}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setAdminToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete Administrator
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

