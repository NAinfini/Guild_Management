import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Alert } from '@mui/material';
import { useAnalytics } from './AnalyticsContext';
import { transformForTeams, formatWarDateShort, formatNumber } from './utils';
import { getUserColor } from './types';
import type { TeamStats, WarSummary } from './types';

interface TeamTrendChartProps {
  teamStats: TeamStats[];
  wars: WarSummary[];
}

export function TeamTrendChart({ teamStats, wars }: TeamTrendChartProps) {
  const { filters, teamsMode } = useAnalytics();

  const chartData = useMemo(
    () =>
      transformForTeams(
        teamStats,
        wars,
        teamsMode.selectedTeamIds,
        filters.primaryMetric,
        teamsMode.showTotal
      ),
    [teamStats, wars, teamsMode.selectedTeamIds, teamsMode.showTotal, filters.primaryMetric]
  );

  const selectedTeams = useMemo(() => {
    const teamById = new Map<number, string>();
    for (const entry of teamStats) {
      if (!teamById.has(entry.team_id)) {
        teamById.set(entry.team_id, entry.team_name);
      }
    }
    return teamsMode.selectedTeamIds.map((teamId) => ({
      teamId,
      teamName: teamById.get(teamId) ?? `Team ${teamId}`,
    }));
  }, [teamStats, teamsMode.selectedTeamIds]);

  if (teamsMode.selectedTeamIds.length === 0) {
    return <Alert severity="info">Select teams from the left panel to compare.</Alert>;
  }

  if (chartData.length === 0) {
    return <Alert severity="info">No team data available for the selected wars.</Alert>;
  }

  return (
    <Box>
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={chartData} margin={{ top: 10, right: 24, left: 12, bottom: 20 }}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="war_date" tickFormatter={formatWarDateShort} tickMargin={8} />
          <YAxis tickFormatter={(value) => formatNumber(value)} />
          <Tooltip />
          <Legend />
          {selectedTeams.map((team) => (
            <Line
              key={team.teamId}
              type="monotone"
              dataKey={`team_${team.teamId}`}
              name={team.teamName}
              stroke={getUserColor(team.teamId)}
              strokeWidth={2.5}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

