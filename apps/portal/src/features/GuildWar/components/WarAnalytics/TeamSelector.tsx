import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Stack,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from './AnalyticsContext';
import type { TeamStats } from './types';

interface TeamOption {
  teamId: number;
  teamName: string;
  warsCount: number;
}

interface TeamSelectorProps {
  teamStats: TeamStats[];
}

export function TeamSelector({ teamStats }: TeamSelectorProps) {
  const { t } = useTranslation();
  const { teamsMode, updateTeamsMode } = useAnalytics();

  const teamOptions = getTeamOptions(teamStats);

  const toggleTeam = (teamId: number) => {
    const isSelected = teamsMode.selectedTeamIds.includes(teamId);
    const selectedTeamIds = isSelected
      ? teamsMode.selectedTeamIds.filter((id) => id !== teamId)
      : [...teamsMode.selectedTeamIds, teamId];

    updateTeamsMode({ selectedTeamIds });
  };

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Shield size={18} />
              {t('guild_war.tactical_squads')}
            </Stack>
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={teamsMode.showTotal}
                onChange={(e) => updateTeamsMode({ showTotal: e.target.checked })}
                size="small"
              />
            }
            label={teamsMode.showTotal ? t('common.total') : t('common.average')}
            sx={{ ml: 0 }}
          />
        </CardContent>
      </Card>

      <Card>
        <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
          {teamOptions.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {t('guild_war.no_active_wars')}
              </Typography>
            </Box>
          ) : (
            teamOptions.map((team) => {
              const selected = teamsMode.selectedTeamIds.includes(team.teamId);
              return (
                <ListItemButton key={team.teamId} onClick={() => toggleTeam(team.teamId)} selected={selected}>
                  <ListItemIcon>
                    <Checkbox checked={selected} edge="start" disableRipple />
                  </ListItemIcon>
                  <ListItemText
                    primary={team.teamName}
                    secondary={
                      <Chip
                        size="small"
                        label={t('guild_war.analytics_wars_count', { count: team.warsCount })}
                      />
                    }
                  />
                </ListItemButton>
              );
            })
          )}
        </List>
      </Card>
    </Box>
  );
}

function getTeamOptions(teamStats: TeamStats[]): TeamOption[] {
  const teamMap = new Map<number, TeamOption>();

  for (const row of teamStats) {
    const existing = teamMap.get(row.team_id);
    if (!existing) {
      teamMap.set(row.team_id, {
        teamId: row.team_id,
        teamName: row.team_name,
        warsCount: 1,
      });
      continue;
    }

    existing.warsCount += 1;
  }

  return [...teamMap.values()].sort((a, b) => a.teamName.localeCompare(b.teamName));
}

