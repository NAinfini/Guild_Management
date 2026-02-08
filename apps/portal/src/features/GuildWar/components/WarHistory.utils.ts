import type { WarHistoryEntry, WarMemberStat } from '../../../types';

type NumericMemberField = 'kills' | 'deaths' | 'assists';

export function sumMemberField(
  members: WarMemberStat[] | undefined,
  field: NumericMemberField,
): number {
  if (!members || members.length === 0) return 0;
  return members.reduce((sum, member) => sum + (member[field] || 0), 0);
}

export function formatKdaRatio(kills: number, deaths: number, assists: number): string {
  const ratio = (kills + assists) / Math.max(deaths, 1);
  return ratio.toFixed(2);
}

export function buildWarCardMetrics(war: WarHistoryEntry) {
  const killsFromMembers = sumMemberField(war.member_stats, 'kills');
  const deathsFromMembers = sumMemberField(war.member_stats, 'deaths');
  const assistsFromMembers = sumMemberField(war.member_stats, 'assists');

  const kills = killsFromMembers > 0 ? killsFromMembers : war.own_stats?.kills || 0;
  const deaths = deathsFromMembers;
  const assists = assistsFromMembers;

  return {
    kills,
    deaths,
    assists,
    kda: formatKdaRatio(kills, deaths, assists),
    credits: war.own_stats?.credits || 0,
    distance: war.own_stats?.distance || 0,
    towers: war.own_stats?.towers || 0,
  };
}
