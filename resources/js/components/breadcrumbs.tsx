import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useTranslation } from '@/lib/i18n';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    const { t } = useTranslation();

    const getTranslatedTitle = (title: string): string => {
        const lower = title.toLowerCase().trim();
        switch (lower) {
            case 'dashboard':
                return t('nav.dashboard');
            case 'crm & leads':
            case 'crm':
            case 'crm & client inquiries':
                return t('nav.crm');
            case 'projects':
            case 'portfolio projects':
                return t('nav.projects');
            case 'categories':
            case 'project categories':
                return t('nav.categories');
            case 'employees':
            case 'employee staff':
                return t('nav.employees');
            case 'administrators':
            case 'admins':
            case 'system administrators':
                return t('nav.admins');
            case 'profile':
            case 'profile settings':
                return t('nav.profile');
            case 'security':
                return t('nav.security');
            case 'appearance':
                return t('nav.appearance');
            default:
                return title;
        }
    };

    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            const translated = getTranslatedTitle(item.title);

                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>
                                                {translated}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link
                                                    href={item.href}
                                                    prefetch="hover"
                                                    cacheFor="1m"
                                                >
                                                    {translated}
                                                </Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
