import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Stack, Chip, Box, Table, TableHead, TableRow, TableCell, TableBody, Divider, IconButton, Tooltip } from '@mui/material';
import { formatDateTime } from '../../../lib/utils';
import { WarHistoryEntry } from '../../../types';
import { AlertTriangle } from 'lucide-react';

type WarHistoryDetailProps = {
  war: WarHistoryEntry | null;
  open: boolean;
  onClose: () => void;
  timezoneOffset?: number;
};

export function WarHistoryDetail({ war, open, onClose, timezoneOffset = 0 }: WarHistoryDetailProps) {
  if (!war) return null;

  // Calculate missing stats per member
  const memberStatsWithMissing = war.member_stats?.map((m) => {
    const allFields = ['damage', 'healing', 'building_damage', 'credits', 'kills', 'deaths', 'assists', 'damage_taken'];
    const missingFields = allFields.filter((k) => (m as any)[k] === null || (m as any)[k] === undefined);
    return {
      ...m,
      hasMissing: missingFields.length > 0,
      missingFields,
      missingCount: missingFields.length,
    };
  }) || [];

  const totalMissingCount = memberStatsWithMissing.reduce((acc, m) => acc + m.missingCount, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight={800}>{war.title}</Typography>
          {totalMissingCount > 0 && (
            <Tooltip title={`${totalMissingCount} missing stats across ${memberStatsWithMissing.filter(m => m.hasMissing).length} members`}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                <AlertTriangle size={18} />
              </Box>
            </Tooltip>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(war.date, timezoneOffset)}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {war.score !== null && war.score !== undefined && <Chip label={`Score: ${war.score}`} size="small" />}
            <Chip
              label={war.result}
              size="small"
              color={war.result === 'victory' ? 'success' : war.result === 'draw' ? 'warning' : 'error'}
            />
            {totalMissingCount > 0 && (
              <Chip
                label={`${totalMissingCount} missing stats`}
                color="warning"
                size="small"
                icon={<AlertTriangle size={14} />}
              />
            )}
          </Stack>
          {war.notes && <Typography variant="body2">{war.notes}</Typography>}

          <Divider />
          <Typography variant="subtitle2" fontWeight={800}>Member Performance</Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table size="small" sx={{ '& .MuiTableCell-root': { fontSize: '0.75rem' } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Member</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>K</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>D</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>A</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Dmg</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Heal</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Build</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Credits</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Dmg Taken</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberStatsWithMissing.map((m) => (
                  <TableRow
                    key={m.id}
                    sx={{
                      bgcolor: m.hasMissing ? 'warning.lighter' : 'inherit',
                      '&:hover': { bgcolor: m.hasMissing ? 'warning.light' : 'action.hover' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: m.hasMissing ? 600 : 400 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {m.hasMissing && (
                          <Tooltip title={`Missing: ${m.missingFields.join(', ')}`}>
                            <Box sx={{ display: 'flex', color: 'warning.main' }}>
                              <AlertTriangle size={12} />
                            </Box>
                          </Tooltip>
                        )}
                        <span>{m.username}</span>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{m.kills ?? '—'}</TableCell>
                    <TableCell align="right">{m.deaths ?? '—'}</TableCell>
                    <TableCell align="right">{m.assists ?? '—'}</TableCell>
                    <TableCell align="right">{m.damage ?? '—'}</TableCell>
                    <TableCell align="right">{m.healing ?? '—'}</TableCell>
                    <TableCell align="right">{m.building_damage ?? '—'}</TableCell>
                    <TableCell align="right">{m.credits ?? '—'}</TableCell>
                    <TableCell align="right">{m.damage_taken ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Divider />
          <Typography variant="subtitle2" fontWeight={800}>Teams Snapshot</Typography>
          <Stack spacing={1}>
            {war.teams_snapshot?.map((team) => (
              <Stack key={team.id} direction="row" spacing={1} flexWrap="wrap">
                <Chip label={team.name} color="primary" size="small" />
                {team.members.map((m) => (
                  <Chip key={m.user_id} label={m.user_id} size="small" variant="outlined" />
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
