import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Camera, Save, Shield, Trash2, User as UserIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { dashboard } from '@/routes';
import {
    index as employeesIndex,
    update as updateEmployee,
} from '@/routes/employees';
import type { User } from '@/types';

type EditEmployeeProps = {
    employee: User;
    canManageRoles: boolean;
};

export default function EditEmployee({
    employee,
    canManageRoles,
}: EditEmployeeProps) {
    const { t, isRtl } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const initialTitleEn =
        employee.title_en ||
        (typeof employee.title === 'object'
            ? employee.title?.en
            : employee.title) ||
        '';
    const initialTitleAr =
        employee.title_ar ||
        (typeof employee.title === 'object' ? employee.title?.ar : '') ||
        '';

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: employee.name || '',
        email: employee.email || '',
        password: '',
        role: employee.role || 'employee',
        title: initialTitleEn,
        title_ar: initialTitleAr,
        phone: employee.phone || '',
        status: employee.status || 'active',
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
            setAvatarPreview(URL.createObjectURL(file));
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(updateEmployee.url(employee.id), {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={`${t('employees.edit_title')}: ${employee.name}`} />

            <div className="flex h-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Back button & Title */}
                <div>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="-mx-2 mb-2 text-xs"
                    >
                        <Link href={employeesIndex()} prefetch cacheFor="2m">
                            <ArrowLeft
                                className={`mr-1 size-3.5 ${isRtl ? 'mr-0 ml-1 rotate-180' : ''}`}
                            />
                            {t('common.back_to_employees')}
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        {t('employees.edit_title')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('employees.edit_desc')}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {t('employees.info_title')}
                        </CardTitle>
                        <CardDescription>
                            {isRtl
                                ? `تعديل حساب ${employee.name} (${employee.email})`
                                : `Editing account for ${employee.name} (${employee.email})`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            {/* Profile Image */}
                            <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20">
                                <Avatar className="size-16 rounded-full border shadow-xs overflow-hidden">
                                    {(!data.remove_avatar && (avatarPreview || employee.avatar)) && (
                                        <AvatarImage
                                            src={avatarPreview || employee.avatar}
                                            alt={employee.name}
                                            className="object-cover size-full"
                                        />
                                    )}
                                    <AvatarFallback className="size-full text-lg font-bold bg-primary/10 text-primary">
                                        {data.name ? data.name.charAt(0).toUpperCase() : <UserIcon className="size-6" />}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">{t('profile.photo')}</Label>
                                    <div className="flex items-center gap-2">
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
                                            {(avatarPreview || (employee.avatar && !data.remove_avatar))
                                                ? t('profile.change_photo')
                                                : t('profile.upload_photo')}
                                        </Button>
                                        {(avatarPreview || (employee.avatar && !data.remove_avatar)) && (
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
                                    <p className="text-[11px] text-muted-foreground">{t('profile.photo_hint')}</p>
                                    {errors.avatar && <InputError message={errors.avatar} />}
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name">
                                    {t('employees.full_name')}
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder={
                                        isRtl
                                            ? 'مثال: أحمد السيد'
                                            : 'e.g. Ahmad Al-Sayed'
                                    }
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">
                                    {t('employees.email_address')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="name@ofoq.tech"
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
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="••••••••"
                                    dir="ltr"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Role (Locked to Employee) */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="role"
                                        className="flex items-center gap-1.5"
                                    >
                                        <Shield className="size-3.5 text-muted-foreground" />
                                        {t('employees.system_role')}
                                    </Label>
                                    <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-medium text-muted-foreground">
                                        {t('employees.role_employee')}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="status">
                                        {t('employees.account_status')}
                                    </Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData(
                                                'status',
                                                e.target.value as
                                                    | 'active'
                                                    | 'inactive',
                                            )
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <option value="active">
                                            {t('common.active')}
                                        </option>
                                        <option value="inactive">
                                            {t('common.inactive')}
                                        </option>
                                    </select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {/* Title EN */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="title">
                                        {t('employees.title_en')}
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="e.g. Mobile Developer"
                                        dir="ltr"
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                {/* Title AR */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="title_ar">
                                        {t('employees.title_ar')}
                                    </Label>
                                    <Input
                                        id="title_ar"
                                        value={data.title_ar}
                                        onChange={(e) =>
                                            setData('title_ar', e.target.value)
                                        }
                                        placeholder="مثال: مطور تطبيقات جوال"
                                        dir="rtl"
                                    />
                                    <InputError message={errors.title_ar} />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">
                                        {t('employees.phone_number')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="+20 100 123 4567"
                                        dir="ltr"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center justify-end gap-2.5 border-t pt-4">
                                <Button asChild variant="outline">
                                    <Link href={employeesIndex()}>
                                        {t('common.cancel')}
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save
                                        className={`size-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`}
                                    />
                                    {processing
                                        ? t('common.saving')
                                        : t('common.save_changes')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EditEmployee.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Employees',
            href: employeesIndex(),
        },
        {
            title: 'Edit Employee',
            href: '#',
        },
    ],
};
