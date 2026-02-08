import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import { CardGridSkeleton } from '../../../components/SkeletonLoaders';
import { useWarHistory } from '../hooks/useWars';
import { WarHistoryDetail } from './WarHistoryDetail';
import { WarHistoryPieCharts } from './WarHistoryPieCharts';
import { formatDateTime } from '../../../lib/utils';
import { Search, Filter, AlertTriangle, Coins, Milestone, TowerControl } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buildWarCardMetrics } from './WarHistory.utils';

export function WarHistory() {
  const { t } = useTranslation();
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
        <CardContent
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            placeholder={t('guild_war.history_search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
            fullWidth
          />
          <TextField
            size="small"
            type="date"
            label={t('common.date_from')}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label={t('common.date_to')}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<Filter size={14} />}
            onClick={() => { setDateFrom(''); setDateTo(''); setQuery(''); }}
          >
            {t('common.clear_filters')}
          </Button>
        </CardContent>
      </Card>

      <WarHistoryPieCharts data={filtered} />

      <Card>
        <CardHeader title={t('guild_war.historical_archives')} />
        <CardContent>
          <Stack spacing={2}>
            {filtered.map((war) => {
              const metrics = buildWarCardMetrics(war as any);
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
                  <Chip
                    label={t(`dashboard.${war.result}`)}
                    size="small"
                    color={war.result === 'victory' ? 'success' : war.result === 'draw' ? 'warning' : 'error'}
                  />
                  <Chip label={`KDA ${metrics.kills}/${metrics.deaths}/${metrics.assists}`} size="small" />
                  <Chip
                    label={`${t('common.credits')} ${metrics.credits.toLocaleString()}`}
                    size="small"
                    icon={<Coins size={12} />}
                  />
                  <Chip
                    label={`${t('dashboard.distance')} ${metrics.distance.toLocaleString()}`}
                    size="small"
                    icon={<Milestone size={12} />}
                  />
                  <Chip
                    label={`${t('dashboard.towers')} ${metrics.towers}`}
                    size="small"
                    icon={<TowerControl size={12} />}
                  />
                  {missingMembers > 0 && (
                    <Chip
                      label={t('guild_war.history_incomplete_stats', { count: missingMembers })}
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
