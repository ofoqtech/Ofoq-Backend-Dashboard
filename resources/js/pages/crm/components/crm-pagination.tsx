import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';

interface CrmPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    from: number;
    to: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function CrmPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    from,
    to,
    onPageChange,
    onPageSizeChange,
}: CrmPaginationProps) {
    const { t, isRtl } = useTranslation();

    if (totalItems === 0) {
        return null;
    }

    // Build visible page numbers list
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push('ellipsis-start');
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis-end');
            }
            pages.push(totalPages);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex flex-col gap-3 rounded-b-xl border-t bg-card/60 p-3.5 text-sm sm:flex-row sm:items-center sm:justify-between">
            {/* Info and Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <span>
                    {isRtl ? 'عرض ' : 'Showing '}
                    <span className="font-semibold text-foreground">
                        {from}
                    </span>
                    {isRtl ? ' إلى ' : ' to '}
                    <span className="font-semibold text-foreground">{to}</span>
                    {isRtl ? ' من إجمالي ' : ' of '}
                    <span className="font-semibold text-foreground">
                        {totalItems}
                    </span>
                </span>

                <div className="flex items-center gap-2 border-l pl-3 rtl:border-r rtl:border-l-0 rtl:pr-3 rtl:pl-0">
                    <span className="text-xs font-medium">
                        {t('crm.per_page', 'Per page')}:
                    </span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(val) => onPageSizeChange(Number(val))}
                    >
                        <SelectTrigger className="h-8 w-[74px] cursor-pointer px-2.5 text-xs font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                            side="top"
                            align="center"
                            className="min-w-[74px]"
                        >
                            <SelectItem
                                value="10"
                                className="cursor-pointer text-xs"
                            >
                                10
                            </SelectItem>
                            <SelectItem
                                value="25"
                                className="cursor-pointer text-xs"
                            >
                                25
                            </SelectItem>
                            <SelectItem
                                value="50"
                                className="cursor-pointer text-xs"
                            >
                                50
                            </SelectItem>
                            <SelectItem
                                value="100"
                                className="cursor-pointer text-xs"
                            >
                                100
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                    {/* First Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(1)}
                        className="h-8 w-8 p-0"
                        title={isRtl ? 'الصفحة الأولى' : 'First page'}
                    >
                        {isRtl ? (
                            <ChevronsRight className="size-4" />
                        ) : (
                            <ChevronsLeft className="size-4" />
                        )}
                    </Button>

                    {/* Prev Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="h-8 w-8 p-0"
                        title={isRtl ? 'الصفحة السابقة' : 'Previous page'}
                    >
                        {isRtl ? (
                            <ChevronRight className="size-4" />
                        ) : (
                            <ChevronLeft className="size-4" />
                        )}
                    </Button>

                    {/* Numbered Pages */}
                    <div className="flex items-center gap-1">
                        {pages.map((p, idx) => {
                            if (typeof p === 'string') {
                                return (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="px-1 text-sm text-muted-foreground select-none"
                                    >
                                        …
                                    </span>
                                );
                            }

                            const isActive = p === currentPage;
                            return (
                                <Button
                                    key={p}
                                    variant={isActive ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onPageChange(p)}
                                    className={`h-8 min-w-8 px-2.5 font-mono text-xs font-medium sm:text-sm ${
                                        isActive
                                            ? 'shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {p}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Next Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="h-8 w-8 p-0"
                        title={isRtl ? 'الصفحة التالية' : 'Next page'}
                    >
                        {isRtl ? (
                            <ChevronLeft className="size-4" />
                        ) : (
                            <ChevronRight className="size-4" />
                        )}
                    </Button>

                    {/* Last Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(totalPages)}
                        className="h-8 w-8 p-0"
                        title={isRtl ? 'الصفحة الأخيرة' : 'Last page'}
                    >
                        {isRtl ? (
                            <ChevronsLeft className="size-4" />
                        ) : (
                            <ChevronsRight className="size-4" />
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
