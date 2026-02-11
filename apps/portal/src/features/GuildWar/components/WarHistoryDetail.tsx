
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/feedback/Dialog';
import { Badge } from '@/components/data-display/Badge';
import { Separator } from '@/components/data-display/Separator';
import { Tooltip } from '@/components/feedback/Tooltip';
import { ScrollArea } from '@/components/layout/ScrollArea';

import { formatDateTime, cn } from '../../../lib/utils';
import { WarHistoryEntry } from '../../../types';
import {
  Warning,
  Paid,
  EmojiFlags,
  Castle,
  Close,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { buildWarCardMetrics } from './WarHistory.utils';

type WarHistoryDetailProps = {
  war: WarHistoryEntry | null;
  open: boolean;
  onClose: () => void;
  timezoneOffset?: number;
};

export function WarHistoryDetail({ war, open, onClose, timezoneOffset = 0 }: WarHistoryDetailProps) {
  const { t } = useTranslation();
  if (!war) return null;
  const metrics = buildWarCardMetrics(war);

  // Calculate missing stats per member
  const memberStatsWithMissing = war.member_stats?.map((m) => {
    const allFields = ['damage', 'healing', 'building_damage', 'credits', 'kills', 'deaths', 'assists', 'damage_taken'];
    const missingFields = allFields.filter((k) => (m as any)[k] === null || (m as any)[k] === undefined);
    return {
      ...m,
      hasMissing: missingFields.length > 0,
      missingFields,
      missingCount: missingFields.length,
    };
  }) || [];

  const totalMissingCount = memberStatsWithMissing.reduce((acc, m) => acc + m.missingCount, 0);

  const getSidePillStyle = (side: 'ours' | 'enemy') => {
    if (side === 'ours') {
      return {
        backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 82%, transparent)',
        color: 'var(--color-status-success-fg)',
        borderColor: 'color-mix(in srgb, var(--color-status-success) 48%, transparent)',
      };
    }

    return {
      backgroundColor: 'color-mix(in srgb, var(--color-status-error-bg) 82%, transparent)',
      color: 'var(--color-status-error-fg)',
      borderColor: 'color-mix(in srgb, var(--color-status-error) 48%, transparent)',
    };
  };

  const getResultBadgeStyle = (result: 'victory' | 'defeat' | 'draw' | 'pending') => {
    if (result === 'victory') {
      return {
        backgroundColor: 'var(--color-status-success-bg)',
        color: 'var(--color-status-success-fg)',
        borderColor: 'color-mix(in srgb, var(--color-status-success) 55%, transparent)',
      };
    }

    if (result === 'draw') {
      return {
        backgroundColor: 'var(--color-status-warning-bg)',
        color: 'var(--color-status-warning-fg)',
        borderColor: 'color-mix(in srgb, var(--color-status-warning) 55%, transparent)',
      };
    }

    if (result === 'defeat') {
      return {
        backgroundColor: 'var(--color-status-error-bg)',
        color: 'var(--color-status-error-fg)',
        borderColor: 'color-mix(in srgb, var(--color-status-error) 55%, transparent)',
      };
    }

    return {
      backgroundColor: 'var(--sys-surface-sunken)',
      color: 'var(--sys-text-primary)',
      borderColor: 'var(--sys-border-default)',
    };
  };

  const getResultKey = (result: 'victory' | 'defeat' | 'draw' | 'pending') => {
    if (result === 'pending') {
      return 'pending';
    }

    return result;
  };

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => !val && onClose()}>
      <DialogContent hideCloseButton className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-6">
          <DialogHeader className="relative pb-4 pr-12 border-b">
            <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-black uppercase text-foreground">
                    {war.title}
                </DialogTitle>
                {totalMissingCount > 0 && (
                    <Tooltip content={t('guild_war.history_missing_across_members', { count: totalMissingCount, members: memberStatsWithMissing.filter(m => m.hasMissing).length })}>
                        <div className="flex items-center" style={{ color: 'var(--color-status-warning)' }}>
                            <Warning sx={{ fontSize: 20 }} />
                        </div>
                    </Tooltip>
                )}
            </div>
            <p className="text-sm text-muted-foreground font-bold">
                {formatDateTime(war.date, timezoneOffset)}
            </p>
            <IconButton
              onClick={onClose}
              aria-label={t('common.close', { defaultValue: 'Close' })}
              className="absolute right-0 top-0 rounded-sm"
              sx={{
                padding: '4px',
                color: 'var(--sys-text-secondary)',
                '&:hover': {
                  backgroundColor: 'var(--sys-interactive-hover)',
                  color: 'var(--sys-text-primary)',
                },
                '&:focus-visible, &.Mui-focusVisible': {
                  outline: '2px solid var(--sys-interactive-focus-ring)',
                  outlineOffset: '2px',
                },
              }}
            >
              <Close className="size-4" />
            </IconButton>
          </DialogHeader>

          <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="space-y-6 pt-2">
                
                {/* Metrics Pills */}
                <div className="flex flex-wrap gap-2">
                    <Badge 
                        variant="default" 
                        className="uppercase font-bold border"
                        style={getResultBadgeStyle(war.result)}
                    >
                        {t(`dashboard.${getResultKey(war.result)}`)}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="font-bold"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-status-info-bg) 72%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-status-info) 45%, transparent)',
                        color: 'var(--color-status-info-fg)',
                      }}
                    >
                        KDA {metrics.kills}/{metrics.deaths}/{metrics.assists}
                    </Badge>

                    <Badge variant="outline" className="gap-1 font-bold" style={getSidePillStyle('ours')}>
                        <Paid sx={{ fontSize: 12 }} />
                         {t('guild_war.history_ours_short')} {t('common.credits')}: {metrics.ownCredits.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="gap-1 font-bold" style={getSidePillStyle('enemy')}>
                        <Paid sx={{ fontSize: 12 }} />
                        {t('guild_war.history_enemy_short')} {t('common.credits')}: {metrics.enemyCredits.toLocaleString()}
                    </Badge>

                    <Badge variant="outline" className="gap-1 font-bold" style={getSidePillStyle('ours')}>
                        <EmojiFlags sx={{ fontSize: 12 }} />
                        {t('guild_war.history_ours_short')} {t('dashboard.distance')}: {metrics.ownDistance.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="gap-1 font-bold" style={getSidePillStyle('enemy')}>
                        <EmojiFlags sx={{ fontSize: 12 }} />
                         {t('guild_war.history_enemy_short')} {t('dashboard.distance')}: {metrics.enemyDistance.toLocaleString()}
                    </Badge>

                    <Badge variant="outline" className="gap-1 font-bold" style={getSidePillStyle('ours')}>
                        <Castle sx={{ fontSize: 12 }} />
                        {t('guild_war.history_ours_short')} {t('dashboard.towers')}: {metrics.ownTowers}
                    </Badge>
                    <Badge variant="outline" className="gap-1 font-bold" style={getSidePillStyle('enemy')}>
                        <Castle sx={{ fontSize: 12 }} />
                        {t('guild_war.history_enemy_short')} {t('dashboard.towers')}: {metrics.enemyTowers}
                    </Badge>

                     {totalMissingCount > 0 && (
                        <Badge
                          variant="outline"
                          className="gap-1 font-bold"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 76%, transparent)',
                            color: 'var(--color-status-warning-fg)',
                            borderColor: 'color-mix(in srgb, var(--color-status-warning) 45%, transparent)',
                          }}
                        >
                           <Warning sx={{ fontSize: 12 }} />
                           {t('guild_war.history_missing_stats_total', { count: totalMissingCount })}
                        </Badge>
                     )}
                </div>

                {war.notes && (
                    <div className="bg-muted/50 p-3 rounded-md border border-border text-sm text-balance">
                        {war.notes}
                    </div>
                )}

                <Separator />

                {/* Member Performance Table */}
                <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase text-foreground">{t('guild_war.member_performance')}</h3>
                    
                    <div className="rounded-md border border-border overflow-hidden">
                        <table className="w-full text-xs">
                             <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                                <tr>
                                    <th className="px-3 py-2 text-left">{t('nav.roster')}</th>
                                    <th className="px-3 py-2 text-right">K</th>
                                    <th className="px-3 py-2 text-right">D</th>
                                    <th className="px-3 py-2 text-right">A</th>
                                    <th className="px-3 py-2 text-right">{t('common.damage')}</th>
                                    <th className="px-3 py-2 text-right">{t('common.healing')}</th>
                                    <th className="px-3 py-2 text-right">{t('guild_war.history_metric_building_damage_short', 'B.Dmg')}</th>
                                    <th className="px-3 py-2 text-right">{t('common.credits')}</th>
                                    <th className="px-3 py-2 text-right">{t('guild_war.history_metric_damage_taken_short', 'D.Taken')}</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-border">
                                {memberStatsWithMissing.map((m) => (
                                    <tr 
                                        key={m.id} 
                                        className={cn(
                                            "hover:bg-accent/50 transition-colors",
                                            m.hasMissing &&
                                              "bg-[color:color-mix(in_srgb,var(--color-status-warning-bg)_28%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--color-status-warning-bg)_40%,transparent)]"
                                        )}
                                    >
                                        <td className="px-3 py-2 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                {m.hasMissing && (
                                                    <Tooltip content={t('guild_war.history_missing_fields', { fields: m.missingFields.join(', ') })}>
                                                        <Warning sx={{ fontSize: 12, color: 'var(--color-status-warning)' }} className="shrink-0" />
                                                    </Tooltip>
                                                )}
                                                <span
                                                  className={m.hasMissing ? "font-bold" : ""}
                                                  style={m.hasMissing ? { color: 'var(--color-status-warning-fg)' } : undefined}
                                                >
                                                  {m.username}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-right text-muted-foreground">{m.kills ?? '-'}</td>
                                        <td className="px-3 py-2 text-right text-muted-foreground">{m.deaths ?? '-'}</td>
                                        <td className="px-3 py-2 text-right text-muted-foreground">{m.assists ?? '-'}</td>
                                        <td className="px-3 py-2 text-right font-mono">{m.damage?.toLocaleString() ?? '-'}</td>
                                        <td className="px-3 py-2 text-right font-mono">{m.healing?.toLocaleString() ?? '-'}</td>
                                        <td className="px-3 py-2 text-right font-mono">{m.building_damage?.toLocaleString() ?? '-'}</td>
                                        <td
                                          className="px-3 py-2 text-right font-mono"
                                          style={{ color: 'var(--color-status-warning-fg)' }}
                                        >
                                          {m.credits?.toLocaleString() ?? '-'}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">{m.damage_taken?.toLocaleString() ?? '-'}</td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                </div>

                <Separator />

                {/* Teams Snapshot */}
                <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase text-foreground">{t('guild_war.teams_snapshot')}</h3>
                    <div className="space-y-2">
                        {war.teams_snapshot && war.teams_snapshot.length > 0 ? (
                            war.teams_snapshot.map((team) => (
                                <div key={team.id} className="flex gap-2 flex-wrap items-center bg-muted/20 p-2 rounded-lg border border-border/50">
                                    <Badge variant="default" className="uppercase font-bold">{team.name}</Badge>
                                    <div className="flex gap-1 flex-wrap">
                                    {team.members.map((m) => (
                                        <Badge key={m.user_id} variant="outline" className="text-muted-foreground border-border bg-background">
                                            {m.username || m.user_id}
                                        </Badge>
                                    ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                {t('guild_war.history_no_team_snapshot')}
                            </p>
                        )}
                    </div>
                </div>

            </div>
          </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
