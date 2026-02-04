/**
 * Health Status Component
 * Displays system health metrics
 */

import { Box, Card, CardContent, Typography, Grid, Chip, Stack, CircularProgress, Alert } from '@mui/material';
import { Activity, Database, HardDrive, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useHealthStatus, useD1Health, useR2Health } from '../hooks';
import { useTranslation } from 'react-i18next';

function HealthCard({ title, icon, status, details }: {
  title: string;
  icon: React.ReactNode;
  status: 'healthy' | 'degraded' | 'down';
  details?: string;
}) {
  const { t } = useTranslation();

  const statusConfig = {
    healthy: { color: 'success' as const, icon: <CheckCircle size={20} />, label: t('admin.healthy') },
    degraded: { color: 'warning' as const, icon: <AlertTriangle size={20} />, label: 'Degraded' },
    down: { color: 'error' as const, icon: <XCircle size={20} />, label: 'Down' },
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
        </Stack>
      </CardContent>
    </Card>
  );
}

export function HealthStatus() {
  const { t } = useTranslation();
  const { data: health, isLoading: healthLoading, error: healthError } = useHealthStatus();
  const { data: d1Health, isLoading: d1Loading } = useD1Health();
  const { data: r2Health, isLoading: r2Loading } = useR2Health();

  if (healthLoading || d1Loading || r2Loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
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
      <Typography variant="h5" fontWeight={700} mb={3}>
        Site Status
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.main_site') || "Main Site"}
            icon={<Activity size={24} />}
            status={mapStatus(health?.status)}
            details={`Last checked: ${health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Recently'}`}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.database')}
            icon={<Database size={24} />}
            status={mapStatus(d1Health?.status)}
            details={d1Health?.status === 'ok' ? 'Connection online' : (d1Health?.error || 'Checking connection...')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <HealthCard
            title={t('admin.storage')}
            icon={<HardDrive size={24} />}
            status={mapStatus(r2Health?.status)}
            details={r2Health?.status === 'ok' ? 'Storage accessible' : (r2Health?.error || 'Checking connection...')}
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
