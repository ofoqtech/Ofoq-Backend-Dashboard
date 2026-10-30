import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import ProjectForm from '@/components/projects/project-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index as projectsIndex, update as updateProject } from '@/routes/projects';
import type { Project, ProjectCategory } from '@/types';

type EditProjectProps = {
    project: Project;
    categories: ProjectCategory[];
};

export default function EditProject({ project, categories }: EditProjectProps) {
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

    const displayTitle = project.title_en || (typeof project.title === 'string' ? project.title : project.title?.en || project.title?.ar || 'Project');

    return (
        <>
            <Head title={`Edit ${displayTitle}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl">
                <div>
                    <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-xs">
                        <Link href={projectsIndex()}>
                            <ArrowLeft className="mr-1 size-3.5" />
                            Back to Projects
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Edit Project
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Editing: <strong>{displayTitle}</strong>
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

