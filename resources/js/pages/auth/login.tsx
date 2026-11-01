import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Sign in - Ofoq Technology" />

            <PasskeyVerify />

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid gap-5">
                    <div className="grid gap-1.5">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="name@ofoq.tech"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-1.5">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    className="ml-auto text-xs"
                                    tabIndex={5}
                                >
                                    Forgot your password?
                                </TextLink>
                            )}
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-2.5">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) =>
                                setData('remember', Boolean(checked))
                            }
                            tabIndex={3}
                        />
                        <Label
                            htmlFor="remember"
                            className="cursor-pointer text-xs font-normal"
                        >
                            Keep me signed in
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full font-semibold shadow-md shadow-primary/10"
                        tabIndex={4}
                        disabled={processing}
                        data-test="login-button"
                    >
                        {processing && <Spinner />}
                        Sign In to Portal
                    </Button>
                </div>
            </form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-emerald-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Operations Portal Sign-In',
    description: 'Enter your credentials to access the Ofoq management system',
};
