import React, { useMemo } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from './AnalyticsContext';
import { TrendingUp, ErrorOutline } from '@mui/icons-material';
import { transformForTeams, formatNumber, formatWarDateShort } from './utils';
import { getUserColor } from './types';
import type { TeamStats, WarSummary } from './types';
import { Alert, AlertDescription } from '@/components/feedback/Alert';

interface TeamTrendChartProps {
  teamStats: TeamStats[];
  wars: WarSummary[];
  onSelectWar?: (params: { warId: number | string; teamId: number }) => void;
}

export const TeamTrendChart = ({ teamStats, wars, onSelectWar }: TeamTrendChartProps) => {
  const { t } = useTranslation();
  const { teamsMode, filters } = useAnalytics();
  const { selectedTeamIds } = teamsMode;
  const metric = filters.primaryMetric;
  const showTotal = filters.aggregation === 'total';

  const chartData = useMemo(() => {
    return transformForTeams(teamStats, wars, selectedTeamIds, metric, showTotal);
  }, [teamStats, wars, selectedTeamIds, metric, showTotal]);

  if (selectedTeamIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
        <TrendingUp className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">{t('guild_war.analytics_select_team_to_compare')}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <Alert variant="default">
          <ErrorOutline className="h-4 w-4" />
          <AlertDescription>{t('guild_war.analytics_no_team_data')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider">{t('guild_war.analytics_team_trends')}</h3>
            <p className="text-xs text-muted-foreground">Historical performance by Tactical Squad</p>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <LineChart
          xAxis={[{ 
            scaleType: 'point', 
            data: chartData.map(d => formatWarDateShort(d.war_date)),
            tickLabelStyle: {
              fontSize: 10,
              fill: 'hsl(var(--muted-foreground))'
            }
          }]}
          series={selectedTeamIds.map(id => ({
            data: chartData.map(d => (d[`team_${id}`] as number) ?? null),
            label: `Team ${id}`,
            color: getUserColor(id),
            showMark: true,
            area: true,
            valueFormatter: (value: number | null) => formatNumber(value ?? 0)
          }))}
          yAxis={[{
             tickLabelStyle: {
              fontSize: 10,
              fill: 'hsl(var(--muted-foreground))'
            },
            valueFormatter: (value: number | null) => formatNumber(value ?? 0)
          }]}
          grid={{ horizontal: true }}
          sx={{
            '.MuiAreaElement-root': {
              fillOpacity: 0.1,
            },
            '.MuiLineElement-root': {
              strokeWidth: 3,
            }
          }}
        />
      </div>
    </div>
  );
};
