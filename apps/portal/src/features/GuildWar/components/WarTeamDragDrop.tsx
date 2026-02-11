
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
                  const primaryClass = m.classes?.[0] as ClassType | undefined;
                  const classLabel = primaryClass ? formatClassDisplayName(primaryClass) : t('common.unknown');
                  
                  return (
                    <div
                      key={m.id}
                      className="relative flex items-center justify-between p-3 bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <Avatar src={m.avatar_url} alt={m.username} className="w-8 h-8">
                             {m.username.substring(0,2)}
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-none">{m.username}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {/* Class Pill */}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                              {classLabel}
                            </span>
                            {/* Power Pill */}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] font-bold font-mono bg-muted text-muted-foreground border border-border">
                              {formatPower(m.power || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => !disabled && onAssign?.(m.id, undefined)}
                        disabled={disabled}
                        className="h-8 w-auto px-3 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 z-10"
                      >
                         Unassign
                      </Button>
                    </div>
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
