/**
 * War Analytics - Main Component
 *
 * Modes:
 * - Compare: zero/one/multi member analysis
 * - Rankings: top performers
 * - Teams: team aggregates
 */

import Grid from '@mui/material/Grid';
import { Box, Paper, Alert } from '@mui/material';
import { AnalyticsProvider, useAnalytics } from './AnalyticsContext';
import { ModeStrip } from './ModeStrip';
import { FilterBar } from './FilterBar';
import { PlayerTimelineChart } from './PlayerTimelineChart';
import { CompareSelector } from './CompareSelector';
import { CompareTrendChart } from './CompareTrendChart';
import { RankingsFilters } from './RankingsFilters';
import { RankingsBarChart } from './RankingsBarChart';
import { TeamSelector } from './TeamSelector';
import { TeamTrendChart } from './TeamTrendChart';
import { MetricsPanel } from './MetricsPanel';
import { FullPageLoading } from './LoadingStates';
import { useWarsList, useAnalyticsData } from '../../../../hooks';

export function WarAnalyticsMain({ canCopy = true }: { canCopy?: boolean }) {
  return (
    <AnalyticsProvider>
      <WarAnalyticsContent canCopy={canCopy} />
    </AnalyticsProvider>
  );
}

function WarAnalyticsContent({ canCopy }: { canCopy: boolean }) {
  const { filters, compareMode, teamsMode } = useAnalytics();

  const { data: wars, isLoading: warsLoading } = useWarsList({
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: 100,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsData({
    startDate: filters.startDate,
    endDate: filters.endDate,
    warIds: filters.selectedWars,
    userIds: filters.mode === 'compare' ? compareMode.selectedUserIds : undefined,
    teamIds: filters.mode === 'teams' ? teamsMode.selectedTeamIds : undefined,
    mode: filters.mode,
    metric: filters.primaryMetric,
    aggregation: filters.aggregation,
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ModeStrip />
      <FilterBar wars={wars || []} isLoading={warsLoading} />

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {warsLoading || analyticsLoading ? (
          <FullPageLoading />
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <SubjectPanel
                  members={analyticsData?.memberStats || []}
                  wars={wars || []}
                  teamStats={analyticsData?.teamStats || []}
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <ChartPanel wars={wars || []} analyticsData={analyticsData} />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <MetricsPanel analyticsData={analyticsData} canCopy={canCopy} />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}

interface SubjectPanelProps {
  members: any[];
  wars: any[];
  teamStats: any[];
}

function SubjectPanel({ members, wars, teamStats }: SubjectPanelProps) {
  const { filters } = useAnalytics();

  switch (filters.mode) {
    case 'compare':
      return <CompareSelector members={members} />;

    case 'rankings':
      return <RankingsFilters availableClasses={getUniqueClasses(members)} maxWars={wars.length} />;

    case 'teams':
      return <TeamSelector teamStats={teamStats} />;

    default:
      return null;
  }
}

interface ChartPanelProps {
  wars: any[];
  analyticsData: any;
}

function ChartPanel({ wars, analyticsData }: ChartPanelProps) {
  const { filters, compareMode, teamsMode } = useAnalytics();

  const selectedWars = wars.filter((w) => filters.selectedWars.includes(w.war_id));

  switch (filters.mode) {
    case 'compare':
      if (compareMode.selectedUserIds.length === 0) {
        return <Alert severity="info">Select members from the left panel to compare their performance</Alert>;
      }

      if (compareMode.selectedUserIds.length === 1) {
        const selectedUserId = compareMode.selectedUserIds[0];
        const userStats =
          analyticsData?.perWarStats?.filter((s: any) => s.user_id === selectedUserId) || [];

        return <PlayerTimelineChart perWarStats={userStats} wars={selectedWars} isLoading={false} />;
      }

      const compareStats =
        analyticsData?.perWarStats?.filter((s: any) => compareMode.selectedUserIds.includes(s.user_id)) || [];

      return (
        <CompareTrendChart
          perWarStats={compareStats}
          wars={selectedWars}
          members={analyticsData?.memberStats || []}
          isLoading={false}
        />
      );

    case 'rankings':
      return <RankingsBarChart members={analyticsData?.memberStats || []} isLoading={false} />;

    case 'teams':
      if (teamsMode.selectedTeamIds.length === 0) {
        return <Alert severity="info">Select teams from the left panel to compare.</Alert>;
      }

      return <TeamTrendChart teamStats={analyticsData?.teamStats || []} wars={selectedWars} />;

    default:
      return null;
  }
}

function getUniqueClasses(members: any[]): string[] {
  const classes = new Set(members.map((m) => m.class));
  return Array.from(classes);
}

export default WarAnalyticsMain;
