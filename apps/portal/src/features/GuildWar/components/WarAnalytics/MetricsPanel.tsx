
/**
 * War Analytics - Metrics Panel Component
 *
 * Right panel with:
 * - Primary metric selector
 * - Aggregation selector (for Rankings)
 * - Mode-aware summary cards
 * - Share button
 */

import { Tooltip as MuiTooltip, IconButton } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import InfoIcon from "@mui/icons-material/Info";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from './AnalyticsContext';
import { formatMetricName, formatNumber, formatCompactNumber } from './types';
import type { MemberStats } from './types';
import { ShareButton } from './ShareButton';
import { NormalizationDiagnosticsPanel } from './NormalizationDiagnosticsPanel';
import { useAuthStore } from '@/store';
import { canManageGuildWarFormula, getEffectiveRole } from '@/lib/permissions';
import { Card, CardContent, Separator } from '@/components';

// ============================================================================
// Main Component
// ============================================================================

interface MetricsPanelProps {
  analyticsData?: {
    memberStats: MemberStats[];
    [key: string]: any;
  };
  canCopy?: boolean;
}

export function MetricsPanel({ analyticsData, canCopy = true }: MetricsPanelProps) {
  const { filters, compareMode } = useAnalytics();
  const { user, viewRole } = useAuthStore();
  const canViewFormulaVersion = canManageGuildWarFormula(getEffectiveRole(user?.role, viewRole));
  
  const diagnosticsRows = (analyticsData?.perWarStats || []).filter((row: any) => {
    if (filters.mode !== 'compare' || compareMode.selectedUserIds.length === 0) {
      return true;
    }
    return compareMode.selectedUserIds.includes(Number(row.user_id));
  });

  return (
    <div className="space-y-4">
      {/* Mode-Aware Summary Cards */}
      <ModeSummaryCards analyticsData={analyticsData} />

      {filters.opponentNormalized && canCopy && diagnosticsRows.length > 0 && (
        <>
          <Separator className="my-4" />
          <EmojiEventsIcon sx={{ fontSize: 16, color: 'var(--color-status-warning)', mb: 0.5 }} />
          <NormalizationDiagnosticsPanel
            rows={diagnosticsRows}
            metric={filters.primaryMetric}
            formulaVersion={canViewFormulaVersion ? analyticsData?.meta?.normalizationFormulaVersion : null}
            canCopy={canCopy}
            canViewFormulaVersion={canViewFormulaVersion}
          />
        </>
      )}

      <Separator className="my-4" />

      {/* Share Button */}
      <ShareButton disabled={!canCopy} analyticsData={analyticsData} />
    </div>
  );
}

// ============================================================================
// Mode-Aware Summary Cards
// ============================================================================

function ModeSummaryCards({ analyticsData }: { analyticsData?: any }) {
  const { filters, compareMode, teamsMode } = useAnalytics();

  if (!analyticsData || !analyticsData.memberStats) {
    return null;
  }

  switch (filters.mode) {
    case 'compare':
      if (compareMode.selectedUserIds.length === 0) return null;
      return <CompareSummaryCards userIds={compareMode.selectedUserIds} data={analyticsData} />;

    case 'rankings':
      return <RankingsSummaryCards data={analyticsData} />;

    case 'teams':
      if (teamsMode.selectedTeamIds.length === 0) return null;
      return <TeamsSummaryCards data={analyticsData} selectedTeamIds={teamsMode.selectedTeamIds} />;

    default:
      return null;
  }
}

// ============================================================================
// Compare Mode Summary
// ============================================================================

