import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FolderTree, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';

export default function CreateCategory() {
    const { t, isRtl } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name_en: '',
        name_ar: '',
        slug: '',
        description_en: '',
        description_ar: '',
        order: 0,
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/categories');
    };

    return (
        <>
            <Head title={t('categories.add_title')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
                {/* Back button & Title */}
                <div>
                    <Button asChild variant="ghost" size="sm" className="mb-2 -mx-2 text-xs">
                        <Link href="/categories" prefetch={['mount', 'hover']} cacheFor="2m">
                            <ArrowLeft className={`mr-1 size-3.5 ${isRtl ? 'rotate-180 ml-1 mr-0' : ''}`} />
                            {t('common.back_to_categories')}
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            {t('categories.add_title')}
                        </h1>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {t('categories.add_desc')}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FolderTree className="size-5 text-primary" />
                            {t('categories.info_title')}
                        </CardTitle>
                        <CardDescription>
                            {t('categories.info_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            {/* Bilingual Name */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name_en">{t('categories.name_en')}</Label>
                                    <Input
                                        id="name_en"
                                        value={data.name_en}
                                        onChange={(e) => setData('name_en', e.target.value)}
                                        placeholder="e.g. Cloud Infrastructure"
                                        dir="ltr"
                                        required
                                    />
                                    <InputError message={errors.name_en} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="name_ar">{t('categories.name_ar')}</Label>
                                    <Input
                                        id="name_ar"
                                        value={data.name_ar}
                                        onChange={(e) => setData('name_ar', e.target.value)}
                                        placeholder="مثال: البنية التحتية السحابية"
                                        dir="rtl"
                                        required
                                    />
                                    <InputError message={errors.name_ar} />
                                </div>
                            </div>

                            {/* Slug & Order */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="slug">
                                        {t('categories.slug_label')}{' '}
                                        <span className="text-xs text-muted-foreground font-normal">{t('categories.slug_hint')}</span>
                                    </Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="cloud-infra"
                                        dir="ltr"
                                    />
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="order">{t('categories.order_label')}</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        min={0}
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <InputError message={errors.order} />
                                </div>
                            </div>

                            {/* Bilingual Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description_en">{t('categories.desc_en')}</Label>
                                <textarea
                                    id="description_en"
                                    rows={3}
                                    value={data.description_en}
                                    onChange={(e) => setData('description_en', e.target.value)}
                                    placeholder="Brief overview of this project sector..."
                                    dir="ltr"
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <InputError message={errors.description_en} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description_ar">{t('categories.desc_ar')}</Label>
                                <textarea
                                    id="description_ar"
                                    rows={3}
                                    dir="rtl"
                                    value={data.description_ar}
                                    onChange={(e) => setData('description_ar', e.target.value)}
                                    placeholder="نبذة مختصرة عن هذا القطاع البرمجي..."
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <InputError message={errors.description_ar} />
                            </div>

                            {/* Active checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                                />
                                <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                                    {t('categories.is_active_label')}
                                </Label>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
                                <Button asChild variant="outline">
                                    <Link href="/categories">{t('common.cancel')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90">
                                    <Save className={`size-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
                                    {processing ? t('common.saving') : t('categories.save_btn')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateCategory.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Categories',
            href: '/categories',
        },
        {
            title: 'Add Category',
            href: '#',
        },
    ],
};

