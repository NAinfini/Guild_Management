import React, { useEffect, useState } from 'react';
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
import { Button } from '@/components/button';
import { Input } from '@/components/input/Input';
import { Textarea } from '@/components/input/Textarea';
import { Select, SelectItem } from '@/components/input/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { formatDateTime, cn } from '../../../lib/utils';
import { WarHistoryEntry, WarMemberStat } from '../../../types';
import { Warning, Paid, EmojiFlags, Castle } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { buildWarCardMetrics } from './WarHistory.utils';
import { useAuthStore } from '@/store';
import { canManageGuildWarActive, getEffectiveRole } from '@/lib/permissions';
import { useUpdateWarMemberStats, useUpdateWarStats } from '../hooks/useWars';
import { toast } from '@/lib/toast';

type WarHistoryDetailProps = {
  war: WarHistoryEntry | null;
  open: boolean;
  onClose: () => void;
  timezoneOffset?: number;
};

type EditableSideStats = {
  kills: number;
  towers: number;
  base_hp: number;
  credits: number;
  distance: number;
};

type EditableWarDraft = {
  result: WarHistoryEntry['result'];
  notes: string;
  own_stats: EditableSideStats;
  enemy_stats: EditableSideStats;
  member_stats: WarMemberStat[];
};

const SIDE_METRICS = [
  { key: 'kills', labelKey: 'guild_war.history_metric_kills' },
  { key: 'towers', labelKey: 'dashboard.towers' },
  { key: 'base_hp', labelKey: 'dashboard.base_hp' },
  { key: 'credits', labelKey: 'common.credits' },
  { key: 'distance', labelKey: 'dashboard.distance' },
] as const;

const MEMBER_STAT_FIELDS = [
  'kills',
  'deaths',
  'assists',
  'damage',
  'healing',
  'building_damage',
  'credits',
  'damage_taken',
] as const;

function normalizeMetricValue(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.round(value);
  }

  return 0;
}

function parseMetricInput(raw: string): number {
  const digitsOnly = raw.replace(/[^\d]/g, '');
  if (!digitsOnly) {
    return 0;
  }

  return normalizeMetricValue(Number(digitsOnly));
}

function createDraft(war: WarHistoryEntry): EditableWarDraft {
  return {
    result: war.result,
    notes: war.notes ?? '',
    own_stats: {
      kills: normalizeMetricValue((war.own_stats as any)?.kills),
      towers: normalizeMetricValue((war.own_stats as any)?.towers),
      base_hp: normalizeMetricValue((war.own_stats as any)?.base_hp),
      credits: normalizeMetricValue((war.own_stats as any)?.credits),
      distance: normalizeMetricValue((war.own_stats as any)?.distance),
    },
    enemy_stats: {
      kills: normalizeMetricValue((war.enemy_stats as any)?.kills),
      towers: normalizeMetricValue((war.enemy_stats as any)?.towers),
      base_hp: normalizeMetricValue((war.enemy_stats as any)?.base_hp),
      credits: normalizeMetricValue((war.enemy_stats as any)?.credits),
      distance: normalizeMetricValue((war.enemy_stats as any)?.distance),
    },
    member_stats: (war.member_stats ?? []).map((member) => ({
      ...member,
      kills: normalizeMetricValue((member as any).kills),
      deaths: normalizeMetricValue((member as any).deaths),
      assists: normalizeMetricValue((member as any).assists),
      damage: normalizeMetricValue((member as any).damage),
      healing: normalizeMetricValue((member as any).healing),
      building_damage: normalizeMetricValue((member as any).building_damage),
      credits: normalizeMetricValue((member as any).credits),
      damage_taken: normalizeMetricValue((member as any).damage_taken),
      note: member.note ?? '',
    })),
  };
}

