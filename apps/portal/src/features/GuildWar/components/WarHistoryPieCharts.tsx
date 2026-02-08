import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, Typography, Box, Stack, Chip, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Users, Swords } from 'lucide-react';
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

export function WarHistoryPieCharts({ data }: WarHistoryPieChartsProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  // 1. Win/Loss/Draw Distribution
  const winLossData = useMemo(() => {
    const victories = data.filter(w => w.result === 'victory').length;
    const defeats = data.filter(w => w.result === 'defeat').length;
    const draws = data.filter(w => w.result === 'draw').length;

    return [
      { name: t('guild_war.history_victories'), value: victories, color: theme.palette.success.main },
      { name: t('guild_war.history_defeats'), value: defeats, color: theme.palette.error.main },
      { name: t('guild_war.history_draws'), value: draws, color: theme.palette.warning.main },
    ].filter(item => item.value > 0);
  }, [data, t, theme]);

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
      { name: t('guild_war.history_participation_high'), value: high, color: theme.palette.success.dark },
      { name: t('guild_war.history_participation_medium'), value: medium, color: theme.palette.success.light },
      { name: t('guild_war.history_participation_low'), value: low, color: theme.palette.warning.main },
      { name: t('guild_war.history_participation_rare'), value: rare, color: theme.palette.error.light },
    ].filter(item => item.value > 0);
  }, [data, t, theme]);

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
      { name: t('guild_war.history_role_dps'), value: dps, color: theme.palette.error.main },
      { name: t('guild_war.history_role_tank'), value: tank, color: theme.palette.info.main },
      { name: t('guild_war.history_role_support'), value: support, color: theme.palette.success.main },
      { name: t('guild_war.history_role_balanced'), value: balanced, color: theme.palette.warning.main },
    ].filter(item => item.value > 0);
  }, [data, t, theme]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          boxShadow: 2
        }}>
          <Typography variant="body2" fontWeight={700}>
            {data.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.value} ({((data.value / data.payload.total) * 100).toFixed(1)}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderPieChart = (
    data: Array<{ name: string; value: number; color: string }>,
    title: string,
    icon: React.ReactNode,
    totalLabel: string
  ) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithTotal = data.map(item => ({ ...item, total }));

    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {icon}
                <Typography variant="subtitle2" fontWeight={800} fontSize="0.85rem">
                  {title}
                </Typography>
              </Stack>
              <Chip
                label={`${totalLabel}: ${total}`}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Stack>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ p: 2, height: 300 }}>
          {data.length === 0 ? (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="caption">{t('common.no_intel')}</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithTotal}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataWithTotal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={false}
                  isAnimationActive={false}
                  position={{ x: 12, y: 12 }}
                  wrapperStyle={{ pointerEvents: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)'
      },
      gap: 2,
      mb: 3
    }}>
      {renderPieChart(
        winLossData,
        t('guild_war.history_win_loss_distribution'),
        <Trophy size={16} />,
        t('guild_war.history_total_wars')
      )}
      {renderPieChart(
        participationData,
        t('guild_war.history_participation_tiers'),
        <Users size={16} />,
        t('guild_war.history_total_members')
      )}
      {renderPieChart(
        combatRoleData,
        t('guild_war.history_combat_roles'),
        <Swords size={16} />,
        t('guild_war.history_total_members')
      )}
    </Box>
  );
}
