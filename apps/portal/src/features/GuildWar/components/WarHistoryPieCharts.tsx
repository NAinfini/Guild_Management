
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/layout/Card';
import { Badge } from '@/components/data-display/Badge';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  EmojiEvents,
  Groups,
  MilitaryTech,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface WarData {
  id: string;
  title: string;
  date: string;
  result: 'victory' | 'defeat' | 'draw' | 'pending';
  score?: number;
  enemy_score?: number;
  own_stats?: {
    kills?: number;
    deaths?: number;
    assists?: number;
    damage?: number;
    healing?: number;
    building_damage?: number;
    credits?: number;
    damage_taken?: number;
  };
  enemy_stats?: {
    kills?: number;
    deaths?: number;
    assists?: number;
  };
  own_towers?: number;
  enemy_towers?: number;
  member_stats?: Array<{
    user_id?: string;
    id?: string;
    username: string;
    damage?: number;
    healing?: number;
    building_damage?: number;
    credits?: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    damage_taken?: number;
  }>;
}

interface WarHistoryPieChartsProps {
  data: WarData[];
}

export const WAR_HISTORY_PIE_COLORS = {
  victory: 'var(--color-status-success)',
  defeat: 'var(--color-status-error)',
  draw: 'var(--color-status-warning)',
  info: 'var(--color-status-info)',
} as const;

export function WarHistoryPieCharts({ data }: WarHistoryPieChartsProps) {
  const { t } = useTranslation();
  
  // 1. Win/Loss/Draw Distribution
  const winLossData = useMemo(() => {
    const victories = data.filter(w => w.result === 'victory').length;
    const defeats = data.filter(w => w.result === 'defeat').length;
    const draws = data.filter(w => w.result === 'draw').length;

    return [
      { name: t('guild_war.history_victories'), value: victories, color: WAR_HISTORY_PIE_COLORS.victory },
      { name: t('guild_war.history_defeats'), value: defeats, color: WAR_HISTORY_PIE_COLORS.defeat },
      { name: t('guild_war.history_draws'), value: draws, color: WAR_HISTORY_PIE_COLORS.draw },
    ].filter(item => item.value > 0);
  }, [data, t]);

  // 2. Participation Distribution
  const participationData = useMemo(() => {
    if (data.length === 0) return [];

    // Get all unique members across all wars
    const memberParticipation = new Map<string, { username: string; count: number }>();

    data.forEach(war => {
      war.member_stats?.forEach(member => {
        const memberId = member.user_id || member.id || member.username;
        const current = memberParticipation.get(memberId) || { username: member.username, count: 0 };
        memberParticipation.set(memberId, { ...current, count: current.count + 1 });
      });
    });

    const totalWars = data.length;
    const members = Array.from(memberParticipation.values());

    // Calculate participation tiers
    const high = members.filter(m => m.count / totalWars >= 0.8).length;
    const medium = members.filter(m => m.count / totalWars >= 0.5 && m.count / totalWars < 0.8).length;
    const low = members.filter(m => m.count / totalWars >= 0.2 && m.count / totalWars < 0.5).length;
    const rare = members.filter(m => m.count / totalWars < 0.2).length;

    return [
      { name: t('guild_war.history_participation_high'), value: high, color: 'hsl(142 76% 36%)' }, // Success Darkish
      { name: t('guild_war.history_participation_medium'), value: medium, color: WAR_HISTORY_PIE_COLORS.victory },
      { name: t('guild_war.history_participation_low'), value: low, color: WAR_HISTORY_PIE_COLORS.draw },
      { name: t('guild_war.history_participation_rare'), value: rare, color: WAR_HISTORY_PIE_COLORS.defeat },
    ].filter(item => item.value > 0);
  }, [data, t]);

  // 3. Combat Role Distribution
  const combatRoleData = useMemo(() => {
    if (data.length === 0) return [];

    // Calculate average stats per member across all wars
    const memberStats = new Map<string, {
      username: string;
      damage: number;
      healing: number;
      damageTaken: number;
      count: number;
    }>();

    data.forEach(war => {
      war.member_stats?.forEach(member => {
        const memberId = member.user_id || member.id || member.username;
        const current = memberStats.get(memberId) || {
          username: member.username,
          damage: 0,
          healing: 0,
          damageTaken: 0,
          count: 0
        };

        memberStats.set(memberId, {
          username: current.username,
          damage: current.damage + (member.damage || 0),
          healing: current.healing + (member.healing || 0),
          damageTaken: current.damageTaken + (member.damage_taken || 0),
          count: current.count + 1,
        });
      });
    });

    // Classify members by role based on average stats
    let dps = 0;
    let tank = 0;
    let support = 0;
    let balanced = 0;

    memberStats.forEach(stats => {
      const avgDamage = stats.damage / stats.count;
      const avgHealing = stats.healing / stats.count;
      const avgDamageTaken = stats.damageTaken / stats.count;

      // Classification logic
      if (avgHealing > avgDamage * 0.5) {
        support++;
      } else if (avgDamageTaken > avgDamage * 0.8) {
        tank++;
      } else if (avgDamage > avgHealing * 3 && avgDamage > 0) {
        dps++;
      } else {
        balanced++;
      }
    });

    return [
      { name: t('guild_war.history_role_dps'), value: dps, color: WAR_HISTORY_PIE_COLORS.defeat },
      { name: t('guild_war.history_role_tank'), value: tank, color: WAR_HISTORY_PIE_COLORS.info }, // Blue
      { name: t('guild_war.history_role_support'), value: support, color: WAR_HISTORY_PIE_COLORS.victory },
      { name: t('guild_war.history_role_balanced'), value: balanced, color: WAR_HISTORY_PIE_COLORS.draw },
    ].filter(item => item.value > 0);
  }, [data, t]);

  const renderPieChart = (
    data: Array<{ name: string; value: number; color: string }>,
    title: string,
    Icon: React.ElementType<{ sx?: { fontSize?: number }; className?: string }>,
    totalLabel: string
  ) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Transform data to MUI X-Charts format
    const chartData = data.map((item, index) => ({
      id: index,
      value: item.value,
      label: `${item.name}: ${((item.value / total) * 100).toFixed(0)}%`,
      color: item.color,
    }));

    return (
      <Card className="h-full">
        <CardHeader className="pb-1 border-b">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <Icon sx={{ fontSize: 16 }} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{title}</span>
                </div>
                <Badge variant="outline" className="font-bold text-[0.65rem]">
                    {totalLabel}: {total}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-4 h-[300px]">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <span className="text-sm">{t('common.no_intel')}</span>
            </div>
          ) : (
            <PieChart
              series={[
                {
                  data: chartData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  arcLabel: (item) => item.label || '',
                },
              ]}
              height={260}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              hideLegend

            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {renderPieChart(
        winLossData,
        t('guild_war.history_win_loss_distribution'),
        EmojiEvents,
        t('guild_war.history_total_wars')
      )}
      {renderPieChart(
        participationData,
        t('guild_war.history_participation_tiers'),
        Groups,
        t('guild_war.history_total_members')
      )}
      {renderPieChart(
        combatRoleData,
        t('guild_war.history_combat_roles'),
        MilitaryTech,
        t('guild_war.history_total_members')
      )}
    </div>
  );
}
