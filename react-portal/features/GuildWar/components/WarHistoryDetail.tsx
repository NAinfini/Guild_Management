import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Stack, Chip, Box, Table, TableHead, TableRow, TableCell, TableBody, Divider } from '@mui/material';
import { formatDateTime } from '../../../lib/utils';
import { WarHistoryEntry } from '../../../types';

type WarHistoryDetailProps = {
  war: WarHistoryEntry | null;
  open: boolean;
  onClose: () => void;
  timezoneOffset?: number;
};

export function WarHistoryDetail({ war, open, onClose, timezoneOffset = 0 }: WarHistoryDetailProps) {
  if (!war) return null;
  const missingCount = war.member_stats?.reduce((acc, s) => {
    const missingFields = ['damage', 'healing', 'building_damage', 'credits', 'kills', 'deaths', 'assists'].filter(
      (k) => (s as any)[k] === null || (s as any)[k] === undefined,
    );
    return acc + missingFields.length;
  }, 0) || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{war.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(war.date, timezoneOffset)}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Score: ${war.score}`} />
            <Chip label={`Result: ${war.result}`} />
            {missingCount > 0 && <Chip label={`Missing: ${missingCount}`} color="warning" />}
          </Stack>
          {war.notes && <Typography variant="body2">{war.notes}</Typography>}

          <Divider />
          <Typography variant="subtitle2" fontWeight={800}>Member Stats</Typography>
          <Box sx={{ maxHeight: 260, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell align="right">Dmg</TableCell>
                  <TableCell align="right">Heal</TableCell>
                  <TableCell align="right">Build</TableCell>
                  <TableCell align="right">Credits</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {war.member_stats?.map((m) => {
                  const missing = ['damage', 'healing', 'building_damage', 'credits'].some(
                    (k) => (m as any)[k] === null || (m as any)[k] === undefined,
                  );
                  return (
                    <TableRow key={m.id} sx={missing ? { opacity: 0.7 } : undefined}>
                      <TableCell>{m.username}</TableCell>
                      <TableCell align="right">{m.damage ?? '—'}</TableCell>
                      <TableCell align="right">{m.healing ?? '—'}</TableCell>
                      <TableCell align="right">{m.building_damage ?? '—'}</TableCell>
                      <TableCell align="right">{m.credits ?? '—'}</TableCell>
                    </TableRow>
                  );
                })}
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
