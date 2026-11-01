import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Edit3,
    FolderKanban,
    FolderTree,
    Plus,
    Search,
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
import type { Category, PaginatedData } from '@/types';

type CategoriesIndexProps = {
    categories: PaginatedData<Category>;
    filters: {
        search: string;
    };
    canManageCategories: boolean;
};

export default function CategoriesIndex({
    categories,
    filters,
    canManageCategories,
}: CategoriesIndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

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
                    '/categories',
                    { search: search.trim() || undefined },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/categories',
            { search: search.trim() || undefined },
            { preserveState: true, replace: true }
        );
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;
        router.delete(`/categories/${categoryToDelete.id}`, {
            onSuccess: () => setCategoryToDelete(null),
        });
    };

    return (
        <>
            <Head title="Project Categories - Ofoq Technology" />

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
                                Project Categories
                            </h1>
                            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
                                <FolderTree className="size-3" />
                                Bilingual Taxonomy
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage project classifications in Arabic and English stored as native JSON.
                        </p>
                    </div>

                    {canManageCategories && (
                        <div className="flex items-center gap-2.5">
                            <Button asChild size="sm">
                                <Link href="/categories/create">
                                    <Plus className="mr-1.5 size-4" />
                                    Add Category
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Search Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Filter Categories</CardTitle>
                        <CardDescription>Search by English or Arabic name, or system slug</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search categories (e.g. Web, Mobile, تطبيقات, سحابية)..."
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
                                            router.get('/categories');
                                        }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Categories Table Card */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Category Name (EN & AR)</th>
                                        <th className="px-6 py-3.5">Slug</th>
                                        <th className="px-6 py-3.5">Linked Projects</th>
                                        <th className="px-6 py-3.5">Order</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        {canManageCategories && (
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {categories.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={canManageCategories ? 6 : 5} className="px-6 py-10 text-center text-muted-foreground">
                                                No categories found matching your query.
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.data.map((cat) => {
                                            const nameEn = cat.name_en || (typeof cat.name === 'object' ? cat.name?.en : cat.name) || '';
                                            const nameAr = cat.name_ar || (typeof cat.name === 'object' ? cat.name?.ar : '') || '';
                                            const descEn = cat.description_en || (typeof cat.description === 'object' ? cat.description?.en : '') || '';

                                            return (
                                                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                                                <FolderTree className="size-4 text-[#20B8D5]" />
                                                                {nameEn}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-arabic" dir="rtl">
                                                                {nameAr}
                                                            </div>
                                                            {descEn && (
                                                                <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-md">
                                                                    {descEn}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                                                            {cat.slug}
                                                        </code>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="gap-1 text-xs">
                                                            <FolderKanban className="size-3 text-muted-foreground" />
                                                            {cat.projects_count ?? 0} {cat.projects_count === 1 ? 'project' : 'projects'}
                                                        </Badge>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-mono text-muted-foreground">
                                                            #{cat.order}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant={cat.is_active ? 'default' : 'secondary'}
                                                            className={`gap-1 text-xs ${
                                                                cat.is_active
                                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`size-1.5 rounded-full ${
                                                                    cat.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'
                                                                }`}
                                                            />
                                                            {cat.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>

                                                    {canManageCategories && (
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Button asChild variant="ghost" size="sm" className="size-8 p-0" title="Edit Category">
                                                                    <Link href={`/categories/${cat.id}/edit`}>
                                                                        <Edit3 className="size-3.5" />
                                                                        <span className="sr-only">Edit</span>
                                                                    </Link>
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="size-8 p-0 text-muted-foreground hover:text-destructive"
                                                                    title="Delete Category"
                                                                    onClick={() => setCategoryToDelete(cat)}
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
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
                {categories.last_page > 1 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                            Showing {categories.from} to {categories.to} of {categories.total} categories
                        </div>
                        <div className="flex gap-2">
                            {categories.links.map((link, idx) => (
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
            <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete category <strong>{categoryToDelete?.name_en || (typeof categoryToDelete?.name === 'object' ? categoryToDelete?.name.en : '')}</strong>?
                            {categoryToDelete?.projects_count && categoryToDelete.projects_count > 0 ? (
                                <div className="mt-2 text-destructive font-medium">
                                    Warning: This category currently has {categoryToDelete.projects_count} associated project(s). Reassign them before deleting.
                                </div>
                            ) : (
                                <span className="block mt-1">This action cannot be undone.</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={categoryToDelete ? (categoryToDelete.projects_count ?? 0) > 0 : false}
                        >
                            Delete Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Categories',
            href: '/categories',
        },
    ],
};