function CompareSummaryCards({ userIds, data }: { userIds: number[]; data: any }) {
  const { t } = useTranslation();
  const { filters } = useAnalytics();
  const members = data.memberStats.filter((m: MemberStats) => userIds.includes(m.user_id));

  if (members.length === 0) return null;

  // Find top performer
  const metricKey = `total_${filters.primaryMetric}` as keyof MemberStats;
  const topMember = [...members].sort(
    (a, b) => ((b[metricKey] as number) || 0) - ((a[metricKey] as number) || 0)
  )[0];

  // Calculate average across selected members
  const totalValues = members.map((m: MemberStats) => (m[metricKey] as number) || 0);
  const average = totalValues.reduce((sum: number, v: number) => sum + v, 0) / totalValues.length;

  return (
    <div className="space-y-4">
      {/* Top Performer */}
      <Card>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <EmojiEventsIcon className="w-4 h-4" sx={{ color: 'var(--color-status-warning)' }} />
            <span className="text-xs font-bold uppercase text-muted-foreground">
              {t('guild_war.analytics_top_performer')}
            </span>
          </div>
          <div className="font-bold text-sm">
            {topMember.username}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {formatCompactNumber((topMember[metricKey] as number) || 0)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatMetricName(filters.primaryMetric)}
          </div>
        </CardContent>
      </Card>

      {/* Group Average */}
      <Card>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUpIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase text-muted-foreground">
              {t('guild_war.analytics_group_average')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {formatCompactNumber(average)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('guild_war.analytics_across_members', { count: members.length })}
          </div>
        </CardContent>
      </Card>

      {/* Participation */}
      <Card>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <LocalActivityIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase text-muted-foreground">
              {t('guild_war.analytics_participation')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
             {members.reduce((sum: number, m: MemberStats) => sum + m.wars_participated, 0)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('guild_war.analytics_total_war_participations')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Rankings Mode Summary
// ============================================================================

function RankingsSummaryCards({ data }: { data: any }) {
  const { t } = useTranslation();
  const { filters } = useAnalytics();

  if (!data.memberStats || data.memberStats.length === 0) return null;

  const metricKey = `total_${filters.primaryMetric}` as keyof MemberStats;
  const topMembers = [...data.memberStats]
    .sort((a, b) => ((b[metricKey] as number) || 0) - ((a[metricKey] as number) || 0))
    .slice(0, 5);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <EmojiEventsIcon className="w-4 h-4" sx={{ color: 'var(--color-status-warning)' }} />
          <span className="text-xs font-bold uppercase text-muted-foreground">
            {t('guild_war.analytics_top_quick_view')}
          </span>
        </div>

        <div className="space-y-2">
          {topMembers.map((member, index) => (
            <div
              key={member.user_id}
              className={`p-2 rounded-md flex justify-between items-center ${
                  index === 0 ? 'border' : 'bg-accent/50 hover:bg-accent'
              }`}
              style={
                index === 0
                  ? {
                      backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 78%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-status-warning) 44%, transparent)',
                    }
                  : undefined
              }
            >
              <span className="font-semibold text-sm">
                {index + 1}. {member.username}
              </span>
              <span className="font-mono font-bold text-sm">
                {formatCompactNumber((member[metricKey] as number) || 0)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Teams Mode Summary
// ============================================================================

function TeamsSummaryCards({
  data,
  selectedTeamIds,
}: {
  data: any;
  selectedTeamIds: number[];
}) {
  const { t } = useTranslation();
  const { filters, teamsMode } = useAnalytics();
  const teamRows = (data.teamStats || []).filter((row: any) => selectedTeamIds.includes(row.team_id));

  if (teamRows.length === 0) return null;

  const metricKey = `${teamsMode.showTotal ? 'total' : 'avg'}_${filters.primaryMetric}`;
  const byTeam = new Map<number, { name: string; values: number[]; memberCounts: number[] }>();

  for (const row of teamRows) {
    const entry =
      byTeam.get(row.team_id) ??
      ({
        name: row.team_name || t('guild_war.analytics_team_fallback', { id: row.team_id }),
        values: [],
        memberCounts: [],
      } as { name: string; values: number[]; memberCounts: number[] });
    const value = Number(row[metricKey] ?? 0);
    entry.values.push(Number.isFinite(value) ? value : 0);
    entry.memberCounts.push(Number(row.member_count ?? 0));
    byTeam.set(row.team_id, entry);
  }

  const teamSummaries = [...byTeam.entries()].map(([teamId, entry]) => {
    const total = entry.values.reduce((sum, value) => sum + value, 0);
    const avgPerWar = entry.values.length > 0 ? total / entry.values.length : 0;
    const variance =
      entry.values.length > 1
        ? entry.values.reduce((sum, value) => sum + (value - avgPerWar) ** 2, 0) / entry.values.length
        : 0;
    const stdDev = Math.sqrt(variance);
    const avgMemberCount =
      entry.memberCounts.length > 0
        ? entry.memberCounts.reduce((sum, count) => sum + count, 0) / entry.memberCounts.length
        : 0;

    return {
      teamId,
      teamName: entry.name,
      total,
      avgPerWar,
      stdDev,
      avgMemberCount,
      warCount: entry.values.length,
    };
  });

  teamSummaries.sort((a, b) => b.total - a.total);
  const topTeam = teamSummaries[0];
  const globalAvgPerWar =
    teamSummaries.reduce((sum, team) => sum + team.avgPerWar, 0) / Math.max(teamSummaries.length, 1);
  const avgStdDev =
    teamSummaries.reduce((sum, team) => sum + team.stdDev, 0) / Math.max(teamSummaries.length, 1);
  const avgDepth =
    teamSummaries.reduce((sum, team) => sum + team.avgMemberCount, 0) / Math.max(teamSummaries.length, 1);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <EmojiEventsIcon className="w-4 h-4" sx={{ color: 'var(--color-status-warning)' }} />
            <span className="text-xs font-bold uppercase text-muted-foreground">
              {t('guild_war.analytics_top_performer')}
            </span>
          </div>
          <div className="font-bold text-sm">
            {topTeam.teamName}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {formatCompactNumber(topTeam.total)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('guild_war.analytics_across_wars', { count: topTeam.warCount })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUpIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase text-muted-foreground">
              {t('common.average')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {formatCompactNumber(globalAvgPerWar)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('guild_war.analytics_per_war')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <ShowChartIcon className="w-4 h-4 text-muted-foreground" />
             <span className="text-xs font-bold uppercase text-muted-foreground">
               {t('common.median')}
             </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
             {formatCompactNumber(avgStdDev)}
          </div>
          <div className="text-xs text-muted-foreground">
             {t('guild_war.analytics_team_consistency')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <LocalActivityIcon className="w-4 h-4 text-muted-foreground" />
             <span className="text-xs font-bold uppercase text-muted-foreground">
               {t('guild_war.analytics_participation')}
             </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
             {formatNumber(avgDepth)}
          </div>
          <div className="text-xs text-muted-foreground">
             {t('guild_war.analytics_team_depth')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
