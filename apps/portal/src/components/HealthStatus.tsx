/**
 * Health Status Component
 * Displays system health metrics
 */

import { Box, Card, CardContent, Typography, Grid, Chip, Stack, Alert, Skeleton, Button } from '@mui/material';
import { CardGridSkeleton } from './SkeletonLoaders';
import { Activity, Database, HardDrive, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useHealthStatus, useD1Health, useR2Health } from '../hooks';
import { useTranslation } from 'react-i18next';

function HealthCard({ title, icon, status, details, onRetry, loading }: {
  title: string;
  icon: React.ReactNode;
  status: 'healthy' | 'degraded' | 'down';
  details?: string;
  onRetry?: () => void;
  loading?: boolean;
}) {
  const { t } = useTranslation();

  const statusConfig = {
    healthy: { color: 'success' as const, icon: <CheckCircle size={20} />, label: t('admin.healthy') },
    degraded: { color: 'warning' as const, icon: <AlertTriangle size={20} />, label: t('admin.status_degraded') },
    down: { color: 'error' as const, icon: <XCircle size={20} />, label: t('admin.status_down') },
  };

  const config = statusConfig[status];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
              <Typography variant="h6" fontWeight={700}>
                {title}
              </Typography>
            </Stack>
            <Chip
              icon={config.icon}
              label={config.label}
              color={config.color}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {details && (
            <Typography variant="caption" color="text.secondary">
              {details}
            </Typography>
          )}
          {onRetry && (
            <Button size="small" variant="outlined" onClick={onRetry} disabled={loading}>
              {loading ? t('common.loading') : t('common.retry')}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function HealthStatus() {
  const { t } = useTranslation();
  const { data: health, isLoading: healthLoading, error: healthError, refetch: refetchHealth, isFetching: fetchingHealth } = useHealthStatus();
  const { data: d1Health, isLoading: d1Loading, refetch: refetchD1, isFetching: fetchingD1 } = useD1Health();
  const { data: r2Health, isLoading: r2Loading, refetch: refetchR2, isFetching: fetchingR2 } = useR2Health();

  if (healthLoading || d1Loading || r2Loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={3}>
          <Skeleton width={200} />
        </Typography>
        <CardGridSkeleton count={3} md={4} />
      </Box>
    );
  }

  if (healthError) {
    return (
      <Alert severity="error">
        {healthError instanceof Error ? healthError.message : 'Failed to load health status'}
      </Alert>
    );
  }

  const mapStatus = (s?: string): 'healthy' | 'degraded' | 'down' => {
      if (s === 'ok') return 'healthy';
      if (s === 'error') return 'down';
      return 'down';
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          {t('admin.site_status')}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            void refetchHealth();
            void refetchD1();
            void refetchR2();
          }}
          disabled={fetchingHealth || fetchingD1 || fetchingR2}
        >
          {t('common.retry')}
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.main_site')}
            icon={<Activity size={24} />}
            status={mapStatus(health?.status)}
            details={`${t('admin.last_checked')}: ${health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : t('common.recently')}`}
            onRetry={() => void refetchHealth()}
            loading={fetchingHealth}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.database')}
            icon={<Database size={24} />}
            status={mapStatus(d1Health?.status)}
            details={d1Health?.status === 'ok' ? t('admin.conn_online') : (d1Health?.error || t('admin.checking_conn'))}
            onRetry={() => void refetchD1()}
            loading={fetchingD1}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.storage')}
            icon={<HardDrive size={24} />}
            status={mapStatus(r2Health?.status)}
            details={r2Health?.status === 'ok' ? t('admin.storage_accessible') : (r2Health?.error || t('admin.checking_conn'))}
            onRetry={() => void refetchR2()}
            loading={fetchingR2}
          />
        </Grid>
      </Grid>

      <Card sx={{ mt: 3, opacity: 0.6 }}>
         <CardContent>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={900}>
               System Version: 2.0.0-PROD
            </Typography>
         </CardContent>
      </Card>
    </Box>
  );
}
