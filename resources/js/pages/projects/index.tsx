import { useState } from 'react';
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
    const { flash } = usePage<{ auth: Auth; flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            projectsIndex.url(),
            { search, category },
            { preserveState: true, replace: true }
        );
    };

    const handleCategoryChange = (newCat: string) => {
        setCategory(newCat);
        router.get(
            projectsIndex.url(),
            { search, category: newCat },
            { preserveState: true, replace: true }
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

    return (
        <>
            <Head title="Portfolio Projects" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Portfolio Projects
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage projects, showcase items, technologies, and metrics displayed on the frontend website.
                        </p>
                    </div>

                    <Button asChild size="sm">
                        <Link href={createProject()}>
                            <Plus className="mr-1.5 size-4" />
                            Add Project
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
                        <CardTitle className="text-base font-semibold">Filter Projects</CardTitle>
                        <CardDescription>Search by title, technology, or category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search title, technologies, or keywords..."
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>

                                <Button type="submit" variant="secondary" size="sm">
                                    Search
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
                                        Reset
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
                            <FolderKanban className="mx-auto size-12 opacity-30 mb-3" />
                            <p className="text-base font-medium">No projects found</p>
                            <p className="text-xs mt-1">Try adjusting your filters or click Add Project to create one.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {projects.data.map((project) => (
                            <Card key={project.id} className="overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-200">
                                <div>
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted border-b border-border/70">
                                        {project.image ? (
                                            <img
                                                src={project.image}
                                                alt={project.title_en || project.title_ar || (typeof project.title === 'object' ? project.title.en || project.title.ar : '')}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="size-full flex items-center justify-center text-muted-foreground">
                                                <Briefcase className="size-8 opacity-40" />
                                            </div>
                                        )}

                                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                                            {project.is_featured && (
                                                <Badge variant="default" className="gap-1 text-[10px] bg-amber-500 text-white border-transparent">
                                                    <Star className="size-3 fill-current" />
                                                    Featured
                                                </Badge>
                                            )}
                                            <Badge variant="secondary" className="gap-1 text-[10px] backdrop-blur-md bg-background/80">
                                                {getCategoryIcon(project.category)}
                                                {project.category_label_en || (typeof project.category_label === 'object' ? project.category_label.en : project.category_label) || project.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-2.5">
                                        <div>
                                            <h3 className="font-bold text-base line-clamp-1">
                                                {project.title_en || (typeof project.title === 'object' ? project.title.en : project.title)}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1 font-arabic" dir="rtl">
                                                {project.title_ar || (typeof project.title === 'object' ? project.title.ar : '')}
                                            </p>
                                        </div>

                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {project.tagline_en || (typeof project.tagline === 'object' && project.tagline ? project.tagline.en : project.tagline) || project.description_en || (typeof project.description === 'object' && project.description ? project.description.en : project.description) || 'No description provided.'}
                                        </p>

                                        {/* Technologies */}
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {project.technologies.slice(0, 3).map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.technologies.length > 3 && (
                                                    <span className="text-[10px] text-muted-foreground self-center">
                                                        +{project.technologies.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer & Actions */}
                                <div className="border-t border-border/60 p-3 bg-muted/20 flex items-center justify-between">
                                    <div className="text-[11px] text-muted-foreground">
                                        Slug: <code className="text-foreground/80 font-mono">{project.slug}</code>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {project.live_url && (
                                            <Button asChild variant="ghost" size="sm" className="h-8 size-8 p-0">
                                                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="size-3.5" />
                                                </a>
                                            </Button>
                                        )}
                                        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                                            <Link href={editProject(project.slug)}>
                                                <Pencil className="mr-1 size-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setProjectToDelete(project)}
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
                            Showing {projects.from} to {projects.to} of {projects.total} projects
                        </div>
                        <div className="flex items-center gap-1">
                            {projects.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    asChild={!!link.url}
                                    disabled={!link.url}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-7 min-w-7 px-2 text-xs"
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            preserveScroll
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{projectToDelete?.title_en || projectToDelete?.title_ar || (typeof projectToDelete?.title === 'object' ? projectToDelete?.title?.en || projectToDelete?.title?.ar : '')}</strong>? This will remove the project from the dashboard and the frontend portfolio.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProjectToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
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

