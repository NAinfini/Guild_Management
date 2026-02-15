import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from './AnalyticsContext';
import type { TeamStats } from './types';
import { Card, CardContent } from '@/components/layout/Card';
import { Checkbox } from '@/components/input/Checkbox';
import { Badge } from '@/components/data-display/Badge';
import { Label } from '@/components/input/Label';
import { cn } from '../../../../lib/utils';
import {
  Groups,
  ErrorOutline
} from '@/ui-bridge/icons-material';

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
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2 p-4">
          <Groups className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">{t('guild_war.analytics_team_comparison')}</h2>
        </div>
        </div>
      </Card>

      <Card>
        <div className="max-h-[360px] overflow-auto p-2">
          {teamOptions.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <ErrorOutline className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                  {t('guild_war.tactical_selection')}
                </span>
              </div>
              <p className="text-sm">{t('guild_war.no_active_wars')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {teamOptions.map((team) => {
                const selected = teamsMode.selectedTeamIds.includes(team.teamId);
                return (
                  <div
                    key={team.teamId}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-accent/50",
                      selected && "bg-accent"
                    )}
                    onClick={() => toggleTeam(team.teamId)}
                  >
                    <Checkbox 
                      checked={selected} 
                      onChange={() => toggleTeam(team.teamId)}
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
                      id={`team-${team.teamId}`}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <Label 
                        htmlFor={`team-${team.teamId}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {team.teamName}
                      </Label>
                      <Badge variant="secondary" className="text-[10px] h-5 tabular-nums">
                        {t('guild_war.analytics_wars_count', { count: team.warsCount })}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
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
