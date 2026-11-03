import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import type { ChannelAnalytic } from '@/types/crm';
import { ChannelBadge } from './channel-badge';

interface CrmChannelsBreakdownProps {
    channels: ChannelAnalytic[];
    selectedChannel: string;
    onSelectChannel: (channel: string) => void;
}

export function CrmChannelsBreakdown({
    channels,
    selectedChannel,
    onSelectChannel,
}: CrmChannelsBreakdownProps) {
    const { t, isRtl } = useTranslation();

    if (!channels || channels.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                        {t('crm.channels_breakdown')}
                    </h3>
                    {selectedChannel && (
                        <button
                            type="button"
                            onClick={() => onSelectChannel('')}
                            className="cursor-pointer text-sm font-medium text-primary hover:underline"
                        >
                            ({t('common.reset')})
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {channels.map((ch) => {
                    const isSelected = selectedChannel === ch.key;

                    return (
                        <Card
                            key={ch.key}
                            onClick={() =>
                                onSelectChannel(isSelected ? '' : ch.key)
                            }
                            className={`cursor-pointer transition-all duration-150 hover:border-primary/50 hover:shadow-xs ${
                                isSelected
                                    ? 'border-primary bg-primary/[0.04] ring-1 ring-primary'
                                    : 'border-border/70 bg-card/60'
                            }`}
                        >
                            <CardContent className="p-3 sm:p-3.5">
                                <div className="flex items-center justify-between gap-1">
                                    <ChannelBadge
                                        channelKey={ch.key}
                                        size="md"
                                    />
                                    <span className="font-mono text-sm font-bold text-foreground">
                                        {ch.count}
                                    </span>
                                </div>

                                <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span>{ch.percentage}%</span>
                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(100, Math.max(ch.percentage, ch.count > 0 ? 8 : 0))}%`,
                                                backgroundColor: ch.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
