import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    ChevronRight,
    FolderKanban,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';
import type { Auth } from '@/types';

export default function Welcome() {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Ofoq Technology - Operations Portal" />

            <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-background text-foreground">
                {/* Background ambient lighting */}
                <div
                    className="pointer-events-none absolute -top-40 left-1/2 size-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(32,184,213,0.15)_0%,transparent_70%)] blur-3xl"
                    aria-hidden="true"
                />

                {/* Navbar */}
                <header className="relative z-10 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo dark.jpeg"
                                alt="Ofoq Technology"
                                className="size-9 rounded-xl border border-border bg-muted object-contain p-1 shadow-xs"
                            />
                            <div>
                                <span className="text-base font-bold tracking-tight text-foreground">
                                    Ofoq Technology
                                </span>
                                <span className="ml-2 hidden text-xs font-medium text-[#20B8D5] sm:inline-block">
                                    أفق للتقنية
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>
                                        Go to Dashboard
                                        <ArrowRight className="ml-1.5 size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild size="sm">
                                    <Link href={login()}>
                                        Sign In
                                        <ArrowRight className="ml-1.5 size-4" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero section */}
                <main className="relative z-10 mx-auto max-w-5xl px-6 py-16 text-center lg:py-24">
                    <Badge
                        variant="outline"
                        className="mb-4 border-[#20B8D5]/30 bg-[#20B8D5]/10 px-3 py-1 text-xs text-[#20B8D5]"
                    >
                        Enterprise Operations & Portfolio Hub
                    </Badge>

                    <h1 className="font-sans text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                        Ofoq Technology{' '}
                        <span className="bg-gradient-to-r from-[#20B8D5] to-[#0D2B55] bg-clip-text text-transparent dark:to-[#19C5E8]">
                            Management Portal
                        </span>
                    </h1>

                    <p
                        className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg"
                        dir="rtl"
                    >
                        بوابة إدارة مشاريع وأعمال شركة أفق للتقنية — متابعة فرق
                        العمل، الأنظمة السحابية، وتطبيقات الجوال والويب.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="shadow-lg shadow-[#20B8D5]/20"
                        >
                            <Link href={auth?.user ? dashboard() : login()}>
                                {auth?.user
                                    ? 'Enter Dashboard'
                                    : 'Sign In to Access Dashboard'}
                                <ChevronRight className="ml-1.5 size-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Features grid */}
                    <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <FolderKanban className="mb-3 size-8 text-[#20B8D5]" />
                            <h3 className="text-base font-semibold">
                                Projects & Showcase
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Full management of bilingual project details,
                                image galleries, technologies, and client impact
                                metrics.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <Users className="mb-3 size-8 text-[#20B8D5]" />
                            <h3 className="text-base font-semibold">
                                Team & Employees
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Staff roster, contact management, department
                                roles, and secure access permissions for team
                                members.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <ShieldCheck className="mb-3 size-8 text-[#20B8D5]" />
                            <h3 className="text-base font-semibold">
                                Role-Based Control
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Fine-grained administrative permissions
                                safeguarding system operations and sensitive
                                company assets.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Ofoq Technology (أفق
                    للتقنية). All rights reserved.
                </footer>
            </div>
        </>
    );
}
