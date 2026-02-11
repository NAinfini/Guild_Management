import { useMemo } from 'react';
import { useAnalytics } from './AnalyticsContext';
import { CompareSelector } from './CompareSelector';
import { RankingsFilters } from './RankingsFilters';
import { TeamSelector } from './TeamSelector';
import type { MemberStats, TeamStats, WarSummary } from './types';

interface SubjectSelectorProps {
  members: MemberStats[];
  wars: WarSummary[];
  teamStats: TeamStats[];
}

export function SubjectSelector({ members, wars, teamStats }: SubjectSelectorProps) {
  const { filters } = useAnalytics();
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    for (const member of members) {
      if (member.class) classes.add(member.class);
    }
    return [...classes];
  }, [members]);

  switch (filters.mode) {
    case 'compare':
      return <CompareSelector members={members} />;
    case 'rankings':
      return <RankingsFilters availableClasses={availableClasses} maxWars={wars.length} />;
    case 'teams':
      return <TeamSelector teamStats={teamStats} />;
    default:
      return null;
  }
}
