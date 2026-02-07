import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, Typography, Stack, Chip, Box, TextField, InputAdornment, Button, Skeleton } from '@mui/material';
import { CardGridSkeleton } from '../../../components/SkeletonLoaders';
import { useWarHistory } from '../hooks/useWars';
import { WarHistoryDetail } from './WarHistoryDetail';
import { WarHistoryPieCharts } from './WarHistoryPieCharts';
import { formatDateTime } from '../../../lib/utils';
import { Search, Filter, AlertTriangle } from 'lucide-react';

export function WarHistory() {
  const { data = [], isLoading } = useWarHistory();
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  if (isLoading) return <CardGridSkeleton count={2} aspectRatio="21/9" />;

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

      <WarHistoryPieCharts data={filtered} />

      <Card>
        <CardHeader title="Recent Wars" />
        <CardContent>
          <Stack spacing={2}>
            {filtered.map((war) => {
              const missingMembers = war.member_stats?.filter((m) =>
                ['damage', 'healing', 'building_damage', 'credits', 'kills', 'deaths', 'assists', 'damage_taken'].some(
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
                  borderColor: missingMembers > 0 ? 'warning.main' : 'divider',
                  bgcolor: missingMembers > 0 ? 'warning.lighter' : 'inherit',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: missingMembers > 0 ? 'warning.light' : 'action.hover' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  {missingMembers > 0 && (
                    <Box sx={{ color: 'warning.main', display: 'flex' }}>
                      <AlertTriangle size={16} />
                    </Box>
                  )}
                  <Typography variant="subtitle2" fontWeight={800}>
                    {war.title}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(war.date)}
                </Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                  {war.score !== null && war.score !== undefined && <Chip label={`Score ${war.score}`} size="small" />}
                  <Chip label={war.result} size="small" color={war.result === 'victory' ? 'success' : war.result === 'draw' ? 'warning' : 'error'} />
                  {missingMembers > 0 && (
                    <Chip
                      label={`${missingMembers} incomplete`}
                      size="small"
                      color="warning"
                      icon={<AlertTriangle size={12} />}
                    />
                  )}
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
