import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Save, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import { index as adminsIndex, update as updateAdmin } from '@/routes/admins';
import type { User } from '@/types';

type EditAdminProps = {
    admin: User;
    isSelf: boolean;
};

export default function EditAdmin({ admin, isSelf }: EditAdminProps) {
    const { t, isRtl } = useTranslation();
    const initialTitleEn = admin.title_en || (typeof admin.title === 'object' ? admin.title?.en : admin.title) || '';
    const initialTitleAr = admin.title_ar || (typeof admin.title === 'object' ? admin.title?.ar : '') || '';

    const { data, setData, put, processing, errors } = useForm({
        name: admin.name || '',
        email: admin.email || '',
        password: '',
        title: initialTitleEn,
        title_ar: initialTitleAr,
        phone: admin.phone || '',
        status: admin.status || 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(updateAdmin.url(admin.id));
    };

    return (
        <>
            <Head title={`${t('admins.edit_title')}: ${admin.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
                {/* Back button & Title */}
                <div>
                    <Button asChild variant="ghost" size="sm" className="mb-2 -mx-2 text-xs">
                        <Link href={adminsIndex()} prefetch={['mount', 'hover']} cacheFor="2m">
                            <ArrowLeft className={`mr-1 size-3.5 ${isRtl ? 'rotate-180 ml-1 mr-0' : ''}`} />
                            {t('common.back_to_admins')}
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        {t('admins.edit_title')}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {t('admins.edit_desc')}
                    </p>
                </div>

                {isSelf && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                        <Info className="size-4 shrink-0" />
                        <span>{isRtl ? 'أنت تقوم حالياً بتعديل حسابك الإداري الخاص.' : 'You are currently editing your own administrator account.'}</span>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="size-5 text-amber-500" />
                            {t('admins.info_title')}
                        </CardTitle>
                        <CardDescription>
                            {isRtl ? `تعديل حساب مسؤول النظام ${admin.name} (${admin.email})` : `Editing administrator account for ${admin.name} (${admin.email})`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name">{t('employees.full_name')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={isRtl ? 'مثال: طارق النعيمي' : 'e.g. Tariq Al-Nuaimi'}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">{t('employees.email_address')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@ofoq.tech"
                                    dir="ltr"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password (Optional) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">
                                    {t('employees.new_password')}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    dir="ltr"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* System Authority */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="role" className="flex items-center gap-1.5">
                                        <ShieldCheck className="size-3.5 text-amber-500" />
                                        {t('admins.system_authority')}
                                    </Label>
                                    <div className="h-9 w-full rounded-md border border-amber-500/20 bg-amber-500/5 px-3 flex items-center text-sm font-semibold text-amber-600 dark:text-amber-400">
                                        {t('admins.authority_full')}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="status">{t('employees.account_status')}</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        disabled={isSelf}
                                        onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                                    >
                                        <option value="active">{t('common.active')}</option>
                                        <option value="inactive">{t('common.inactive')}</option>
                                    </select>
                                    {isSelf && (
                                        <p className="text-[11px] text-muted-foreground">
                                            {isRtl ? 'لا يمكنك تعطيل حسابك النشط الحالي.' : 'You cannot deactivate your own active session account.'}
                                        </p>
                                    )}
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {/* Title EN */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="title">{t('admins.title_en')}</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. System Administrator"
                                        dir="ltr"
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                {/* Title AR */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="title_ar">{t('admins.title_ar')}</Label>
                                    <Input
                                        id="title_ar"
                                        value={data.title_ar}
                                        onChange={(e) => setData('title_ar', e.target.value)}
                                        placeholder="مثال: مدير النظام"
                                        dir="rtl"
                                    />
                                    <InputError message={errors.title_ar} />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">{t('employees.phone_number')}</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+20 100 123 4567"
                                        dir="ltr"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
                                <Button asChild variant="outline">
                                    <Link href={adminsIndex()}>{t('common.cancel')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90">
                                    <Save className={`size-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
                                    {processing ? t('common.saving') : t('common.save_changes')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EditAdmin.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Administrators',
            href: adminsIndex(),
        },
        {
            title: 'Edit Administrator',
            href: '#',
        },
    ],
};

