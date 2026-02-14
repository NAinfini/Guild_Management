/**
 * Health Status Component
 * Displays system health metrics
 */

import { Box, Card, CardContent, Typography, Grid, Chip, Stack, Alert, Skeleton, Button, useTheme } from '@mui/material';
import { CardGridSkeleton } from '../feedback/Skeleton';
import { 
  Insights, 
  Storage, 
  Dns,
  Speed,
  Memory,
  CheckCircle,
  Error,
  ErrorOutline,
} from "@mui/icons-material";
import { useHealthStatus, useD1Health, useR2Health, useEndpointHealth } from '@/hooks';
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
  const theme = useTheme();
  const cardToken = theme.custom?.components?.card;
  const buttonToken = theme.custom?.components?.button;

  const statusConfig = {
    healthy: { color: 'success' as const, icon: <CheckCircle sx={{ fontSize: 20 }} />, label: t('admin.healthy') },
    degraded: { color: 'warning' as const, icon: <Error sx={{ fontSize: 20 }} />, label: t('admin.status_degraded') },
    down: { color: 'error' as const, icon: <Error sx={{ fontSize: 20 }} />, label: t('admin.status_down') },
  };

  const config = statusConfig[status];

  return (
    <Card
      sx={{
        bgcolor: cardToken?.bg || 'background.paper',
        border: '1px solid',
        borderColor: cardToken?.border || 'divider',
        boxShadow: cardToken?.shadow || 'none',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
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
            <Button
              size="small"
              variant="outlined"
              onClick={onRetry}
              disabled={loading}
              sx={{
                borderColor: buttonToken?.border || 'divider',
                color: buttonToken?.text || 'text.primary',
                '&:hover': {
                  bgcolor: buttonToken?.hoverBg || 'action.hover',
                  borderColor: buttonToken?.border || 'divider',
                },
              }}
            >
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
  const theme = useTheme();
  const cardToken = theme.custom?.components?.card;
  const buttonToken = theme.custom?.components?.button;
  const { data: health, isLoading: healthLoading, error: healthError, refetch: refetchHealth, isFetching: fetchingHealth } = useHealthStatus();
  const { data: d1Health, isLoading: d1Loading, refetch: refetchD1, isFetching: fetchingD1 } = useD1Health();
  const { data: r2Health, isLoading: r2Loading, refetch: refetchR2, isFetching: fetchingR2 } = useR2Health();
  const {
    data: endpointHealth,
    isLoading: endpointLoading,
    isFetching: endpointFetching,
    refetch: refetchEndpoints,
  } = useEndpointHealth();

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

  const endpointStatusColor = (status: 'healthy' | 'degraded' | 'down' | 'skipped') => {
    if (status === 'healthy') return 'success';
    if (status === 'degraded') return 'warning';
    if (status === 'down') return 'error';
    return 'default';
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
          sx={{
            bgcolor: buttonToken?.bg || 'primary.main',
            color: buttonToken?.text || 'primary.contrastText',
            borderColor: buttonToken?.border || 'transparent',
            '&:hover': {
              bgcolor: buttonToken?.hoverBg || 'primary.dark',
            },
          }}
        >
          {t('common.retry')}
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.main_site')}
            icon={<Insights sx={{ fontSize: 24 }} />}
            status={mapStatus(health?.status)}
            details={`${t('admin.last_checked')}: ${health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : t('common.recently')}`}
            onRetry={() => void refetchHealth()}
            loading={fetchingHealth}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.database')}
            icon={<Storage sx={{ fontSize: 24 }} />}
            status={mapStatus(d1Health?.status)}
            details={d1Health?.status === 'ok' ? t('admin.conn_online') : (d1Health?.error || t('admin.checking_conn'))}
            onRetry={() => void refetchD1()}
            loading={fetchingD1}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.storage')}
            icon={<Dns sx={{ fontSize: 24 }} />}
            status={mapStatus(r2Health?.status)}
            details={r2Health?.status === 'ok' ? t('admin.storage_accessible') : (r2Health?.error || t('admin.checking_conn'))}
            onRetry={() => void refetchR2()}
            loading={fetchingR2}
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          mt: 3,
          bgcolor: cardToken?.bg || 'background.paper',
          border: '1px solid',
          borderColor: cardToken?.border || 'divider',
          boxShadow: cardToken?.shadow || 'none',
        }}
      >
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5} mb={2}>
            <Typography variant="h6" fontWeight={700}>
              {t('admin.endpoint_checks', { defaultValue: 'API Endpoint Checks' })}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => void refetchEndpoints()}
              disabled={endpointFetching}
              sx={{
                borderColor: buttonToken?.border || 'divider',
                color: buttonToken?.text || 'text.primary',
                '&:hover': {
                  bgcolor: buttonToken?.hoverBg || 'action.hover',
                  borderColor: buttonToken?.border || 'divider',
                },
              }}
            >
              {endpointFetching ? t('common.loading') : t('common.retry')}
            </Button>
          </Stack>

          {endpointHealth && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <Chip size="small" color="success" label={`${t('admin.healthy')}: ${endpointHealth.summary.healthy}`} />
              <Chip size="small" color="warning" label={`${t('admin.status_degraded')}: ${endpointHealth.summary.degraded}`} />
              <Chip size="small" color="error" label={`${t('admin.status_down')}: ${endpointHealth.summary.down}`} />
              <Chip size="small" label={`${t('admin.skipped_checks', { defaultValue: 'Skipped' })}: ${endpointHealth.summary.skipped}`} />
              <Chip size="small" variant="outlined" label={`${t('common.total', { defaultValue: 'Total' })}: ${endpointHealth.summary.total}`} />
            </Stack>
          )}

          {endpointLoading ? (
            <Stack spacing={1}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} height={34} />
              ))}
            </Stack>
          ) : !endpointHealth ? (
            <Alert severity="warning">
              {t('admin.endpoint_check_unavailable', { defaultValue: 'Endpoint checks are currently unavailable.' })}
            </Alert>
          ) : (
            <Box
              sx={{
                border: '1px solid',
                borderColor: theme.custom?.components?.table?.border || 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: theme.custom?.components?.table?.rowBg || 'transparent',
              }}
            >
              <Stack sx={{ maxHeight: 360, overflowY: 'auto' }}>
                {endpointHealth.endpoints.map((probe) => (
                  <Box
                    key={probe.key}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '110px 1fr 130px' },
                      gap: 1,
                      alignItems: 'center',
                      px: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                      {probe.method}
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }} noWrap>
                        {probe.path}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {probe.details}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={probe.status}
                      color={endpointStatusColor(probe.status) as any}
                      sx={{ justifySelf: { xs: 'start', md: 'end' }, textTransform: 'uppercase', fontWeight: 700 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            {t('admin.last_checked')}: {endpointHealth?.checkedAt ? new Date(endpointHealth.checkedAt).toLocaleTimeString() : t('common.recently')}
          </Typography>
        </CardContent>
      </Card>

      <Card
        sx={{
          mt: 3,
          opacity: 0.75,
          bgcolor: cardToken?.bg || 'background.paper',
          border: '1px solid',
          borderColor: cardToken?.border || 'divider',
          boxShadow: 'none',
        }}
      >
         <CardContent>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={900}>
               System Version: 2.0.0-PROD
            </Typography>
         </CardContent>
      </Card>
    </Box>
  );
}
