
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWarHistoryDetail } from '../../../../hooks';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/layout/Drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Badge } from '@/components/data-display/Badge';
import { Separator } from '@/components/data-display/Separator';
import { Button } from '@/components/button';
import {
  Person,
  Place,
  EmojiEvents,
  Dangerous,
  ChevronRight,
  Shield,
  AccessTime,
  Close,
  ChevronLeft,
  Description, // Replaces ScrollText
  MilitaryTech, // Replaces Swords
  Groups, // Replaces Users
  CalendarMonth // Replaces Calendar
} from '@/ui-bridge/icons-material';
import { cn } from '../../../../lib/utils'; // Assuming cn utility is available here or I should use the one from nexus
// The existing file import { cn } from '../../../../lib/cn'; or utils. 
// I'll check if I should use '../../../../lib/utils' or '../../../../lib/cn' 
// The previous files used '../../../../lib/utils' (DecorativeBackground) but Badge used '../../../../lib/cn'.
// Let's check where 'cn' is.
// Badge.tsx imports from '../../../../lib/cn'.
// DecorativeBackground.tsx imports from '../lib/utils'.
// I will use '../../../../lib/utils' if that is the standard for app code, or '../../../../lib/cn' if that is what primitives use.
// But this is a feature component, so it might use app utils.
// Actually, I should check if `lib/utils` exists or `lib/cn` exists.
// I saw `cn.ts` in `src/lib`.
// So `../../../../lib/cn` is correct for `src/features/...` if it is `src/lib/cn.ts`?
// Wait, `src/features/GuildWar/components/WarAnalytics` -> `../../../../lib` would be `src/lib`.
// Yes.

interface WarDetailSidePanelProps {
  warId?: string;
  open: boolean;
  onClose: () => void;
}

export function WarDetailSidePanel({ warId, open, onClose }: WarDetailSidePanelProps) {
  const { t } = useTranslation();
  const { data: war, isLoading } = useWarHistoryDetail(warId || '', {
    enabled: open && !!warId,
  });

  const sortedMemberStats = war?.member_stats
    ? [...war.member_stats].sort((a, b) => (b.damage ?? 0) - (a.damage ?? 0))
    : [];

  return (
    <Drawer 
      open={open} 
      onOpenChange={(isOpen: boolean) => !isOpen && onClose()} 
      direction="right"
    >
      <DrawerContent className="w-full sm:max-w-[460px] p-0 flex flex-col h-full bg-background border-l border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Description className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm uppercase tracking-wider text-foreground">
              {t('common.details')}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
            <Close className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
              <MilitaryTech className="w-12 h-12 mb-4 opacity-20" />
              <p
                data-testid="waranalytics-detail-loading-status"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="text-sm font-medium"
              >
                {t('common.loading')}
              </p>
            </div>
          ) : !war ? (
             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Close className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">{t('common.no_intel')}</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* War Header Info */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-foreground leading-none">
                    {war.title}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <CalendarMonth className="w-3 h-3" />
                    <span>{new Date(war.date).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={war.result === 'victory' ? 'default' : war.result === 'draw' ? 'secondary' : 'destructive'}
                    className="uppercase tracking-wider font-bold px-2 border"
                    style={
                      war.result === 'victory'
                        ? {
                            backgroundColor: 'var(--color-status-success-bg)',
                            color: 'var(--color-status-success-fg)',
                            borderColor: 'color-mix(in srgb, var(--color-status-success) 55%, transparent)',
                          }
                        : war.result === 'draw'
                          ? {
                              backgroundColor: 'var(--color-status-warning-bg)',
                              color: 'var(--color-status-warning-fg)',
                              borderColor: 'color-mix(in srgb, var(--color-status-warning) 55%, transparent)',
                            }
                          : undefined
                    }
                  >
                    {t(`dashboard.${war.result}`)}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-mono">
                    <span className="text-primary font-bold">ALLIES:</span> {war.own_stats.kills}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-mono">
                    <span className="text-destructive font-bold">ENEMY:</span> {war.enemy_stats.kills}
                  </Badge>
                </div>

                {war.notes && (
                  <div className="p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground italic border border-border/50">
                    "{war.notes}"
                  </div>
                )}
              </div>

              <Separator />

              {/* Teams Snapshot */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <Groups className="w-4 h-4 text-primary" />
                   <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {t('guild_war.teams_snapshot')}
                   </h3>
                </div>

                {war.teams_snapshot.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic pl-6">
                    {t('guild_war.history_no_team_snapshot')}
                  </p>
                ) : (
                  <div className="space-y-3 pl-1">
                    {war.teams_snapshot.map((team) => (
                      <div key={team.id} className="space-y-1.5">
                        <p className="text-xs font-bold text-foreground">
                          {team.name}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {team.members.map((member) => (
                            <Badge 
                              key={`${team.id}-${member.user_id}`}
                              variant="secondary"
                              className="text-[10px] px-1.5 h-5 font-medium bg-secondary/50 hover:bg-secondary"
                            >
                              {member.username || member.user_id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Member Performance */}
              <div className="space-y-3">
                <div className="bg-card border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2">
                  <EmojiEvents className="w-5 h-5" sx={{ color: 'var(--color-status-warning)' }} />
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('guild_war.best_performance')}</div>
                </div>

                {sortedMemberStats.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                    <p className="text-xs">{t('guild_war.analytics_table_no_data')}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-8 text-xs font-bold text-muted-foreground uppercase">{t('guild_war.analytics_table_member')}</TableHead>
                          <TableHead className="h-8 text-xs font-bold text-muted-foreground uppercase text-right w-12">K</TableHead>
                          <TableHead className="h-8 text-xs font-bold text-muted-foreground uppercase text-right w-12">D</TableHead>
                          <TableHead className="h-8 text-xs font-bold text-muted-foreground uppercase text-right w-12">A</TableHead>
                          <TableHead className="h-8 text-xs font-bold text-muted-foreground uppercase text-right w-16">{t('common.damage')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMemberStats.slice(0, 12).map((row) => (
                          <TableRow key={row.id} className="h-9 hover:bg-muted/30">
                            <TableCell className="py-1 text-xs font-medium">{row.username}</TableCell>
                            <TableCell className="py-1 text-xs text-right font-mono text-muted-foreground">{row.kills ?? '-'}</TableCell>
                            <TableCell className="py-1 text-xs text-right font-mono text-muted-foreground">{row.deaths ?? '-'}</TableCell>
                            <TableCell className="py-1 text-xs text-right font-mono text-muted-foreground">{row.assists ?? '-'}</TableCell>
                            <TableCell className="py-1 text-xs text-right font-mono font-bold">{row.damage ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
