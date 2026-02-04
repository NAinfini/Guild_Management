/**
 * Admin Audit Logs Component
 * Displays audit logs with pagination
 */

import { useState } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuditLogs } from '../hooks';
import { formatDateTime } from '../lib/utils';

const ACTION_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  ARCHIVE: 'warning',
  RESTORE: 'success',
};

export function AuditLogs() {
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
          label="Filter by Type"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setCursor(undefined);
          }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="event">Events</MenuItem>
          <MenuItem value="announcement">Announcements</MenuItem>
          <MenuItem value="member">Members</MenuItem>
          <MenuItem value="war">Wars</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshCw size={16} />}
          onClick={() => refetch()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Failed to load audit logs'}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Actor</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Entity Type</TableCell>
                      <TableCell>Entity ID</TableCell>
                      <TableCell>Details</TableCell>
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
                            {log.entityType}
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
                    No audit logs found
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
                  Previous
                </Button>

                <Typography variant="caption" color="text.secondary" alignSelf="center">
                  Showing {data?.logs.length || 0} entries
                </Typography>

                <Button
                  size="small"
                  endIcon={<ChevronRight size={16} />}
                  onClick={handleNext}
                  disabled={!data?.nextCursor}
                >
                  Next
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
