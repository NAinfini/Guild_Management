
import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { Badge } from '@/components/data-display/Badge';
import { Select, SelectItem } from '@/components/input/Select';
import { useTranslation } from 'react-i18next';

type WarHistoryChartProps = {
  data: Array<{ name: string; kills: number | null; credits: number | null; distance: number | null; towers: number | null }>;
  metric?: 'kills' | 'credits' | 'distance' | 'towers';
  onMetricChange?: (metric: 'kills' | 'credits' | 'distance' | 'towers') => void;
  missingCount?: number;
};

export function WarHistoryChart({ data, metric = 'kills', onMetricChange, missingCount = 0 }: WarHistoryChartProps) {
  const { t } = useTranslation();

  const labelMap: Record<string, string> = {
    kills: t('guild_war.history_metric_kills'),
    credits: t('guild_war.history_metric_credits'),
    distance: t('guild_war.history_metric_distance'),
    towers: t('guild_war.history_metric_towers'),
  };

  // Prepare data for MUI X-Charts
  const xAxisData = data.map((d) => d.name);
  const seriesData = data.map((d) => d[metric]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-muted-foreground">{labelMap[metric]} Trend</span>
            {missingCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[0.6rem] px-1.5 py-0 h-4"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 74%, transparent)',
                  color: 'var(--color-status-warning-fg)',
                  borderColor: 'color-mix(in srgb, var(--color-status-warning) 42%, transparent)',
                }}
              >
                Missing: {missingCount}
              </Badge>
            )}
          </div>
          
          {onMetricChange && (
            <div className="w-[140px]">
                <Select 
                  value={metric} 
                  onChange={(e: any) => onMetricChange(e.target.value)}
                  className="h-7 text-xs"
                  sx={{
                    fontSize: '0.75rem',
                    height: 28,
                    '& .MuiSelect-select': { py: 0.5, px: 1.5 } // Override to match small Trigger
                  }}
                >
                    <SelectItem value="kills">{t('guild_war.history_metric_kills')}</SelectItem>
                    <SelectItem value="credits">{t('guild_war.history_metric_credits')}</SelectItem>
                    <SelectItem value="distance">{t('guild_war.history_metric_distance')}</SelectItem>
                    <SelectItem value="towers">{t('guild_war.history_metric_towers')}</SelectItem>
                </Select>
            </div>
          )}
      </CardHeader>
      <CardContent className="h-[280px] p-0">
        <LineChart
          xAxis={[
            {
              scaleType: 'point',
              data: xAxisData,
              tickLabelStyle: {
                fontSize: 11,
                fill: 'var(--muted-foreground)', 
              },
            },
          ]}
          yAxis={[
            {
              tickLabelStyle: {
                fontSize: 11,
                fill: 'var(--muted-foreground)',
              },
            },
          ]}
          series={[
            {
              data: seriesData,
              label: labelMap[metric],
              color: 'var(--primary)',
              connectNulls: false,
              showMark: true,
            },
          ]}
          height={250}
          margin={{ top: 10, right: 20, bottom: 30, left: 50 }}
          grid={{ vertical: true, horizontal: true }}
          sx={{
            '& .MuiChartsAxis-line': {
              stroke: 'hsl(var(--border))',
            },
            '& .MuiChartsAxis-tick': {
              stroke: 'hsl(var(--border))', 
            },
            '& .MuiChartsGrid-line': {
              stroke: 'hsl(var(--border))',
              strokeDasharray: '3 3',
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
