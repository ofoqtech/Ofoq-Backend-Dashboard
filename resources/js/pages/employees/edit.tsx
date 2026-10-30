import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index as employeesIndex, update as updateEmployee } from '@/routes/employees';
import type { User } from '@/types';

type EditEmployeeProps = {
    employee: User;
    canManageRoles: boolean;
};

export default function EditEmployee({ employee, canManageRoles }: EditEmployeeProps) {
    const initialTitleEn = employee.title_en || (typeof employee.title === 'object' ? employee.title?.en : employee.title) || '';
    const initialTitleAr = employee.title_ar || (typeof employee.title === 'object' ? employee.title?.ar : '') || '';

    const { data, setData, put, processing, errors } = useForm({
        name: employee.name || '',
        email: employee.email || '',
        password: '',
        role: employee.role || 'employee',
        title: initialTitleEn,
        title_ar: initialTitleAr,
        phone: employee.phone || '',
        status: employee.status || 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(updateEmployee.url(employee.id));
    };

    return (
        <>
            <Head title={`Edit ${employee.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
                {/* Back button & Title */}
                <div>
                    <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-xs">
                        <Link href={employeesIndex()}>
                            <ArrowLeft className="mr-1 size-3.5" />
                            Back to Employees
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Edit Team Member
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Update profile, contact details, status, or reset credentials.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Employee Details</CardTitle>
                        <CardDescription>
                            Editing account for {employee.name} ({employee.email})
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
                                    placeholder="e.g. Ahmad Al-Sayed"
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
                                    placeholder="e.g. ahmad@ofoq.tech"
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
                                {/* Role (Locked to Employee) */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="role" className="flex items-center gap-1.5">
                                        <Shield className="size-3.5 text-muted-foreground" />
                                        System Role
                                    </Label>
                                    <div className="h-9 w-full rounded-md border border-input bg-muted/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                                        Employee (Staff Member)
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="status">Account Status *</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
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
                                        placeholder="e.g. Mobile Developer"
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
                                        placeholder="e.g. مطور تطبيقات جوال"
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
                                    <Link href={employeesIndex()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-1.5 size-4" />
                                    {processing ? 'Saving...' : 'Update Employee'}
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

