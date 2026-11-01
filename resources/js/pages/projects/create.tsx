import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import ProjectForm from '@/components/projects/project-form';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import {
    index as projectsIndex,
    store as storeProject,
} from '@/routes/projects';
import type { ProjectCategory } from '@/types';

type CreateProjectProps = {
    categories: ProjectCategory[];
};

export default function CreateProject({ categories }: CreateProjectProps) {
    const { t, isRtl } = useTranslation();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (formData: FormData) => {
        setProcessing(true);
        router.post(storeProject.url(), formData, {
            onFinish: () => setProcessing(false),
            onError: (errs) => setErrors(errs),
        });
    };

    return (
        <>
            <Head title={t('projects.add_title')} />

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
                        {t('projects.add_title')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('projects.add_desc')}
                    </p>
                </div>

                <ProjectForm
                    categories={categories}
                    onSubmit={handleSubmit}
                    processing={processing}
                    errors={errors}
                />
            </div>
        </>
    );
}

CreateProject.layout = {
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
            title: 'Add Project',
            href: '#',
        },
    ],
};
