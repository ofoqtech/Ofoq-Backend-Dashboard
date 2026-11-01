import { useState, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Camera, Check, Loader2, Mail, Phone, Shield, Trash2, User as UserIcon } from 'lucide-react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/lib/i18n';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const { t, isRtl } = useTranslation();
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const userTitleEn =
        typeof auth.user.title === 'object' && auth.user.title !== null
            ? (auth.user.title.en ?? '')
            : (typeof auth.user.title === 'string' ? auth.user.title : '');

    const userTitleAr =
        typeof auth.user.title === 'object' && auth.user.title !== null
            ? (auth.user.title.ar ?? '')
            : '';

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'PATCH',
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
        title: userTitleEn,
        title_ar: userTitleAr,
        avatar: null as File | null,
        remove_avatar: false,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                avatar: file,
                remove_avatar: false,
            }));
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleRemoveAvatar = () => {
        setData((prev) => ({
            ...prev,
            avatar: null,
            remove_avatar: true,
        }));
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/profile', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setAvatarPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const currentAvatarSrc = avatarPreview || auth.user.avatar;
    const hasAvatar = Boolean(currentAvatarSrc && !data.remove_avatar);

    return (
        <>
            <Head title={t('profile.settings')} />

            <h1 className="sr-only">{t('profile.settings')}</h1>

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title={t('profile.title')}
                    description={t('profile.desc')}
                />

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Picture & Identity Card */}
                    <div className="rounded-xl border bg-card p-5 shadow-xs">
                        <Label className="text-sm font-semibold text-foreground block mb-4">
                            {t('profile.photo')}
                        </Label>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative group shrink-0">
                                <div className="size-24 rounded-full border-2 border-border shadow-md overflow-hidden bg-primary/10 flex items-center justify-center">
                                    {hasAvatar ? (
                                        <img
                                            src={currentAvatarSrc!}
                                            alt={auth.user.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary">
                                            {getInitials(auth.user.name)}
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    title={t('profile.change_photo')}
                                    className="absolute bottom-0 end-0 size-8 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95"
                                >
                                    <Camera className="size-4" />
                                </button>
                            </div>

                            <div className="flex-1 text-center sm:text-start space-y-3">
                                <div>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <h3 className="font-bold text-base text-foreground">
                                            {auth.user.name}
                                        </h3>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs font-medium capitalize"
                                        >
                                            {auth.user.is_admin ? (
                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                    <Shield className="size-3" />
                                                    {t('admins.badge_super')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-primary">
                                                    <UserIcon className="size-3" />
                                                    {t('employees.title_single')}
                                                </span>
                                            )}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={
                                                auth.user.status === 'active'
                                                    ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
                                                    : 'border-muted text-muted-foreground'
                                            }
                                        >
                                            {auth.user.status === 'active'
                                                ? t('common.active')
                                                : t('common.inactive')}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t('profile.photo_hint')}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/gif"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-8 text-xs gap-1.5"
                                    >
                                        <Camera className="size-3.5" />
                                        {hasAvatar ? t('profile.change_photo') : t('profile.upload_photo')}
                                    </Button>

                                    {hasAvatar && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveAvatar}
                                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                                        >
                                            <Trash2 className="size-3.5" />
                                            {t('profile.remove_photo')}
                                        </Button>
                                    )}
                                </div>

                                {errors.avatar && (
                                    <InputError message={errors.avatar} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal & Contact Details */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">
                                    {t('profile.name')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Eng. Hazem Mansour"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email">
                                    {t('profile.email')} <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="username"
                                        placeholder="user@ofoq.tech"
                                        className={isRtl ? 'pe-9' : 'ps-9'}
                                    />
                                    <Mail className={`size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 ${isRtl ? 'end-3' : 'start-3'}`} />
                                </div>
                                <InputError message={errors.email} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">{t('profile.phone')}</Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+20 100 000 0000"
                                        className={isRtl ? 'pe-9' : 'ps-9'}
                                    />
                                    <Phone className={`size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 ${isRtl ? 'end-3' : 'start-3'}`} />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="title">{t('profile.job_title')}</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Senior Fullstack Engineer"
                                />
                                <InputError message={errors.title} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="title_ar">{t('profile.job_title_ar')}</Label>
                            <Input
                                id="title_ar"
                                dir="rtl"
                                value={data.title_ar}
                                onChange={(e) => setData('title_ar', e.target.value)}
                                placeholder="مثال: مهندس برمجيات أول"
                            />
                            <InputError message={errors.title_ar} />
                        </div>
                    </div>

                    {/* Email Verification Banner */}
                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground space-y-2">
                            <p className="font-medium text-amber-800 dark:text-amber-300">
                                {t('profile.unverified_email')}
                            </p>
                            <Link
                                href={send()}
                                as="button"
                                className="text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                            >
                                {t('profile.resend_verification')}
                            </Link>

                            {status === 'verification-link-sent' && (
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                                    {t('profile.verification_sent')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex items-center gap-4 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            data-test="update-profile-button"
                            className="min-w-28"
                        >
                            {processing ? (
                                <span className="flex items-center gap-1.5">
                                    <Loader2 className="size-4 animate-spin" />
                                    {t('common.save')}...
                                </span>
                            ) : (
                                t('common.save')
                            )}
                        </Button>

                        {recentlySuccessful && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-opacity">
                                <Check className="size-3.5" />
                                {t('profile.saved')}
                            </span>
                        )}
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
