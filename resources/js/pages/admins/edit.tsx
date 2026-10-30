import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Save, ShieldAlert, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index as adminsIndex, update as updateAdmin } from '@/routes/admins';
import type { User } from '@/types';

type EditAdminProps = {
    admin: User;
    isSelf: boolean;
};

export default function EditAdmin({ admin, isSelf }: EditAdminProps) {
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
            <Head title={`Edit ${admin.name} - Administrator`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
                {/* Back button & Title */}
                <div>
                    <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-xs">
                        <Link href={adminsIndex()}>
                            <ArrowLeft className="mr-1 size-3.5" />
                            Back to Administrators
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Edit Administrator
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Update administrator credentials, bilingual title, contact details, or status.
                    </p>
                </div>

                {isSelf && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                        <Info className="size-4 shrink-0" />
                        <span>You are currently editing your own administrator account.</span>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="size-5 text-amber-500" />
                            Administrator Account Details
                        </CardTitle>
                        <CardDescription>
                            Editing administrator account for {admin.name} ({admin.email})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Tariq Al-Nuaimi"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g. admin@ofoq.tech"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password (Optional) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">
                                    New Password <span className="text-xs text-muted-foreground font-normal">(leave blank to keep current)</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* System Authority */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="role" className="flex items-center gap-1.5">
                                        <ShieldCheck className="size-3.5 text-amber-500" />
                                        System Authority
                                    </Label>
                                    <div className="h-9 w-full rounded-md border border-amber-500/20 bg-amber-500/5 px-3 flex items-center text-sm font-semibold text-amber-600 dark:text-amber-400">
                                        Administrator (Full System Control)
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="status">Account Status *</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        disabled={isSelf}
                                        onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {isSelf && (
                                        <p className="text-[11px] text-muted-foreground">
                                            You cannot deactivate your own active session account.
                                        </p>
                                    )}
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {/* Title EN */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="title">Job Title (EN)</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. System Administrator"
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                {/* Title AR */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="title_ar">Job Title (AR)</Label>
                                    <Input
                                        id="title_ar"
                                        value={data.title_ar}
                                        onChange={(e) => setData('title_ar', e.target.value)}
                                        placeholder="e.g. مدير النظام"
                                        dir="rtl"
                                    />
                                    <InputError message={errors.title_ar} />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="e.g. +20 100 123 4567"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
                                <Button asChild variant="outline">
                                    <Link href={adminsIndex()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90">
                                    <Save className="mr-1.5 size-4" />
                                    {processing ? 'Saving...' : 'Update Administrator'}
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

