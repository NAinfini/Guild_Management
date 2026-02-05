import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, Typography, useTheme, Stack, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

type WarHistoryChartProps = {
  data: Array<{ name: string; score: number | null; enemy: number | null }>;
  metric?: 'score' | 'kills' | 'credits';
  onMetricChange?: (metric: 'score' | 'kills' | 'credits') => void;
  missingCount?: number;
};

export function WarHistoryChart({ data, metric = 'score', onMetricChange, missingCount = 0 }: WarHistoryChartProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const enemy = theme.palette.error.main;

  const labelMap: Record<string, string> = {
    score: 'Score',
    kills: 'Kills',
    credits: 'Credits',
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
                <MenuItem value="score">Score</MenuItem>
                <MenuItem value="kills">Kills</MenuItem>
                <MenuItem value="credits">Credits</MenuItem>
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
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              name="Alliance"
              stroke={primary}
              strokeWidth={2}
              connectNulls={false}
              strokeDasharray="0"
            />
            <Line
              type="monotone"
              dataKey="enemy"
              name="Enemy"
              stroke={enemy}
              strokeWidth={2}
              connectNulls={false}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
