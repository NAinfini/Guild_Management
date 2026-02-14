/**
 * War Analytics - Main Component
 *
 * Modes:
 * - Compare: zero/one/multi member analysis
 * - Rankings: top performers
 * - Teams: team aggregates
 */

import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalyticsProvider, useAnalytics } from './AnalyticsContext';
import { FilterBar } from './FilterBar';
import { PlayerTimelineChart } from './PlayerTimelineChart';
import { CompareTrendChart } from './CompareTrendChart';
import { RankingsBarChart } from './RankingsBarChart';
import { TeamTrendChart } from './TeamTrendChart';
import { MetricsPanel } from './MetricsPanel';
import { LoadingPanel, ErrorPanel } from './LoadingStates';
import { SubjectSelector } from './SubjectSelector';
import { WarDetailSidePanel } from './WarDetailSidePanel';
import { useWarsList, useAnalyticsData } from '../../../../hooks';
import { AnalyticsMode } from './types';
import { Card } from '@/components/layout/Card';
import { Alert, AlertDescription } from '@/components/feedback/Alert';
import { ErrorOutline } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export function WarAnalyticsMain({ canCopy = true }: { canCopy?: boolean }) {
  return (
    <AnalyticsProvider>
      <WarAnalyticsContent canCopy={canCopy} />
    </AnalyticsProvider>
  );
}

