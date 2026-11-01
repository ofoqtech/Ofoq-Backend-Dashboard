import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import ProjectForm from '@/components/projects/project-form';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import {
    index as projectsIndex,
    update as updateProject,
} from '@/routes/projects';
import type { Project, ProjectCategory } from '@/types';

type EditProjectProps = {
    project: Project;
    categories: ProjectCategory[];
};

export default function EditProject({ project, categories }: EditProjectProps) {
    const { t, localized, isRtl } = useTranslation();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (formData: FormData) => {
        setProcessing(true);
        // Using POST with _method=PUT to support multipart file upload in PHP
        router.post(updateProject.url(project.slug), formData, {
            onFinish: () => setProcessing(false),
            onError: (errs) => setErrors(errs),
        });
    };

    const displayTitle =
        localized(project.title) ||
        project.title_en ||
        project.title_ar ||
        'Project';

    return (
        <>
            <Head title={`${t('projects.edit_title')}: ${displayTitle}`} />

            <div className="flex h-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="-mx-2 mb-2 text-xs"
                    >
                        <Link href={projectsIndex()} prefetch cacheFor="2m">
                            <ArrowLeft
                                className={`mr-1 size-3.5 ${isRtl ? 'mr-0 ml-1 rotate-180' : ''}`}
                            />
                            {t('common.back_to_projects')}
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        {t('projects.edit_title')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('projects.edit_desc')}
                    </p>
                </div>

                <ProjectForm
                    project={project}
                    categories={categories}
                    onSubmit={handleSubmit}
                    processing={processing}
                    errors={errors}
                    isEdit={true}
                />
            </div>
        </>
    );
}

EditProject.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Projects',
            href: projectsIndex(),
        },
        {
            title: 'Edit Project',
            href: '#',
        },
    ],
};
