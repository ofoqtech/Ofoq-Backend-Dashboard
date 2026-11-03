import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Briefcase,
    ExternalLink,
    FolderKanban,
    Globe,
    Pencil,
    Plus,
    Search,
    Smartphone,
    Star,
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
    create as createProject,
    destroy as destroyProject,
    edit as editProject,
    index as projectsIndex,
} from '@/routes/projects';
import type { Auth, PaginatedData, Project, ProjectCategory } from '@/types';

type ProjectsIndexProps = {
    projects: PaginatedData<Project>;
    filters: {
        search: string;
        category: string;
    };
    categories: ProjectCategory[];
};

export default function ProjectsIndex({
    projects,
    filters,
    categories,
}: ProjectsIndexProps) {
    const { flash } = usePage<{
        auth: Auth;
        flash?: { success?: string; error?: string };
    }>().props;
    const { t, isRtl } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(
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
                    projectsIndex.url(),
                    { search: search.trim() || undefined, category },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [search, category]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            projectsIndex.url(),
            { search: search.trim() || undefined, category },
            { preserveState: true, replace: true },
        );
    };

    const handleCategoryChange = (newCat: string) => {
        setCategory(newCat);
        router.get(
            projectsIndex.url(),
            { search: search.trim() || undefined, category: newCat },
            { preserveState: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!projectToDelete) return;
        router.delete(destroyProject.url(projectToDelete.slug), {
            onSuccess: () => setProjectToDelete(null),
        });
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'mobile':
                return <Smartphone className="size-3" />;
            case 'erp':
                return <Briefcase className="size-3" />;
            default:
                return <Globe className="size-3" />;
        }
    };

    const getProjectTitle = (p: Project | null | undefined): string => {
        if (!p) return '';
        if (isRtl) {
            return (
                p.title_ar ||
                (typeof p.title === 'object' ? p.title?.ar : '') ||
                p.title_en ||
                (typeof p.title === 'object' ? p.title?.en : p.title) ||
                ''
            );
        }
        return (
            p.title_en ||
            (typeof p.title === 'object' ? p.title?.en : p.title) ||
            ''
        );
    };

    const getProjectTagline = (p: Project | null | undefined): string => {
        if (!p) return '';
        if (isRtl) {
            return (
                p.tagline_ar ||
                (typeof p.tagline === 'object' ? p.tagline?.ar : '') ||
                p.description_ar ||
                (typeof p.description === 'object' ? p.description?.ar : '') ||
                p.tagline_en ||
                (typeof p.tagline === 'object' ? p.tagline?.en : '') ||
                ''
            );
        }
        return (
            p.tagline_en ||
            (typeof p.tagline === 'object' ? p.tagline?.en : '') ||
            p.description_en ||
            (typeof p.description === 'object' ? p.description?.en : '') ||
            ''
        );
    };

    return (
        <>
            <Head title={t('projects.title')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            {t('projects.title')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('projects.subtitle')}
                        </p>
                    </div>

                    <Button asChild size="sm">
                        <Link
                            href={createProject()}
                            prefetch="hover"
                            cacheFor="1m"
                        >
                            <Plus
                                className={`size-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`}
                            />
                            {t('projects.add_project')}
                        </Link>
                    </Button>
                </div>

                {/* Flash Messages */}
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

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            {t('projects.filter_title')}
                        </CardTitle>
                        <CardDescription>
                            {t('projects.filter_desc')}
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
                                        'projects.search_placeholder',
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
                                <select
                                    value={category}
                                    onChange={(e) =>
                                        handleCategoryChange(e.target.value)
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <option value="all">
                                        {t('projects.all_categories')}
                                    </option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {isRtl
                                                ? c.label_ar || c.label
                                                : c.label}
                                        </option>
                                    ))}
                                </select>

                                <Button
                                    type="submit"
                                    variant="secondary"
                                    size="sm"
                                >
                                    {t('common.search')}
                                </Button>
                                {(search || category !== 'all') && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearch('');
                                            setCategory('all');
                                            router.get(projectsIndex.url());
                                        }}
                                    >
                                        {t('common.reset')}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                {projects.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <FolderKanban className="mx-auto mb-3 size-12 opacity-30" />
                            <p className="text-base font-medium">
                                {t('projects.no_projects_found')}
                            </p>
                            <p className="mt-1 text-xs">
                                {t('projects.no_projects_hint')}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {projects.data.map((project) => (
                            <Card
                                key={project.id}
                                className="flex flex-col justify-between overflow-hidden transition-all duration-200 hover:border-primary/50"
                            >
                                <div>
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video w-full overflow-hidden border-b border-border/70 bg-muted">
                                        {project.image ? (
                                            <img
                                                src={project.image}
                                                alt={getProjectTitle(project)}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                                <Briefcase className="size-8 opacity-40" />
                                            </div>
                                        )}

                                        <div
                                            className={`absolute top-2.5 flex items-center gap-1.5 ${isRtl ? 'left-2.5' : 'right-2.5'}`}
                                        >
                                            {project.is_featured && (
                                                <Badge
                                                    variant="default"
                                                    className="gap-1 border-transparent bg-amber-500 text-[10px] text-white"
                                                >
                                                    <Star className="size-3 fill-current" />
                                                    {t('projects.featured')}
                                                </Badge>
                                            )}
                                            <Badge
                                                variant="secondary"
                                                className="gap-1 bg-background/80 text-[10px] backdrop-blur-md"
                                            >
                                                {getCategoryIcon(
                                                    project.category,
                                                )}
                                                {isRtl
                                                    ? project.category_label_ar ||
                                                      (typeof project.category_label ===
                                                      'object'
                                                          ? project
                                                                .category_label
                                                                ?.ar
                                                          : '') ||
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
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2.5 p-4">
                                        <div>
                                            <h3 className="line-clamp-1 text-base font-bold">
                                                {getProjectTitle(project)}
                                            </h3>
                                        </div>

                                        <p className="line-clamp-2 text-xs text-muted-foreground">
                                            {getProjectTagline(project) || '—'}
                                        </p>

                                        {/* Technologies */}
                                        {project.technologies &&
                                            project.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {project.technologies
                                                        .slice(0, 3)
                                                        .map((tech) => (
                                                            <span
                                                                key={tech}
                                                                className="rounded bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    {project.technologies
                                                        .length > 3 && (
                                                        <span className="self-center text-[10px] text-muted-foreground">
                                                            +
                                                            {project
                                                                .technologies
                                                                .length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {/* Footer & Actions */}
                                <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 p-3">
                                    <div className="text-[11px] text-muted-foreground">
                                        Slug:{' '}
                                        <code className="font-mono text-foreground/80">
                                            {project.slug}
                                        </code>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {project.live_url && (
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                                className="size-8 h-8 p-0"
                                            >
                                                <a
                                                    href={project.live_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={t(
                                                        'projects.view_live',
                                                    )}
                                                >
                                                    <ExternalLink className="size-3.5" />
                                                </a>
                                            </Button>
                                        )}
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs"
                                        >
                                            <Link
                                                href={editProject(project.slug)}
                                            >
                                                <Pencil
                                                    className={`size-3 ${isRtl ? 'ml-1' : 'mr-1'}`}
                                                />
                                                {t('common.edit')}
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="size-8 h-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() =>
                                                setProjectToDelete(project)
                                            }
                                            title={t('common.delete')}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {projects.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                        <div>
                            {t('common.showing')} {projects.from}{' '}
                            {t('common.to')} {projects.to} {t('common.of')}{' '}
                            {projects.total}
                        </div>
                        <div className="flex items-center gap-1">
                            {projects.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    asChild={!!link.url}
                                    disabled={!link.url}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    className="h-7 min-w-7 px-2 text-xs"
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            prefetch="hover"
                                            cacheFor="1m"
                                            preserveScroll
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <Dialog
                open={!!projectToDelete}
                onOpenChange={(open) => !open && setProjectToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('projects.delete_title')}</DialogTitle>
                        <DialogDescription>
                            {t('projects.delete_msg')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setProjectToDelete(null)}
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

ProjectsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Projects',
            href: projectsIndex(),
        },
    ],
};
