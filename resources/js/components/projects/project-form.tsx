import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    Globe,
    Image as ImageIcon,
    Layers,
    Plus,
    Save,
    Sparkles,
    Trash2,
    Undo2,
    Upload,
    X,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import { index as projectsIndex } from '@/routes/projects';
import type { Project, ProjectCategory, ProjectMetric } from '@/types';

type ProjectFormProps = {
    project?: Project;
    categories: ProjectCategory[];
    onSubmit: (formData: FormData) => void;
    processing: boolean;
    errors: Record<string, string>;
    isEdit?: boolean;
};

type ExistingGalleryItem = {
    id: number;
    path: string;
    preview: string;
    display_order: number;
    caption_ar: string;
    caption_en: string;
    is_deleted?: boolean;
};

type NewGalleryItem = {
    tempId: string;
    file: File;
    preview: string;
    display_order: number;
    caption_ar: string;
    caption_en: string;
};

export default function ProjectForm({
    project,
    categories,
    onSubmit,
    processing,
    errors,
    isEdit = false,
}: ProjectFormProps) {
    const { t, isRtl } = useTranslation();

    // Form fields helper for JSON / accessor fields
    const getInitial = (
        field:
            | 'title'
            | 'category_label'
            | 'tagline'
            | 'description'
            | 'problem'
            | 'solution',
        lang: 'ar' | 'en',
        fallback = '',
    ) => {
        if (!project) return fallback;
        const accessor = project[`${field}_${lang}` as keyof Project] as
            | string
            | undefined;
        if (accessor) return accessor;
        const direct = project[field];
        if (direct && typeof direct === 'object' && lang in direct) {
            return (direct as Record<string, string>)[lang] || fallback;
        }
        if (typeof direct === 'string' && lang === 'ar') return direct;
        return fallback;
    };

    const [title, setTitle] = useState(getInitial('title', 'ar'));
    const [titleEn, setTitleEn] = useState(getInitial('title', 'en'));
    const [slug, setSlug] = useState(project?.slug || '');
    const [category, setCategory] = useState(project?.category || 'web');
    const [categoryLabel, setCategoryLabel] = useState(
        getInitial('category_label', 'en', 'Web & Portals'),
    );
    const [categoryLabelAr, setCategoryLabelAr] = useState(
        getInitial('category_label', 'ar', 'بوابات وتطبيقات الويب'),
    );
    const [tagline, setTagline] = useState(getInitial('tagline', 'en'));
    const [taglineAr, setTaglineAr] = useState(getInitial('tagline', 'ar'));
    const [description, setDescription] = useState(
        getInitial('description', 'en'),
    );
    const [descriptionAr, setDescriptionAr] = useState(
        getInitial('description', 'ar'),
    );
    const [problem, setProblem] = useState(getInitial('problem', 'en'));
    const [problemAr, setProblemAr] = useState(getInitial('problem', 'ar'));
    const [solution, setSolution] = useState(getInitial('solution', 'en'));
    const [solutionAr, setSolutionAr] = useState(getInitial('solution', 'ar'));
    const [client, setClient] = useState(project?.client || '');
    const [liveUrl, setLiveUrl] = useState(project?.live_url || '');
    const [isFeatured, setIsFeatured] = useState<boolean>(
        project?.is_featured ?? false,
    );
    const [order, setOrder] = useState<number>(project?.order ?? 0);

    // Primary Cover Image & Upload
    const [image, setImage] = useState(project?.image || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(
        project?.image || '',
    );

    // Existing Multi-image Gallery from DB
    const [existingGallery, setExistingGallery] = useState<
        ExistingGalleryItem[]
    >(() => {
        if (project?.images && project.images.length > 0) {
            return project.images.map((img) => ({
                id: img.id,
                path: img.path,
                preview: img.url || img.path,
                display_order: img.display_order ?? 1,
                caption_ar:
                    img.caption_ar ||
                    (typeof img.caption === 'object' ? img.caption?.ar : '') ||
                    '',
                caption_en:
                    img.caption_en ||
                    (typeof img.caption === 'object' ? img.caption?.en : '') ||
                    '',
                is_deleted: false,
            }));
        }
        return [];
    });

    // New uploaded gallery files queued for submission
    const [newGalleryFiles, setNewGalleryFiles] = useState<NewGalleryItem[]>(
        [],
    );

    // Dynamic Lists (Tech, Features, Metrics)
    const [technologies, setTechnologies] = useState<string[]>(
        project?.technologies || [],
    );
    const [techInput, setTechInput] = useState('');

    const initialFeaturesEn = Array.isArray(project?.features)
        ? project.features
        : project?.features?.en || project?.features_en || [];
    const [features, setFeatures] = useState<string[]>(initialFeaturesEn);
    const [featureInput, setFeatureInput] = useState('');

    const initialFeaturesAr =
        project?.features_ar ||
        (project?.features &&
        typeof project.features === 'object' &&
        !Array.isArray(project.features)
            ? project.features.ar
            : []) ||
        [];
    const [featuresAr, setFeaturesAr] = useState<string[]>(initialFeaturesAr);
    const [featureArInput, setFeatureArInput] = useState('');

    const initialMetricsEn = Array.isArray(project?.metrics)
        ? project.metrics
        : project?.metrics?.en || project?.metrics_en || [];
    const [metrics, setMetrics] = useState<ProjectMetric[]>(initialMetricsEn);
    const [metricLabel, setMetricLabel] = useState('');
    const [metricVal, setMetricVal] = useState('');

    // Handle Category change & update default labels
    const handleCategorySelect = (selectedCatId: string) => {
        setCategory(selectedCatId);
        const match = categories.find((c) => c.id === selectedCatId);
        if (match) {
            setCategoryLabel(match.label || match.name_en || '');
            if (match.label_ar || match.name_ar) {
                setCategoryLabelAr(match.label_ar || match.name_ar || '');
            }
        }
    };

    // Cover image file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Gallery multiple files selection
    const handleGalleryFilesChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        const currentOrders = [
            ...existingGallery
                .filter((item) => !item.is_deleted)
                .map((item) => item.display_order),
            ...newGalleryFiles.map((item) => item.display_order),
        ];
        const nextOrder =
            currentOrders.length > 0 ? Math.max(...currentOrders) + 1 : 1;

        const newItems: NewGalleryItem[] = files.map((file, idx) => ({
            tempId: `${Date.now()}-${idx}-${file.name}`,
            file,
            preview: URL.createObjectURL(file),
            display_order: nextOrder + idx,
            caption_ar: '',
            caption_en: '',
        }));

        setNewGalleryFiles((prev) => [...prev, ...newItems]);
        e.target.value = '';
    };

    // Remove newly queued file
    const removeNewFile = (tempId: string) => {
        setNewGalleryFiles((prev) => {
            const found = prev.find((item) => item.tempId === tempId);
            if (found) {
                URL.revokeObjectURL(found.preview);
            }
            return prev.filter((item) => item.tempId !== tempId);
        });
    };

    // Toggle delete flag on existing saved image
    const toggleDeleteExisting = (id: number) => {
        setExistingGallery((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, is_deleted: !item.is_deleted }
                    : item,
            ),
        );
    };

    // Update display_order for an existing image
    const updateExistingOrder = (
        id: number,
        deltaOrVal: number,
        isAbsolute = false,
    ) => {
        setExistingGallery((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newOrder = isAbsolute
                        ? deltaOrVal
                        : Math.max(1, item.display_order + deltaOrVal);
                    return { ...item, display_order: newOrder };
                }
                return item;
            }),
        );
    };

    // Update display_order for a new queued image
    const updateNewOrder = (
        tempId: string,
        deltaOrVal: number,
        isAbsolute = false,
    ) => {
        setNewGalleryFiles((prev) =>
            prev.map((item) => {
                if (item.tempId === tempId) {
                    const newOrder = isAbsolute
                        ? deltaOrVal
                        : Math.max(1, item.display_order + deltaOrVal);
                    return { ...item, display_order: newOrder };
                }
                return item;
            }),
        );
    };

    // Technology handlers
    const addTechnology = () => {
        const trimmed = techInput.trim();
        if (trimmed && !technologies.includes(trimmed)) {
            setTechnologies([...technologies, trimmed]);
            setTechInput('');
        }
    };

    const removeTechnology = (tech: string) => {
        setTechnologies(technologies.filter((t) => t !== tech));
    };

    // Feature handlers
    const addFeature = () => {
        const trimmed = featureInput.trim();
        if (trimmed) {
            setFeatures([...features, trimmed]);
            setFeatureInput('');
        }
    };

    const removeFeature = (idx: number) => {
        setFeatures(features.filter((_, i) => i !== idx));
    };

    const addFeatureAr = () => {
        const trimmed = featureArInput.trim();
        if (trimmed) {
            setFeaturesAr([...featuresAr, trimmed]);
            setFeatureArInput('');
        }
    };

    const removeFeatureAr = (idx: number) => {
        setFeaturesAr(featuresAr.filter((_, i) => i !== idx));
    };

    // Metric handlers
    const addMetric = () => {
        if (metricLabel.trim() && metricVal.trim()) {
            setMetrics([
                ...metrics,
                { label: metricLabel.trim(), val: metricVal.trim() },
            ]);
            setMetricLabel('');
            setMetricVal('');
        }
    };

    const removeMetric = (idx: number) => {
        setMetrics(metrics.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('title[ar]', title);
        fd.append('title[en]', titleEn);
        if (slug) fd.append('slug', slug);
        fd.append('category', category);
        fd.append('category_label[ar]', categoryLabelAr);
        fd.append('category_label[en]', categoryLabel);
        if (tagline) fd.append('tagline[en]', tagline);
        if (taglineAr) fd.append('tagline[ar]', taglineAr);
        if (description) fd.append('description[en]', description);
        if (descriptionAr) fd.append('description[ar]', descriptionAr);
        if (problem) fd.append('problem[en]', problem);
        if (problemAr) fd.append('problem[ar]', problemAr);
        if (solution) fd.append('solution[en]', solution);
        if (solutionAr) fd.append('solution[ar]', solutionAr);
        if (client) fd.append('client', client);
        if (liveUrl) fd.append('live_url', liveUrl);
        fd.append('is_featured', isFeatured ? '1' : '0');
        fd.append('order', String(order));

        // Primary cover image
        if (imageFile) {
            fd.append('image_file', imageFile);
        } else if (image) {
            fd.append('image', image);
        }

        // Existing gallery images state (updated orders, captions, and deletions)
        existingGallery.forEach((item, i) => {
            fd.append(`existing_images[${i}][id]`, String(item.id));
            fd.append(
                `existing_images[${i}][display_order]`,
                String(item.display_order),
            );
            fd.append(
                `existing_images[${i}][caption_ar]`,
                item.caption_ar || '',
            );
            fd.append(
                `existing_images[${i}][caption_en]`,
                item.caption_en || '',
            );
            if (item.is_deleted) {
                fd.append(`existing_images[${i}][_destroy]`, '1');
            }
        });

        // Newly uploaded gallery files with their display orders and captions
        newGalleryFiles.forEach((item, i) => {
            fd.append(`gallery_files[${i}]`, item.file);
            fd.append(`gallery_files_order[${i}]`, String(item.display_order));
            fd.append(`gallery_files_caption_ar[${i}]`, item.caption_ar || '');
            fd.append(`gallery_files_caption_en[${i}]`, item.caption_en || '');
        });

        // Arrays as indexed
        technologies.forEach((tech, i) =>
            fd.append(`technologies[${i}]`, tech),
        );
        features.forEach((feat, i) => fd.append(`features[en][${i}]`, feat));
        featuresAr.forEach((feat, i) => fd.append(`features[ar][${i}]`, feat));
        metrics.forEach((m, i) => {
            fd.append(`metrics[en][${i}][label]`, m.label);
            fd.append(`metrics[en][${i}][val]`, m.val);
        });

        if (isEdit) {
            fd.append('_method', 'PUT');
        }

        onSubmit(fd);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Layers className="size-4 text-primary" />
                        {t('projects.form_info_title')}
                    </CardTitle>
                    <CardDescription>
                        {t('projects.form_info_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Title (Arabic) */}
                        <div className="space-y-1.5">
                            <Label htmlFor="title">
                                {t('projects.form_arabic_title')}
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="ماستر شوب — تطبيق خدمات وتوصيل متكامل"
                                required
                                dir="rtl"
                            />
                            <InputError
                                message={errors.title || errors['title.ar']}
                            />
                        </div>

                        {/* Title (English) */}
                        <div className="space-y-1.5">
                            <Label htmlFor="title_en">
                                {t('projects.form_english_title')}
                            </Label>
                            <Input
                                id="title_en"
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                                placeholder="Master Shop — Multi-Service Delivery"
                                dir="ltr"
                            />
                            <InputError
                                message={errors.title_en || errors['title.en']}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label htmlFor="category">
                                {t('projects.form_category')}
                            </Label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) =>
                                    handleCategorySelect(e.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {isRtl
                                            ? c.label_ar || c.name_ar || c.label
                                            : c.label || c.name_en || c.id}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} />
                        </div>

                        {/* Category Label EN */}
                        <div className="space-y-1.5">
                            <Label htmlFor="category_label">
                                {t('projects.form_category_label_en')}
                            </Label>
                            <Input
                                id="category_label"
                                value={categoryLabel}
                                onChange={(e) =>
                                    setCategoryLabel(e.target.value)
                                }
                                placeholder="e.g. Mobile Systems"
                                dir="ltr"
                                required
                            />
                            <InputError
                                message={
                                    errors.category_label ||
                                    errors['category_label.en']
                                }
                            />
                        </div>

                        {/* Category Label AR */}
                        <div className="space-y-1.5">
                            <Label htmlFor="category_label_ar">
                                {t('projects.form_category_label_ar')}
                            </Label>
                            <Input
                                id="category_label_ar"
                                value={categoryLabelAr}
                                onChange={(e) =>
                                    setCategoryLabelAr(e.target.value)
                                }
                                placeholder="مثال: أنظمة وتطبيقات الجوال"
                                dir="rtl"
                            />
                            <InputError
                                message={
                                    errors.category_label_ar ||
                                    errors['category_label.ar']
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Slug */}
                        <div className="space-y-1.5">
                            <Label htmlFor="slug">
                                {t('projects.form_slug')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">
                                    {t('projects.form_slug_hint')}
                                </span>
                            </Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="master-shop-marketplace"
                                dir="ltr"
                            />
                            <InputError message={errors.slug} />
                        </div>

                        {/* Client */}
                        <div className="space-y-1.5">
                            <Label htmlFor="client">
                                {t('projects.form_client')}
                            </Label>
                            <Input
                                id="client"
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                placeholder={
                                    isRtl
                                        ? 'مثال: شركة ماستر شوب'
                                        : 'e.g. Master Shop Co.'
                                }
                            />
                            <InputError message={errors.client} />
                        </div>

                        {/* Live URL */}
                        <div className="space-y-1.5">
                            <Label htmlFor="live_url">
                                {t('projects.form_live_url')}
                            </Label>
                            <Input
                                id="live_url"
                                value={liveUrl}
                                onChange={(e) => setLiveUrl(e.target.value)}
                                placeholder="https://..."
                                dir="ltr"
                            />
                            <InputError message={errors.live_url} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) =>
                                    setIsFeatured(e.target.checked)
                                }
                                className="size-4 rounded border-input text-primary focus:ring-primary"
                            />
                            {t('projects.form_is_featured')}
                        </label>

                        <div className="flex items-center gap-2">
                            <Label htmlFor="order" className="text-sm">
                                {t('projects.form_order')}:
                            </Label>
                            <Input
                                id="order"
                                type="number"
                                min={0}
                                value={order}
                                onChange={(e) =>
                                    setOrder(Number(e.target.value))
                                }
                                className="h-8 w-20"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Visuals, Cover & Multi-Image Gallery */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ImageIcon className="size-4 text-primary" />
                        {t('projects.form_cover_title')}
                    </CardTitle>
                    <CardDescription>
                        {t('projects.form_cover_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Primary Cover Image */}
                    <div>
                        <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                            <span className="size-2 rounded-full bg-primary" />
                            {t('projects.form_cover_title')}
                        </h4>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="image_file">
                                        {t('projects.form_upload_cover')}
                                    </Label>
                                    <Input
                                        id="image_file"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <InputError message={errors.image_file} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="image">
                                        {isRtl
                                            ? 'أو مسار / رابط الصورة'
                                            : 'Or Image Path / URL'}
                                    </Label>
                                    <Input
                                        id="image"
                                        value={image}
                                        onChange={(e) => {
                                            setImage(e.target.value);
                                            setImagePreview(e.target.value);
                                        }}
                                        placeholder="/images/projects/... or https://..."
                                        dir="ltr"
                                    />
                                    <InputError message={errors.image} />
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div>
                                <Label className="mb-1.5 block">
                                    {isRtl ? 'معاينة الغلاف' : 'Cover Preview'}
                                </Label>
                                <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Cover Preview"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground">
                                            <Upload className="mx-auto mb-1 size-8 opacity-40" />
                                            <p className="text-xs">
                                                {isRtl
                                                    ? 'لم يتم اختيار صورة غلاف بعد'
                                                    : 'No cover image selected'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-6">
                        {/* Multi-Image Gallery Manager */}
                        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                    <span className="size-2 rounded-full bg-cyan-500" />
                                    {t('projects.form_gallery_title')}
                                </h4>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {t('projects.form_gallery_desc')}
                                </p>
                            </div>

                            <div>
                                <label className="cursor-pointer">
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
                                        <Plus className="size-3.5" />
                                        {t('projects.form_upload_gallery')}
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleGalleryFilesChange}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Gallery List (Existing + Newly Queued) */}
                        {existingGallery.length === 0 &&
                        newGalleryFiles.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                                <ImageIcon className="mx-auto mb-2 size-8 opacity-30" />
                                <p className="text-sm font-medium text-foreground">
                                    {isRtl
                                        ? 'لم تتم إضافة صور للمعرض بعد'
                                        : 'No gallery images added yet'}
                                </p>
                                <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                                    {isRtl
                                        ? 'اضغط على زر رفع لقطات للمعرض أعلاه لإضافة صور وسكرينشوتس للمشروع.'
                                        : 'Click "Upload Gallery Images" above to upload multiple screenshots and UI mockups.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Existing Saved Images */}
                                {existingGallery.map((item) => (
                                    <div
                                        key={`existing-${item.id}`}
                                        className={`flex flex-col justify-between rounded-lg border p-3 transition-all ${
                                            item.is_deleted
                                                ? 'border-destructive/40 bg-destructive/10 opacity-60'
                                                : 'border-border bg-card hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            {/* Thumbnail */}
                                            <div className="relative aspect-video w-full overflow-hidden rounded border border-border/70 bg-muted">
                                                <img
                                                    src={item.preview}
                                                    alt="Gallery Preview"
                                                    className="size-full object-cover"
                                                />
                                                <div className="absolute top-1.5 left-1.5">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-background/90 font-mono text-[10px] backdrop-blur-xs"
                                                    >
                                                        {isRtl
                                                            ? `محفوظ #${item.id}`
                                                            : `Saved #${item.id}`}
                                                    </Badge>
                                                </div>
                                                <div className="absolute top-1.5 right-1.5">
                                                    <Badge
                                                        variant="default"
                                                        className="bg-primary text-[10px] font-bold"
                                                    >
                                                        {isRtl
                                                            ? `الترتيب #${item.display_order}`
                                                            : `Order #${item.display_order}`}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Order controls */}
                                            <div className="flex items-center justify-between gap-2 pt-1">
                                                <Label className="text-xs font-medium">
                                                    {t('categories.order')}:
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={
                                                            item.is_deleted ||
                                                            item.display_order <=
                                                                1
                                                        }
                                                        className="size-7 p-0"
                                                        onClick={() =>
                                                            updateExistingOrder(
                                                                item.id,
                                                                -1,
                                                            )
                                                        }
                                                    >
                                                        <ArrowUp className="size-3" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        disabled={
                                                            item.is_deleted
                                                        }
                                                        value={
                                                            item.display_order
                                                        }
                                                        onChange={(e) =>
                                                            updateExistingOrder(
                                                                item.id,
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                                true,
                                                            )
                                                        }
                                                        className="h-7 w-14 text-center text-xs"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={
                                                            item.is_deleted
                                                        }
                                                        className="size-7 p-0"
                                                        onClick={() =>
                                                            updateExistingOrder(
                                                                item.id,
                                                                1,
                                                            )
                                                        }
                                                    >
                                                        <ArrowDown className="size-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Captions */}
                                            <div className="space-y-1">
                                                <Input
                                                    placeholder={
                                                        isRtl
                                                            ? 'وصف الصورة (بالعربية)'
                                                            : 'Arabic Caption'
                                                    }
                                                    dir="rtl"
                                                    disabled={item.is_deleted}
                                                    value={item.caption_ar}
                                                    onChange={(e) => {
                                                        const text =
                                                            e.target.value;
                                                        setExistingGallery(
                                                            (prev) =>
                                                                prev.map((g) =>
                                                                    g.id ===
                                                                    item.id
                                                                        ? {
                                                                              ...g,
                                                                              caption_ar:
                                                                                  text,
                                                                          }
                                                                        : g,
                                                                ),
                                                        );
                                                    }}
                                                    className="h-7 text-xs"
                                                />
                                                <Input
                                                    placeholder={
                                                        isRtl
                                                            ? 'وصف الصورة (بالإنجليزية)'
                                                            : 'English Caption'
                                                    }
                                                    dir="ltr"
                                                    disabled={item.is_deleted}
                                                    value={item.caption_en}
                                                    onChange={(e) => {
                                                        const text =
                                                            e.target.value;
                                                        setExistingGallery(
                                                            (prev) =>
                                                                prev.map((g) =>
                                                                    g.id ===
                                                                    item.id
                                                                        ? {
                                                                              ...g,
                                                                              caption_en:
                                                                                  text,
                                                                          }
                                                                        : g,
                                                                ),
                                                        );
                                                    }}
                                                    className="h-7 text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="mt-2 flex justify-end border-t border-border/60 pt-2">
                                            {item.is_deleted ? (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleDeleteExisting(
                                                            item.id,
                                                        )
                                                    }
                                                    className="h-7 gap-1 text-xs text-primary"
                                                >
                                                    <Undo2 className="size-3" />
                                                    {isRtl
                                                        ? 'استعادة'
                                                        : 'Restore'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleDeleteExisting(
                                                            item.id,
                                                        )
                                                    }
                                                    className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="size-3" />
                                                    {isRtl
                                                        ? 'حذف الصورة'
                                                        : 'Remove Image'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Newly Selected Files */}
                                {newGalleryFiles.map((item) => (
                                    <div
                                        key={item.tempId}
                                        className="flex flex-col justify-between rounded-lg border border-cyan-500/40 bg-card p-3 shadow-xs transition-all hover:border-cyan-500"
                                    >
                                        <div className="space-y-2">
                                            {/* Thumbnail */}
                                            <div className="relative aspect-video w-full overflow-hidden rounded border border-border/70 bg-muted">
                                                <img
                                                    src={item.preview}
                                                    alt="New Upload Preview"
                                                    className="size-full object-cover"
                                                />
                                                <div className="absolute top-1.5 left-1.5">
                                                    <Badge
                                                        variant="default"
                                                        className="bg-cyan-600 text-[10px] font-semibold text-white"
                                                    >
                                                        {isRtl
                                                            ? 'جديدة'
                                                            : 'New Upload'}
                                                    </Badge>
                                                </div>
                                                <div className="absolute top-1.5 right-1.5">
                                                    <Badge
                                                        variant="default"
                                                        className="bg-primary text-[10px] font-bold"
                                                    >
                                                        {isRtl
                                                            ? `الترتيب #${item.display_order}`
                                                            : `Order #${item.display_order}`}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Order controls */}
                                            <div className="flex items-center justify-between gap-2 pt-1">
                                                <Label className="text-xs font-medium">
                                                    {t('categories.order')}:
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={
                                                            item.display_order <=
                                                            1
                                                        }
                                                        className="size-7 p-0"
                                                        onClick={() =>
                                                            updateNewOrder(
                                                                item.tempId,
                                                                -1,
                                                            )
                                                        }
                                                    >
                                                        <ArrowUp className="size-3" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={
                                                            item.display_order
                                                        }
                                                        onChange={(e) =>
                                                            updateNewOrder(
                                                                item.tempId,
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                                true,
                                                            )
                                                        }
                                                        className="h-7 w-14 text-center text-xs"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="size-7 p-0"
                                                        onClick={() =>
                                                            updateNewOrder(
                                                                item.tempId,
                                                                1,
                                                            )
                                                        }
                                                    >
                                                        <ArrowDown className="size-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Captions */}
                                            <div className="space-y-1">
                                                <Input
                                                    placeholder={
                                                        isRtl
                                                            ? 'وصف الصورة (بالعربية)'
                                                            : 'Arabic Caption'
                                                    }
                                                    dir="rtl"
                                                    value={item.caption_ar}
                                                    onChange={(e) => {
                                                        const text =
                                                            e.target.value;
                                                        setNewGalleryFiles(
                                                            (prev) =>
                                                                prev.map((g) =>
                                                                    g.tempId ===
                                                                    item.tempId
                                                                        ? {
                                                                              ...g,
                                                                              caption_ar:
                                                                                  text,
                                                                          }
                                                                        : g,
                                                                ),
                                                        );
                                                    }}
                                                    className="h-7 text-xs"
                                                />
                                                <Input
                                                    placeholder={
                                                        isRtl
                                                            ? 'وصف الصورة (بالإنجليزية)'
                                                            : 'English Caption'
                                                    }
                                                    dir="ltr"
                                                    value={item.caption_en}
                                                    onChange={(e) => {
                                                        const text =
                                                            e.target.value;
                                                        setNewGalleryFiles(
                                                            (prev) =>
                                                                prev.map((g) =>
                                                                    g.tempId ===
                                                                    item.tempId
                                                                        ? {
                                                                              ...g,
                                                                              caption_en:
                                                                                  text,
                                                                          }
                                                                        : g,
                                                                ),
                                                        );
                                                    }}
                                                    className="h-7 text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="mt-2 flex justify-end border-t border-border/60 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    removeNewFile(item.tempId)
                                                }
                                                className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="size-3" />
                                                {isRtl
                                                    ? 'حذف الملف'
                                                    : 'Remove File'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 3. Narratives & Translations (Stored as JSON) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Globe className="size-4 text-primary" />
                        {t('projects.form_descriptions_title')}
                    </CardTitle>
                    <CardDescription>
                        {t('projects.form_descriptions_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Tagline */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="tagline">
                                {t('projects.form_tagline_en')}
                            </Label>
                            <Input
                                id="tagline"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                placeholder="One-line summary in English..."
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tagline_ar">
                                {t('projects.form_tagline_ar')}
                            </Label>
                            <Input
                                id="tagline_ar"
                                value={taglineAr}
                                onChange={(e) => setTaglineAr(e.target.value)}
                                placeholder="نبذة موجزة بسطر واحد بالعربية..."
                                dir="rtl"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="description">
                                {t('projects.form_desc_en')}
                            </Label>
                            <textarea
                                id="description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detailed overview in English..."
                                dir="ltr"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="description_ar">
                                {t('projects.form_desc_ar')}
                            </Label>
                            <textarea
                                id="description_ar"
                                rows={3}
                                value={descriptionAr}
                                onChange={(e) =>
                                    setDescriptionAr(e.target.value)
                                }
                                placeholder="الوصف الكامل للمشروع بالعربية..."
                                dir="rtl"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            />
                        </div>
                    </div>

                    {/* Problem Statement */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="problem">
                                {t('projects.form_problem_en')}
                            </Label>
                            <textarea
                                id="problem"
                                rows={2}
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                                placeholder="Challenge or pain point faced by client..."
                                dir="ltr"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="problem_ar">
                                {t('projects.form_problem_ar')}
                            </Label>
                            <textarea
                                id="problem_ar"
                                rows={2}
                                value={problemAr}
                                onChange={(e) => setProblemAr(e.target.value)}
                                placeholder="المشكلة أو التحدي الذي كان يواجهه العميل..."
                                dir="rtl"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            />
                        </div>
                    </div>

                    {/* Solution Statement */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="solution">
                                {t('projects.form_solution_en')}
                            </Label>
                            <textarea
                                id="solution"
                                rows={2}
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                placeholder="How Ofoq Tech solved it..."
                                dir="ltr"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="solution_ar">
                                {t('projects.form_solution_ar')}
                            </Label>
                            <textarea
                                id="solution_ar"
                                rows={2}
                                value={solutionAr}
                                onChange={(e) => setSolutionAr(e.target.value)}
                                placeholder="الحل التقني والهندسي الذي طورته أفق..."
                                dir="rtl"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Technologies, Features & Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="size-4 text-primary" />
                        {isRtl
                            ? 'التقنيات والمميزات ومؤشرات الإنجاز'
                            : 'Technologies, Features & Metrics'}
                    </CardTitle>
                    <CardDescription>
                        {isRtl
                            ? 'حزم برمجية ومميزات ومؤشرات قياس نتائج المشروع.'
                            : 'Bilingual highlights and specs stored as JSON arrays.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Technologies Tag Input */}
                    <div className="space-y-2">
                        <Label>{t('projects.form_tech_title')}</Label>
                        <div className="flex gap-2">
                            <Input
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTechnology();
                                    }
                                }}
                                placeholder={t(
                                    'projects.form_tech_placeholder',
                                )}
                                dir="ltr"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addTechnology}
                            >
                                {t('projects.form_add_tech')}
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {technologies.map((tech) => (
                                <Badge
                                    key={tech}
                                    variant="secondary"
                                    className="gap-1.5 px-2.5 py-1 text-xs"
                                >
                                    {tech}
                                    <button
                                        type="button"
                                        onClick={() => removeTechnology(tech)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Features List (EN) */}
                    <div className="space-y-2">
                        <Label>
                            {isRtl
                                ? 'المميزات والخصائص (EN)'
                                : 'Key Highlights / Features (EN)'}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={featureInput}
                                onChange={(e) =>
                                    setFeatureInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addFeature();
                                    }
                                }}
                                placeholder="Add a key feature in English..."
                                dir="ltr"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addFeature}
                            >
                                {isRtl ? 'إضافة ميزة' : 'Add Feature'}
                            </Button>
                        </div>
                        <ul className="space-y-1.5 pt-1">
                            {features.map((feat, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between gap-2 rounded border bg-muted/30 px-3 py-1.5 text-xs"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-primary" />
                                        {feat}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="size-6 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeFeature(idx)}
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Features List (AR) */}
                    <div className="space-y-2">
                        <Label>
                            {isRtl
                                ? 'المميزات والخصائص (AR)'
                                : 'Key Highlights / Features (AR)'}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={featureArInput}
                                onChange={(e) =>
                                    setFeatureArInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addFeatureAr();
                                    }
                                }}
                                placeholder="أضف ميزة أو خاصية بالعربية..."
                                dir="rtl"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addFeatureAr}
                            >
                                {isRtl ? 'إضافة ميزة' : 'Add Feature'}
                            </Button>
                        </div>
                        <ul className="space-y-1.5 pt-1" dir="rtl">
                            {featuresAr.map((feat, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between gap-2 rounded border bg-muted/30 px-3 py-1.5 text-xs"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-primary" />
                                        {feat}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="size-6 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeFeatureAr(idx)}
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Impact Metrics */}
                    <div className="space-y-2">
                        <Label>{t('projects.form_metrics_title')}</Label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                            <Input
                                className="sm:col-span-2"
                                value={metricLabel}
                                onChange={(e) => setMetricLabel(e.target.value)}
                                placeholder={t('projects.form_metric_label')}
                            />
                            <Input
                                className="sm:col-span-2"
                                value={metricVal}
                                onChange={(e) => setMetricVal(e.target.value)}
                                placeholder={t('projects.form_metric_val')}
                                dir="ltr"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addMetric}
                                className="sm:col-span-1"
                            >
                                {t('projects.form_add_metric')}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
                            {metrics.map((m, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded border bg-muted/30 p-2.5 text-xs"
                                >
                                    <div>
                                        <div className="font-medium text-muted-foreground">
                                            {m.label}
                                        </div>
                                        <div className="font-bold text-foreground">
                                            {m.val}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="size-6 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeMetric(idx)}
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-4">
                <Button asChild variant="outline">
                    <Link href={projectsIndex()}>{t('common.cancel')}</Link>
                </Button>
                <Button type="submit" disabled={processing} size="lg">
                    <Save className={`size-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {processing
                        ? t('common.saving')
                        : isEdit
                          ? t('common.save_changes')
                          : t('projects.form_save_btn')}
                </Button>
            </div>
        </form>
    );
}
