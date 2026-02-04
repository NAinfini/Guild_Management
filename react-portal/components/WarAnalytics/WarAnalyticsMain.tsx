/**
 * War Analytics - Main Component (COMPLETE VERSION)
 *
 * Complete analytics interface with all 4 modes:
 * - Player: Single member timeline
 * - Compare: Multi-member comparison
 * - Rankings: Top N performers
 * - Teams: Team aggregates (optional)
 */

import Grid from '@mui/material/Grid';
import { Box, Paper, Alert } from '@mui/material';
import { AnalyticsProvider, useAnalytics } from './AnalyticsContext';
import { ModeStrip } from './ModeStrip';
import { FilterBar } from './FilterBar';
import { PlayerSelector } from './PlayerSelector';
import { PlayerTimelineChart } from './PlayerTimelineChart';
import { CompareSelector } from './CompareSelector';
import { CompareTrendChart } from './CompareTrendChart';
import { RankingsFilters } from './RankingsFilters';
import { RankingsBarChart } from './RankingsBarChart';
import { MetricsPanel } from './MetricsPanel';
import { FullPageLoading } from './LoadingStates';
import { useWarsList, useAnalyticsData } from '../../hooks/useWars';

// ============================================================================
// Main Wrapper (with Provider)
// ============================================================================

export function WarAnalyticsMain() {
  return (
    <AnalyticsProvider>
      <WarAnalyticsContent />
    </AnalyticsProvider>
  );
}

// ============================================================================
// Content (inside Provider)
// ============================================================================

function WarAnalyticsContent() {
  const { filters } = useAnalytics();

  // Fetch wars list for filtering
  const { data: wars, isLoading: warsLoading } = useWarsList({
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: 100,
  });

  // Fetch analytics data for selected wars
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsData({
    startDate: filters.startDate,
    endDate: filters.endDate,
    warIds: filters.selectedWars,
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Mode Strip */}
      <ModeStrip />

      {/* Filter Bar */}
      <FilterBar wars={wars || []} isLoading={warsLoading} />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {warsLoading || analyticsLoading ? (
          <FullPageLoading />
        ) : (
          <Grid container spacing={2}>
            {/* Left Panel: Subject Selection */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <SubjectPanel
                  members={analyticsData?.memberStats || []}
                  wars={wars || []}
                />
              </Paper>
            </Grid>

            {/* Center Panel: Chart */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <ChartPanel
                  wars={wars || []}
                  analyticsData={analyticsData}
                />
              </Paper>
            </Grid>

            {/* Right Panel: Metrics */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <MetricsPanel analyticsData={analyticsData} />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}

// ============================================================================
// Subject Panel (Left) - Mode Aware
// ============================================================================

interface SubjectPanelProps {
  members: any[];
  wars: any[];
}

function SubjectPanel({ members, wars }: SubjectPanelProps) {
  const { filters } = useAnalytics();

  switch (filters.mode) {
    case 'player':
      return <PlayerSelector members={members} />;

    case 'compare':
      return <CompareSelector members={members} />;

    case 'rankings':
      return (
        <RankingsFilters
          availableClasses={getUniqueClasses(members)}
          maxWars={wars.length}
        />
      );

    case 'teams':
      return (
        <Alert severity="info">
          Teams mode coming soon (optional feature)
        </Alert>
      );

    default:
      return null;
  }
}

// ============================================================================
// Chart Panel (Center) - Mode Aware
// ============================================================================

interface ChartPanelProps {
  wars: any[];
  analyticsData: any;
}

function ChartPanel({ wars, analyticsData }: ChartPanelProps) {
  const { filters, playerMode, compareMode } = useAnalytics();

  // Filter wars to only selected ones
  const selectedWars = wars.filter((w) => filters.selectedWars.includes(w.war_id));

  switch (filters.mode) {
    case 'player':
      if (!playerMode.selectedUserId) {
        return (
          <Alert severity="info">
            Select a member from the left panel to view their performance timeline
          </Alert>
        );
      }

      // Filter per-war stats for selected user
      const userStats = analyticsData?.perWarStats?.filter(
        (s: any) => s.user_id === playerMode.selectedUserId
      ) || [];

      return (
        <PlayerTimelineChart
          perWarStats={userStats}
          wars={selectedWars}
          isLoading={false}
        />
      );

    case 'compare':
      if (compareMode.selectedUserIds.length === 0) {
        return (
          <Alert severity="info">
            Select members from the left panel to compare their performance
          </Alert>
        );
      }

      // Filter per-war stats for selected users
      const compareStats = analyticsData?.perWarStats?.filter(
        (s: any) => compareMode.selectedUserIds.includes(s.user_id)
      ) || [];

      return (
        <CompareTrendChart
          perWarStats={compareStats}
          wars={selectedWars}
          members={analyticsData?.memberStats || []}
          isLoading={false}
        />
      );

    case 'rankings':
      return (
        <RankingsBarChart
          members={analyticsData?.memberStats || []}
          isLoading={false}
        />
      );

    case 'teams':
      return (
        <Alert severity="info">
          Teams mode chart coming soon
        </Alert>
      );

    default:
      return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getUniqueClasses(members: any[]): string[] {
  const classes = new Set(members.map((m) => m.class));
  return Array.from(classes);
}


// ============================================================================
// Export
// ============================================================================

export default WarAnalyticsMain;
