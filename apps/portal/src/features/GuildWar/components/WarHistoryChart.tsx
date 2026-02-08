import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, Typography, useTheme, Stack, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

type WarHistoryChartProps = {
  data: Array<{ name: string; kills: number | null; credits: number | null; distance: number | null; towers: number | null }>;
  metric?: 'kills' | 'credits' | 'distance' | 'towers';
  onMetricChange?: (metric: 'kills' | 'credits' | 'distance' | 'towers') => void;
  missingCount?: number;
};

export function WarHistoryChart({ data, metric = 'kills', onMetricChange, missingCount = 0 }: WarHistoryChartProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const labelMap: Record<string, string> = {
    kills: t('guild_war.history_metric_kills'),
    credits: t('guild_war.history_metric_credits'),
    distance: t('guild_war.history_metric_distance'),
    towers: t('guild_war.history_metric_towers'),
  };

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" fontWeight={900}>{labelMap[metric]} Trend</Typography>
            {missingCount > 0 && (
              <Chip
                size="small"
                label={`Missing: ${missingCount}`}
                color="warning"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
              />
            )}
          </Stack>
        }
        action={
          onMetricChange && (
            <FormControl size="small">
                <InputLabel id="metric-select-label">Metric</InputLabel>
              <Select
                labelId="metric-select-label"
                value={metric}
                label="Metric"
                onChange={(e) => onMetricChange(e.target.value as any)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="kills">{t('guild_war.history_metric_kills')}</MenuItem>
                <MenuItem value="credits">{t('guild_war.history_metric_credits')}</MenuItem>
                <MenuItem value="distance">{t('guild_war.history_metric_distance')}</MenuItem>
                <MenuItem value="towers">{t('guild_war.history_metric_towers')}</MenuItem>
              </Select>
            </FormControl>
          )
        }
      />
      <CardContent sx={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              cursor={false}
              isAnimationActive={false}
              position={{ x: 12, y: 12 }}
              wrapperStyle={{ pointerEvents: 'none' }}
            />
            <Line
              type="monotone"
              dataKey={metric}
              name={labelMap[metric]}
              stroke={primary}
              strokeWidth={2}
              connectNulls={false}
              strokeDasharray="0"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
