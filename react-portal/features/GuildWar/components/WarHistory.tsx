import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, Typography, Stack, Chip, Box, CircularProgress, TextField, InputAdornment, Button } from '@mui/material';
import { useWarHistory } from '../hooks/useWars';
import { WarHistoryDetail } from './WarHistoryDetail';
import { WarHistoryChart } from './WarHistoryChart';
import { formatDateTime } from '../../../lib/utils';
import { Search, Filter } from 'lucide-react';

export function WarHistory() {
  const { data = [], isLoading } = useWarHistory();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metric, setMetric] = useState<'score' | 'kills' | 'credits'>('score');
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');



  const filtered = useMemo(() => {
    return data
      .filter((w) => (query ? w.title.toLowerCase().includes(query.toLowerCase()) : true))
      .filter((w) => {
        if (dateFrom && new Date(w.date) < new Date(dateFrom)) return false;
        if (dateTo && new Date(w.date) > new Date(dateTo)) return false;
        return true;
      });
  }, [data, query, dateFrom, dateTo]);

  const selected = filtered.find((w) => w.id === selectedId) || null;

  const chartData = filtered.map((w) => ({
    name: w.title,
    score: metric === 'score' ? w.score ?? null : metric === 'kills' ? w.own_stats?.kills ?? null : w.own_stats?.credits ?? null,
    enemy: metric === 'score' ? w.enemy_score ?? null : metric === 'kills' ? w.enemy_stats?.kills ?? null : w.enemy_stats?.credits ?? null,
  }));

  const missingCount = filtered.reduce((acc, w) => {
    const missingMembers = w.member_stats?.filter((m) =>
      ['damage', 'healing', 'building_damage', 'credits', 'kills', 'deaths', 'assists'].some(
        (k) => (m as any)[k] === null || (m as any)[k] === undefined,
      ),
    ).length ?? 0;
    return acc + missingMembers;
  }, 0);

  if (isLoading) return <CircularProgress />;

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search wars"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
          />
          <TextField
            size="small"
            type="date"
            label="From"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Button size="small" startIcon={<Filter size={14} />} onClick={() => { setDateFrom(''); setDateTo(''); setQuery(''); }}>
            Clear
          </Button>
        </CardContent>
      </Card>

      <WarHistoryChart data={chartData} metric={metric} onMetricChange={setMetric} missingCount={missingCount} />

      <Card>
        <CardHeader title="Recent Wars" />
        <CardContent>
          <Stack spacing={2}>
            {filtered.map((war) => {
              const missingMembers = war.member_stats?.filter((m) =>
                ['damage', 'healing', 'building_damage', 'credits', 'kills', 'deaths', 'assists'].some(
                  (k) => (m as any)[k] === null || (m as any)[k] === undefined,
                ),
              ).length ?? 0;
              return (
              <Box
                key={war.id}
                onClick={() => setSelectedId(war.id)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="subtitle2" fontWeight={800}>
                  {war.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(war.date)}
                </Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                  <Chip label={`Score ${war.score ?? 0}`} size="small" />
                  <Chip label={war.result} size="small" color={war.result === 'victory' ? 'success' : war.result === 'draw' ? 'warning' : 'error'} />
                  {missingMembers > 0 && <Chip label={`Missing: ${missingMembers}`} size="small" color="warning" />}
                </Stack>
              </Box>
            );
            })}
          </Stack>
        </CardContent>
      </Card>

      <WarHistoryDetail war={selected} open={!!selected} onClose={() => setSelectedId(null)} />
    </Stack>
  );
}
