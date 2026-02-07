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
} from '@mui/material';
import { TableSkeleton } from '../../../components/SkeletonLoaders';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
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
    <Box>
      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <TextField
          select
          label={t('admin.filter_type')}
          value={entityType}
          onChange={(e) => {
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
          startIcon={<RefreshCw size={16} />}
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {t('admin.recheck')}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : t('admin.no_audit_records')}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <TableSkeleton rows={10} cols={6} />
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
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
                      <TableRow key={log.id} hover>
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
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.no_audit_records')}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  size="small"
                  startIcon={<ChevronLeft size={16} />}
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
                  endIcon={<ChevronRight size={16} />}
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
