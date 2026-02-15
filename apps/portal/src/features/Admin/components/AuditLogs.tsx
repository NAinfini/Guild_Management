/**
 * Admin Audit Logs Component
 * Displays audit logs with pagination
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  TextField,
  MenuItem,
  Alert,
  useTheme,
} from '@/ui-bridge/material';
import { TableSkeleton } from '@/components';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
} from '@/ui-bridge/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuditLogs } from '../../../hooks';
import { formatDateTime } from '../../../lib/utils';

const ACTION_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  ARCHIVE: 'warning',
  RESTORE: 'success',
};

export function AuditLogs() {
  const { t } = useTranslation();
  const theme = useTheme();
  const cardToken = theme.custom?.components?.card;
  const tableToken = theme.custom?.components?.table;
  const inputToken = theme.custom?.components?.input;
  const buttonToken = theme.custom?.components?.button;
  const [entityType, setEntityType] = useState<string>('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [limit] = useState(50);

  const { data, isLoading, error, refetch } = useAuditLogs({
    entityType: entityType || undefined,
    cursor,
    limit,
  });

  const handlePrevious = () => {
    // In a real implementation, you'd track previous cursors
    setCursor(undefined);
  };

  const handleNext = () => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  };

  return (
    <Box
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: inputToken?.bg || 'background.paper',
          color: inputToken?.text || 'text.primary',
          '& fieldset': { borderColor: inputToken?.border || 'divider' },
          '&:hover fieldset': { borderColor: inputToken?.focusBorder || 'primary.main' },
          '&.Mui-focused fieldset': { borderColor: inputToken?.focusBorder || 'primary.main' },
        },
        '& .MuiButton-outlined': {
          borderColor: buttonToken?.border || 'divider',
          color: buttonToken?.text || 'text.primary',
          '&:hover': {
            borderColor: buttonToken?.border || 'divider',
            bgcolor: buttonToken?.hoverBg || 'action.hover',
          },
        },
      }}
    >
      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <TextField
          select
          label={t('admin.filter_type')}
          value={entityType}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEntityType(e.target.value);
            setCursor(undefined);
          }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">{t('admin.all_types')}</MenuItem>
          <MenuItem value="event">{t('nav.events')}</MenuItem>
          <MenuItem value="announcement">{t('nav.announcements')}</MenuItem>
          <MenuItem value="member">{t('nav.roster')}</MenuItem>
          <MenuItem value="war">{t('nav.guild_war')}</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {t('admin.recheck')}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="admin-audit-error-state">
          <Stack spacing={1.5}>
            <Typography variant="body2">
              {error instanceof Error ? error.message : t('admin.no_audit_records')}
            </Typography>
            <Stack
              data-testid="admin-audit-error-actions"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {/* Retry keeps audit recovery in-place without losing current pagination/filter context. */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {t('common.retry')}
              </Button>
              {entityType ? (
                // Clear filter resets entity scoping so users can recover broader audit visibility quickly.
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setEntityType('');
                    setCursor(undefined);
                  }}
                >
                  {t('common.clear_filters')}
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Alert>
      )}

      <Card
        sx={{
          bgcolor: cardToken?.bg || 'background.paper',
          border: '1px solid',
          borderColor: cardToken?.border || 'divider',
          boxShadow: cardToken?.shadow || 'none',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <TableSkeleton rows={10} cols={6} />
          ) : (
            <>
              <TableContainer
                sx={{
                  borderTop: '1px solid',
                  borderColor: tableToken?.border || 'divider',
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: tableToken?.headerBg || 'action.hover' }}>
                    <TableRow>
                      <TableCell>{t('admin.label_timestamp')}</TableCell>
                      <TableCell>{t('admin.label_actor')}</TableCell>
                      <TableCell>{t('admin.label_action')}</TableCell>
                      <TableCell>{t('admin.label_entity_type')}</TableCell>
                      <TableCell>{t('admin.label_entity_id')}</TableCell>
                      <TableCell>{t('admin.label_details')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.logs.map((log: any) => (
                      <TableRow
                        key={log.id}
                        hover
                        sx={{
                          bgcolor: tableToken?.rowBg || 'transparent',
                          '&:hover': { bgcolor: tableToken?.rowHoverBg || 'action.hover' },
                        }}
                      >
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace">
                            {formatDateTime(log.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {log.actorUsername || log.actorId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action}
                            size="small"
                            color={ACTION_COLORS[log.action] || 'default'}
                            sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" textTransform="uppercase" fontWeight={700}>
                            {t(`admin.entity_${log.entityType}`)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                            {log.entityId.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                            {log.details || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {data?.logs.length === 0 && (
                <Box sx={{ py: 8, textAlign: 'center' }} data-testid="admin-audit-empty-state">
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.no_audit_records')}
                  </Typography>
                  <Stack
                    data-testid="admin-audit-empty-actions"
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                      onClick={() => refetch()}
                      disabled={isLoading}
                    >
                      {t('common.retry')}
                    </Button>
                    {entityType ? (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setEntityType('');
                          setCursor(undefined);
                        }}
                      >
                        {t('common.clear_filters')}
                      </Button>
                    ) : null}
                  </Stack>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 2,
                  borderTop: 1,
                  borderColor: tableToken?.border || 'divider',
                  bgcolor: tableToken?.headerBg || 'transparent',
                }}
              >
                <Button
                  size="small"
                  startIcon={<ChevronLeftIcon sx={{ fontSize: 16 }} />}
                  onClick={handlePrevious}
                  disabled={!cursor}
                >
                  {t('common.prev')}
                </Button>

                <Typography variant="caption" color="text.secondary" alignSelf="center">
                  {t('common.showing_entries', { count: data?.logs.length || 0 })}
                </Typography>

                <Button
                  size="small"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  onClick={handleNext}
                  disabled={!data?.nextCursor}
                >
                  {t('common.next')}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