function WarAnalyticsContent({ canCopy }: { canCopy: boolean }) {
  const theme = useTheme();
  const panel = theme.custom?.components?.panel;
  const semanticSurface = theme.custom?.semantic?.surface;
  const semanticBorder = theme.custom?.semantic?.border;
  const panelSx = {
    backgroundColor: panel?.bg ?? semanticSurface?.panel ?? theme.palette.background.paper,
    borderColor: panel?.border ?? semanticBorder?.default ?? theme.palette.divider,
  };

  const {
    filters,
    compareMode,
    teamsMode,
    rankingsMode,
    drilldown,
    closeWarDetail,
    updateFilters,
    updateCompareMode,
    updateTeamsMode,
    updateRankingsMode,
  } = useAnalytics();

  const { data: wars, isLoading: warsLoading } = useWarsList({
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: 100,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsData({
    startDate: filters.startDate,
    endDate: filters.endDate,
    warIds: filters.selectedWars,
    // Keep compare selector fully populated; filter selected users client-side for charts.
    userIds: undefined,
    teamIds: filters.mode === 'teams' ? teamsMode.selectedTeamIds : undefined,
    mode: filters.mode,
    metric: filters.primaryMetric,
    aggregation: filters.aggregation,
    includePerWar: filters.mode !== 'teams',
    participationOnly: filters.participationOnly,
    opponentNormalized: filters.opponentNormalized,
    normalizationWeights: filters.normalizationWeights,
  });

  const availableWarIds = useMemo(
    () =>
      new Set(
        (wars || [])
          .map((war) => Number(war.war_id))
          .filter((warId) => Number.isFinite(warId))
      ),
    [wars]
  );

  useEffect(() => {
    if (filters.selectedWars.length === 0 || availableWarIds.size === 0) {
      return;
    }

    const nextSelectedWars = filters.selectedWars.filter((warId) => availableWarIds.has(Number(warId)));
    if (nextSelectedWars.length !== filters.selectedWars.length) {
      updateFilters({ selectedWars: nextSelectedWars });
    }
  }, [availableWarIds, filters.selectedWars, updateFilters]);

  useEffect(() => {
    if (filters.selectedWars.length === 0) {
      return;
    }

    if (filters.mode === 'compare') {
      const availableUserIds = new Set(
        (analyticsData?.memberStats || [])
          .map((member: any) => Number(member.user_id))
          .filter((userId: number) => Number.isFinite(userId))
      );

      if (availableUserIds.size === 0 || compareMode.selectedUserIds.length === 0) {
        return;
      }

      const selectedUserIds = compareMode.selectedUserIds.filter((userId) => availableUserIds.has(userId));
      if (selectedUserIds.length !== compareMode.selectedUserIds.length) {
        const selectedSet = new Set(selectedUserIds);
        updateCompareMode({
          selectedUserIds,
          focusedUserId: selectedSet.has(compareMode.focusedUserId ?? -1) ? compareMode.focusedUserId : undefined,
          hiddenUserIds: new Set([...compareMode.hiddenUserIds].filter((userId) => selectedSet.has(userId))),
        });
      }
      return;
    }

    if (filters.mode === 'teams') {
      const availableTeamIds = new Set(
        (analyticsData?.teamStats || [])
          .map((team: any) => Number(team.team_id))
          .filter((teamId: number) => Number.isFinite(teamId))
      );

      if (availableTeamIds.size === 0 || teamsMode.selectedTeamIds.length === 0) {
        return;
      }

      const selectedTeamIds = teamsMode.selectedTeamIds.filter((teamId) => availableTeamIds.has(teamId));
      if (selectedTeamIds.length !== teamsMode.selectedTeamIds.length) {
        updateTeamsMode({ selectedTeamIds });
      }
      return;
    }

    if (filters.mode === 'rankings' && rankingsMode.classFilter.length > 0) {
      const availableClasses = new Set(
        (analyticsData?.memberStats || [])
          .map((member: any) => String(member.class || '').trim())
          .filter(Boolean)
      );
      if (availableClasses.size === 0) {
        return;
      }
      const classFilter = rankingsMode.classFilter.filter((className) => availableClasses.has(className));
      if (classFilter.length !== rankingsMode.classFilter.length) {
        updateRankingsMode({ classFilter });
      }
    }
  }, [
    analyticsData?.memberStats,
    analyticsData?.teamStats,
    compareMode.focusedUserId,
    compareMode.hiddenUserIds,
    compareMode.selectedUserIds,
    filters.mode,
    filters.selectedWars.length,
    rankingsMode.classFilter,
    teamsMode.selectedTeamIds,
    updateCompareMode,
    updateRankingsMode,
    updateTeamsMode,
  ]);

  return (
    <div className="flex h-full flex-col space-y-4">
      <FilterBar wars={wars || []} members={analyticsData?.memberStats || []} isLoading={warsLoading} />

      <div className="flex-1 overflow-auto p-1">
        {warsLoading || analyticsLoading ? (
          <LoadingPanel />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-3">
              <Card className="h-full min-h-[400px] p-4" sx={panelSx}>
                <SubjectSelector
                  members={analyticsData?.memberStats || []}
                  wars={wars || []}
                  teamStats={analyticsData?.teamStats || []}
                />
              </Card>
            </div>

            <div className="md:col-span-6">
              <Card className="h-full min-h-[400px] p-4" sx={panelSx}>
                <ChartPanel wars={wars || []} analyticsData={analyticsData} />
              </Card>
            </div>

            <div className="md:col-span-3">
              <Card className="h-full min-h-[400px] p-4" sx={panelSx}>
                <MetricsPanel analyticsData={analyticsData} canCopy={canCopy} />
              </Card>
            </div>
          </div>
        )}
      </div>
      <WarDetailSidePanel
        open={Boolean(drilldown.selectedWarId)}
        warId={drilldown.selectedWarId}
        onClose={closeWarDetail}
      />
    </div>
  );
}

interface ChartPanelProps {
  wars: any[];
  analyticsData: any;
}

function ChartPanel({ wars, analyticsData }: ChartPanelProps) {
  const { t } = useTranslation();
  const { filters, compareMode, teamsMode, openWarDetail } = useAnalytics();

  if (wars.length === 0) {
    return (
      <Alert variant="default">
        <ErrorOutline className="h-4 w-4" />
        <AlertDescription>{t('guild_war.analytics_empty_no_wars_in_range')}</AlertDescription>
      </Alert>
    );
  }

  if (filters.selectedWars.length === 0) {
    return (
      <Alert variant="default">
        <ErrorOutline className="h-4 w-4" />
        <AlertDescription>{t('guild_war.analytics_empty_no_wars_selected')}</AlertDescription>
      </Alert>
    );
  }

  const selectedWars = wars.filter((w) => filters.selectedWars.includes(w.war_id));

  switch (filters.mode) {
    case 'compare':
      if ((analyticsData?.memberStats?.length ?? 0) === 0) {
        return (
          <Alert variant="default">
            <ErrorOutline className="h-4 w-4" />
            <AlertDescription>{t('guild_war.analytics_empty_no_matching_members')}</AlertDescription>
          </Alert>
        );
      }

      if (compareMode.selectedUserIds.length === 0) {
        return (
          <Alert variant="default">
            <ErrorOutline className="h-4 w-4" />
            <AlertDescription>{t('guild_war.analytics_no_compare_selection')}</AlertDescription>
          </Alert>
        );
      }

      if (compareMode.selectedUserIds.length === 1) {
        const selectedUserId = compareMode.selectedUserIds[0];
        const userStats =
          analyticsData?.perWarStats?.filter((s: any) => s.user_id === selectedUserId) || [];

        if (userStats.length === 0) {
          return (
            <Alert variant="default">
              <ErrorOutline className="h-4 w-4" />
              <AlertDescription>{t('guild_war.analytics_empty_no_stats_returned')}</AlertDescription>
            </Alert>
          );
        }

        return (
          <PlayerTimelineChart
            perWarStats={userStats}
            wars={selectedWars}
            metrics={compareMode.selectedMetrics.length > 0 ? compareMode.selectedMetrics : [filters.primaryMetric]}
            onSelectWar={(warId) =>
              openWarDetail({
                warId,
                sourceMode: 'compare',
                userId: selectedUserId,
              })
            }
            isLoading={false}
          />
        );
      }

      const compareStats =
        analyticsData?.perWarStats?.filter((s: any) => compareMode.selectedUserIds.includes(s.user_id)) || [];

      if (compareStats.length === 0) {
        return (
          <Alert variant="default">
            <ErrorOutline className="h-4 w-4" />
            <AlertDescription>{t('guild_war.analytics_empty_no_stats_returned')}</AlertDescription>
          </Alert>
        );
      }

      return (
        <CompareTrendChart
          perWarStats={compareStats}
          wars={selectedWars}
          members={analyticsData?.memberStats || []}
          onSelectWar={({ warId, userId }) =>
            openWarDetail({
              warId,
              sourceMode: 'compare',
              userId,
            })
          }
          samplingApplied={Boolean(analyticsData?.meta?.samplingApplied)}
          isLoading={false}
        />
      );

    case 'rankings':
      if ((analyticsData?.memberStats?.length ?? 0) === 0) {
        return (
          <Alert variant="default">
            <ErrorOutline className="h-4 w-4" />
            <AlertDescription>{t('guild_war.analytics_empty_no_matching_members')}</AlertDescription>
          </Alert>
        );
      }

      return (
        <RankingsBarChart
          members={analyticsData?.memberStats || []}
          perWarStats={analyticsData?.perWarStats || []}
          onSelectWar={({ warId, userId }) =>
            openWarDetail({
              warId,
              sourceMode: 'rankings',
              userId,
            })
          }
          isLoading={false}
        />
      );

    case 'teams':
      if ((analyticsData?.teamStats?.length ?? 0) === 0) {
        return (
          <Alert variant="default">
            <ErrorOutline className="h-4 w-4" />
            <AlertDescription>{t('guild_war.analytics_empty_no_matching_teams')}</AlertDescription>
          </Alert>
        );
      }

      if (teamsMode.selectedTeamIds.length === 0) {
        return (
          <Alert variant="default">
            <ErrorOutline className="h-4 w-4" />
            <AlertDescription>{t('guild_war.analytics_no_team_selection')}</AlertDescription>
          </Alert>
        );
      }

      const selectedTeamStats = (analyticsData?.teamStats || []).filter((team: any) =>
        teamsMode.selectedTeamIds.includes(Number(team.team_id))
      );

      if (selectedTeamStats.length === 0) {
        return (
          <Alert variant="default">
            <ErrorOutline className="h-4 w-4" />
            <AlertDescription>{t('guild_war.analytics_empty_no_stats_returned')}</AlertDescription>
          </Alert>
        );
      }

      return (
        <TeamTrendChart
          teamStats={selectedTeamStats}
          wars={selectedWars}
          onSelectWar={({ warId, teamId }: { warId: string | number; teamId: number }) =>
            openWarDetail({
              warId,
              sourceMode: 'teams',
              teamId,
            })
          }
        />
      );

    default:
      return null;
  }
}

export default WarAnalyticsMain;