export function WarHistoryDetail({ war, open, onClose, timezoneOffset = 0 }: WarHistoryDetailProps) {
  const { t } = useTranslation();
  const { user, viewRole } = useAuthStore();
  const updateWarStats = useUpdateWarStats();
  const updateWarMemberStats = useUpdateWarMemberStats();
  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canEdit = canManageGuildWarActive(effectiveRole);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draft, setDraft] = useState<EditableWarDraft | null>(null);

  useEffect(() => {
    if (!war) {
      setDraft(null);
      setIsEditMode(false);
      return;
    }

    setDraft(createDraft(war));
    setIsEditMode(false);
  }, [war]);

  if (!war || !draft) {
    return null;
  }

  const metrics = buildWarCardMetrics({
    ...war,
    result: draft.result,
    notes: draft.notes,
    own_stats: {
      ...war.own_stats,
      kills: draft.own_stats.kills,
      towers: draft.own_stats.towers,
      base_hp: draft.own_stats.base_hp,
      credits: draft.own_stats.credits,
      distance: draft.own_stats.distance,
    },
    enemy_stats: {
      ...war.enemy_stats,
      kills: draft.enemy_stats.kills,
      towers: draft.enemy_stats.towers,
      base_hp: draft.enemy_stats.base_hp,
      credits: draft.enemy_stats.credits,
      distance: draft.enemy_stats.distance,
    },
    member_stats: draft.member_stats,
  });

  const memberStatsWithMissing = draft.member_stats.map((member) => {
    const missingFields = MEMBER_STAT_FIELDS.filter((field) => {
      const value = (member as any)[field];
      return value === null || value === undefined;
    });

    return {
      ...member,
      hasMissing: missingFields.length > 0,
      missingFields,
      missingCount: missingFields.length,
    };
  });

  const totalMissingCount = memberStatsWithMissing.reduce((acc, member) => acc + member.missingCount, 0);

  const isSaving = updateWarStats.isPending || updateWarMemberStats.isPending;

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

  const setSideMetric = (side: 'own_stats' | 'enemy_stats', metric: keyof EditableSideStats, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [side]: {
          ...prev[side],
          [metric]: parseMetricInput(value),
        },
      };
    });
  };

  const setMemberMetric = (memberId: string, field: typeof MEMBER_STAT_FIELDS[number], value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        member_stats: prev.member_stats.map((member) =>
          member.id === memberId
            ? { ...member, [field]: parseMetricInput(value) }
            : member,
        ),
      };
    });
  };

  const setMemberNote = (memberId: string, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        member_stats: prev.member_stats.map((member) =>
          member.id === memberId ? { ...member, note: value } : member,
        ),
      };
    });
  };

  const resetDraft = () => {
    setDraft(createDraft(war));
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!war || !draft) {
      return;
    }

    try {
      await updateWarStats.mutateAsync({
        warId: war.id,
        data: {
          result: draft.result,
          notes: draft.notes,
          own_stats: {
            kills: draft.own_stats.kills,
            towers: draft.own_stats.towers,
            base_hp: draft.own_stats.base_hp,
            credits: draft.own_stats.credits,
            distance: draft.own_stats.distance,
          },
          enemy_stats: {
            kills: draft.enemy_stats.kills,
            towers: draft.enemy_stats.towers,
            base_hp: draft.enemy_stats.base_hp,
            credits: draft.enemy_stats.credits,
            distance: draft.enemy_stats.distance,
          },
        },
      });

      await updateWarMemberStats.mutateAsync({
        warId: war.id,
        data: draft.member_stats.map((member) => ({
          ...member,
          note: member.note?.trim() ? member.note.trim() : undefined,
        })),
      });

      toast.success(t('guild_war.history_save_success'));
      setIsEditMode(false);
    } catch (error) {
      toast.apiError(error);
      toast.error(t('guild_war.history_save_error'));
    }
  };

  const renderNumericDisplay = (value: number) => {
    return value.toLocaleString();
  };

  const renderStatField = (side: 'own_stats' | 'enemy_stats', metric: keyof EditableSideStats) => {
    const value = draft[side][metric];

    if (!isEditMode) {
      return (
        <span className="font-mono text-sm font-bold text-foreground">
          {renderNumericDisplay(value)}
        </span>
      );
    }

    return (
      <Input
        value={String(value)}
        onChange={(event) => setSideMetric(side, metric, event.target.value)}
        className="h-8 text-right text-xs font-mono"
        inputProps={{ inputMode: 'numeric', min: 0 }}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()}>
      <DialogContent className="w-[96vw] sm:max-w-6xl max-h-[92vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
                  {war.title}
                </DialogTitle>
                {totalMissingCount > 0 && (
                  <Tooltip
                    content={t('guild_war.history_missing_across_members', {
                      count: totalMissingCount,
                      members: memberStatsWithMissing.filter((member) => member.hasMissing).length,
                    })}
                  >
                    <span className="inline-flex items-center" style={{ color: 'var(--color-status-warning)' }}>
                      <Warning sx={{ fontSize: 20 }} />
                    </span>
                  </Tooltip>
                )}
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                {formatDateTime(war.date, timezoneOffset)}
              </p>
            </div>

            {canEdit && (
              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <Button size="sm" variant="outline" onClick={() => setIsEditMode(true)}>
                    {t('common.edit')}
                  </Button>
                )}
                {isEditMode && (
                  <>
                    <Button size="sm" variant="ghost" onClick={resetDraft} disabled={isSaving}>
                      {t('common.cancel')}
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? t('common.loading') : t('common.save')}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-6 pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="uppercase font-bold border" style={getResultBadgeStyle(draft.result)}>
                {t(`dashboard.${draft.result === 'pending' ? 'pending' : draft.result}`)}
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

            <div className="grid gap-4 md:grid-cols-[280px_1fr]">
              <div className="rounded-lg border border-border p-3 bg-muted/20 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                  {t('guild_war.history_match_overview')}
                </h3>
                {isEditMode ? (
                  <Select
                    value={draft.result}
                    onChange={(event) =>
                      setDraft((prev) => (prev ? { ...prev, result: event.target.value as WarHistoryEntry['result'] } : prev))
                    }
                  >
                    <SelectItem value="victory">{t('dashboard.victory')}</SelectItem>
                    <SelectItem value="defeat">{t('dashboard.defeat')}</SelectItem>
                    <SelectItem value="draw">{t('dashboard.draw')}</SelectItem>
                    <SelectItem value="pending">{t('dashboard.pending')}</SelectItem>
                  </Select>
                ) : (
                  <Badge variant="outline" className="uppercase">
                    {t(`dashboard.${draft.result}`)}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  {isEditMode ? t('guild_war.history_edit_mode') : t('guild_war.history_readonly_mode')}
                </p>
              </div>

              <div className="rounded-lg border border-border p-3 bg-muted/10 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                  {t('guild_war.history_battle_notes')}
                </h3>
                {isEditMode ? (
                  <Textarea
                    value={draft.notes}
                    onChange={(event) =>
                      setDraft((prev) => (prev ? { ...prev, notes: event.target.value } : prev))
                    }
                    className="min-h-[96px] bg-[var(--cmp-input-bg)] border-[color:var(--cmp-input-border)]"
                    placeholder={t('guild_war.history_notes_placeholder')}
                  />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {draft.notes || t('common.no_intel')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(['own_stats', 'enemy_stats'] as const).map((side) => (
                <div key={side} className="rounded-lg border border-border p-3 bg-muted/10 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    {side === 'own_stats' ? t('guild_war.history_ours_short') : t('guild_war.history_enemy_short')}
                  </h3>
                  <div className="space-y-2">
                    {SIDE_METRICS.map((metric) => (
                      <div key={metric.key} className="grid grid-cols-[1fr_120px] items-center gap-3">
                        <span className="text-xs text-muted-foreground">{t(metric.labelKey)}</span>
                        {renderStatField(side, metric.key)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
                  {t('guild_war.member_performance')}
                </h3>
                {isEditMode && (
                  <p className="text-xs text-muted-foreground">{t('guild_war.history_edit_warning')}</p>
                )}
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[170px]">{t('nav.roster')}</TableHead>
                      <TableHead className="text-right">K</TableHead>
                      <TableHead className="text-right">D</TableHead>
                      <TableHead className="text-right">A</TableHead>
                      <TableHead className="text-right">{t('common.damage')}</TableHead>
                      <TableHead className="text-right">{t('common.healing')}</TableHead>
                      <TableHead className="text-right">{t('guild_war.history_metric_building_damage_short')}</TableHead>
                      <TableHead className="text-right">{t('common.credits')}</TableHead>
                      <TableHead className="text-right">{t('guild_war.history_metric_damage_taken_short')}</TableHead>
                      <TableHead className="w-[160px]">{t('guild_war.history_member_note')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberStatsWithMissing.map((member) => (
                      <TableRow
                        key={member.id}
                        className={cn(
                          member.hasMissing &&
                            'bg-[color:color-mix(in_srgb,var(--color-status-warning-bg)_22%,transparent)]',
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            {member.hasMissing && (
                              <Tooltip content={t('guild_war.history_missing_fields', { fields: member.missingFields.join(', ') })}>
                                <Warning sx={{ fontSize: 12, color: 'var(--color-status-warning)' }} />
                              </Tooltip>
                            )}
                            <span>{member.username}</span>
                          </div>
                        </TableCell>

                        {MEMBER_STAT_FIELDS.map((field) => (
                          <TableCell key={`${member.id}-${field}`} className="text-right font-mono">
                            {isEditMode ? (
                              <Input
                                value={String((member as any)[field] ?? 0)}
                                onChange={(event) => setMemberMetric(member.id, field, event.target.value)}
                                className="h-8 text-right text-xs font-mono"
                                inputProps={{ inputMode: 'numeric', min: 0 }}
                              />
                            ) : (
                              <span>{((member as any)[field] ?? 0).toLocaleString()}</span>
                            )}
                          </TableCell>
                        ))}

                        <TableCell>
                          {isEditMode ? (
                            <Input
                              value={member.note ?? ''}
                              onChange={(event) => setMemberNote(member.id, event.target.value)}
                              className="h-8 text-xs"
                            />
                          ) : (
                            <span className="text-muted-foreground">{member.note || '-'}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
                {t('guild_war.teams_snapshot')}
              </h3>
              <div className="space-y-2">
                {war.teams_snapshot && war.teams_snapshot.length > 0 ? (
                  war.teams_snapshot.map((team) => (
                    <div key={team.id} className="flex flex-wrap items-center gap-2 bg-muted/20 p-2 rounded-lg border border-border/60">
                      <Badge variant="default" className="uppercase font-bold">
                        {team.name}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {team.members.map((member) => (
                          <Badge key={member.user_id} variant="outline" className="text-muted-foreground border-border bg-background">
                            {member.username || member.user_id}
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
