import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 md:p-10">
            {/* Ambient background glows matching ofoq-frontend */}
            <div
                className="pointer-events-none absolute -top-40 left-1/2 size-[650px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(32,184,213,0.12)_0%,transparent_70%)] blur-3xl"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute right-10 -bottom-40 size-[500px] rounded-full bg-[radial-gradient(circle,rgba(13,43,85,0.15)_0%,transparent_70%)] blur-2xl"
                aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col gap-6">
                    {/* Brand Header */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105"
                        >
                            <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#20B8D5] to-[#071B3A] p-1 shadow-lg ring-1 shadow-[#20B8D5]/20 ring-white/20">
                                <img
                                    src="/logo dark.jpeg"
                                    alt="Ofoq Technology"
                                    className="size-full rounded-xl object-contain"
                                />
                            </div>
                        </Link>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold tracking-wider text-[#20B8D5] uppercase">
                                Ofoq Technology &bull; أفق للتقنية
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {title || 'Dashboard Login'}
                            </h1>
                            {description && (
                                <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Card container */}
                    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xl shadow-foreground/5 backdrop-blur-sm sm:p-8">
                        {children}
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Ofoq Technology. All
                        rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
