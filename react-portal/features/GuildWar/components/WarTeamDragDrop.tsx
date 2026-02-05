import React from 'react';
import { Card, CardContent, CardHeader, Typography, Stack, Chip, Button, Box, Avatar, Divider } from '@mui/material';
import { User } from '../../../types';

type Team = {
  id: string;
  name: string;
  members: User[];
};

type WarTeamDragDropProps = {
  warId: string;
  teams: Team[];
  unassignedMembers: User[];
  onAssign?: (userId: string, teamId?: string) => void;
  disabled?: boolean;
};

export function WarTeamDragDrop({ warId, teams, unassignedMembers, onAssign, disabled }: WarTeamDragDropProps) {
  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader title={`Unassigned (${unassignedMembers.length})`} />
        <CardContent>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {unassignedMembers.map((m) => (
              <Chip
                key={m.id}
                label={m.username}
                onClick={() => !disabled && onAssign?.(m.id, teams[0]?.id)}
                disabled={disabled}
                sx={{ fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer' }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader title={team.name} />
            <CardContent>
              <Stack spacing={1} divider={<Divider flexItem />}>
                {team.members.map((m) => (
                  <Box
                    key={m.id}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={m.avatar_url} sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{m.username}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.classes?.[0]?.replace('_', ' ') || '—'}</Typography>
                      </Box>
                    </Stack>
                    <Button size="small" variant="outlined" onClick={() => !disabled && onAssign?.(m.id, undefined)} disabled={disabled}>
                      Unassign
                    </Button>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
