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
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;
    const { t, isRtl } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null,
    );

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
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
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
            { preserveState: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;
        router.delete(`/categories/${categoryToDelete.id}`, {
            onSuccess: () => setCategoryToDelete(null),
        });
    };

    const getCategoryName = (cat: Category | null | undefined): string => {
        if (!cat) return '';
        if (isRtl) {
            return (
                cat.name_ar ||
                (typeof cat.name === 'object' ? cat.name?.ar : '') ||
                cat.name_en ||
                (typeof cat.name === 'object' ? cat.name?.en : cat.name) ||
                ''
            );
        }
        return (
            cat.name_en ||
            (typeof cat.name === 'object' ? cat.name?.en : cat.name) ||
            ''
        );
    };

    const getCategoryDescription = (
        cat: Category | null | undefined,
    ): string => {
        if (!cat) return '';
        if (isRtl) {
            return (
                cat.description_ar ||
                (typeof cat.description === 'object'
                    ? cat.description?.ar
                    : '') ||
                cat.description_en ||
                (typeof cat.description === 'object'
                    ? cat.description?.en
                    : '') ||
                ''
            );
        }
        return (
            cat.description_en ||
            (typeof cat.description === 'object' ? cat.description?.en : '') ||
            ''
        );
    };

    return (
        <>
            <Head title={t('categories.title')} />

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
                                {t('categories.title')}
                            </h1>
                            <Badge
                                variant="secondary"
                                className="gap-1 border-primary/20 bg-primary/10 text-primary"
                            >
                                <FolderTree className="size-3" />
                                {t('categories.bilingual_taxonomy')}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('categories.subtitle')}
                        </p>
                    </div>

                    {canManageCategories && (
                        <div className="flex items-center gap-2.5">
                            <Button asChild size="sm">
                                <Link
                                    href="/categories/create"
                                    prefetch="hover"
                                    cacheFor="1m"
                                >
                                    <Plus
                                        className={`size-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`}
                                    />
                                    {t('categories.add_category')}
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Search Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            {t('categories.filter_title')}
                        </CardTitle>
                        <CardDescription>
                            {t('categories.filter_desc')}
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
                                        'categories.search_placeholder',
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
                                            router.get('/categories');
                                        }}
                                    >
                                        {t('common.reset')}
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
                            <table className="w-full text-start text-sm">
                                <thead className="border-b bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('common.name')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('categories.slug')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('categories.linked_projects')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('categories.order')}
                                        </th>
                                        <th className="px-6 py-3.5 text-start">
                                            {t('common.status')}
                                        </th>
                                        {canManageCategories && (
                                            <th className="px-6 py-3.5 text-end">
                                                {t('common.actions')}
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {categories.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    canManageCategories ? 6 : 5
                                                }
                                                className="px-6 py-10 text-center text-muted-foreground"
                                            >
                                                {t(
                                                    'categories.no_categories_found',
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.data.map((cat) => {
                                            const name = getCategoryName(cat);
                                            const desc =
                                                getCategoryDescription(cat);

                                            return (
                                                <tr
                                                    key={cat.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-6 py-4 text-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                                <FolderTree className="size-4 text-[#20B8D5]" />
                                                                {name}
                                                            </div>
                                                            {desc && (
                                                                <div className="line-clamp-1 max-w-md text-[11px] text-muted-foreground">
                                                                    {desc}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                                            {cat.slug}
                                                        </code>
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 text-xs"
                                                        >
                                                            <FolderKanban className="size-3 text-muted-foreground" />
                                                            {cat.projects_count ??
                                                                0}{' '}
                                                            {t('nav.projects')}
                                                        </Badge>
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            #{cat.order}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-start">
                                                        <Badge
                                                            variant={
                                                                cat.is_active
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className={`gap-1 text-xs ${
                                                                cat.is_active
                                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`size-1.5 rounded-full ${
                                                                    cat.is_active
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-muted-foreground'
                                                                }`}
                                                            />
                                                            {cat.is_active
                                                                ? t(
                                                                      'common.active',
                                                                  )
                                                                : t(
                                                                      'common.inactive',
                                                                  )}
                                                        </Badge>
                                                    </td>

                                                    {canManageCategories && (
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
                                                                        href={`/categories/${cat.id}/edit`}
                                                                    >
                                                                        <Edit3 className="size-3.5" />
                                                                        <span className="sr-only">
                                                                            {t(
                                                                                'common.edit',
                                                                            )}
                                                                        </span>
                                                                    </Link>
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="size-8 p-0 text-muted-foreground hover:text-destructive"
                                                                    title={t(
                                                                        'common.delete',
                                                                    )}
                                                                    onClick={() =>
                                                                        setCategoryToDelete(
                                                                            cat,
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
                            {t('common.showing')} {categories.from}{' '}
                            {t('common.to')} {categories.to} {t('common.of')}{' '}
                            {categories.total} {t('nav.categories')}
                        </div>
                        <div className="flex gap-2">
                            {categories.links.map((link, idx) => (
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
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('common.confirm')}</DialogTitle>
                        <DialogDescription>
                            {categoryToDelete && (
                                <>
                                    <span>
                                        {isRtl
                                            ? `هل أنت متأكد من رغبتك في حذف تصنيف "${getCategoryName(categoryToDelete)}"`
                                            : `Are you sure you want to delete category "${getCategoryName(categoryToDelete)}"?`}
                                    </span>
                                    {categoryToDelete.projects_count &&
                                    categoryToDelete.projects_count > 0 ? (
                                        <span className="mt-2 block font-medium text-destructive">
                                            {isRtl
                                                ? `تحذير: هذا التصنيف مرتبط حالياً بعدد ${categoryToDelete.projects_count} مشروع. يرجى نقل المشاريع أولاً قبل الحذف.`
                                                : `Warning: This category currently has ${categoryToDelete.projects_count} associated project(s). Reassign them before deleting.`}
                                        </span>
                                    ) : (
                                        <span className="mt-1 block text-muted-foreground">
                                            {isRtl
                                                ? 'لا يمكن التراجع عن هذا الإجراء.'
                                                : 'This action cannot be undone.'}
                                        </span>
                                    )}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCategoryToDelete(null)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={
                                categoryToDelete
                                    ? (categoryToDelete.projects_count ?? 0) > 0
                                    : false
                            }
                        >
                            {t('common.delete')}
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
