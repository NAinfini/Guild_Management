export const DEFAULT_VISIBLE_PARTICIPANTS = 10;

export function getVisibleParticipants<T>(
  participants: T[] | undefined,
  showAll: boolean,
  limit: number = DEFAULT_VISIBLE_PARTICIPANTS,
): { visibleParticipants: T[]; hiddenCount: number } {
  const all = Array.isArray(participants) ? participants : [];
  if (showAll) {
    return {
      visibleParticipants: all,
      hiddenCount: 0,
    };
  }

  const boundedLimit = Math.max(0, limit);
  const visibleParticipants = all.slice(0, boundedLimit);
  return {
    visibleParticipants,
    hiddenCount: Math.max(0, all.length - visibleParticipants.length),
  };
}
