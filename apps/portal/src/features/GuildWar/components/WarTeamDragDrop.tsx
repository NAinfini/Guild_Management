
import React from 'react';
import { User, ClassType } from '../../../types';
import { formatClassDisplayName, formatPower } from '../../../lib/utils';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/layout/Card';
import { Avatar } from '@/components/data-display';
import { Badge } from '@/components/data-display/Badge';
import { TeamMemberCard } from '@/components/data-display';
import { cn } from '../../../lib/utils';

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

export function WarTeamDragDrop({ warId: _warId, teams, unassignedMembers, onAssign, disabled }: WarTeamDragDropProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold uppercase">Unassigned ({unassignedMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {unassignedMembers.map((m) => {
              return (
                <Badge
                  key={m.id}
                  variant="outline"
                  className={cn(
                      "cursor-pointer hover:bg-accent transition-colors py-1 px-2 text-sm font-bold",
                      disabled && "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => !disabled && onAssign?.(m.id, teams[0]?.id)}
                >
                  {m.username}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-black uppercase text-primary">{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {team.members.map((m) => {
                  return (
                    <TeamMemberCard
                      key={m.id}
                      member={m}
                      variant="default"
                      canManage={!disabled}
                      onKick={!disabled ? () => onAssign?.(m.id, undefined) : undefined}
                    />
                  );
                })}
                {team.members.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground italic">
                        No members assigned
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
