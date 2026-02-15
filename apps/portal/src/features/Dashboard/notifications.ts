import { isAfter, isBefore, isValid, parseISO } from 'date-fns';

export const applyNotificationSeen = (
  current: { events: string; announcements: string },
  type: 'event' | 'announcement',
  timestamp: string,
) => {
  return {
    ...current,
    [type === 'event' ? 'events' : 'announcements']: timestamp,
  };
};

export const getDashboardRecentEvents = (events: any[], now: string, limit: number) => {
  const nowDate = parseISO(now);
  const eligible = events.filter((e) => {
    if (e.is_archived) return false;
    const start = parseISO(e.start_time);
    return isValid(start);
  });

  const activeOrUpcoming = eligible.filter((event) => {
    const start = parseISO(event.start_time);
    const end = event.end_time ? parseISO(event.end_time) : null;
    const hasValidEnd = !!end && isValid(end);
    const isUpcoming = isAfter(start, nowDate);
    const isActive = !isAfter(start, nowDate) && hasValidEnd && !isBefore(end, nowDate);
    return isUpcoming || isActive;
  });

  if (activeOrUpcoming.length > 0) {
    return activeOrUpcoming
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
      .slice(0, limit);
  }

  return eligible
    .sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime())
    .slice(0, limit);
};

export const getLatestCompletedWar = (wars: any[], now: string) => {
  const nowDate = parseISO(now);
  return wars
    .filter((war) => war.result !== 'pending' && !isAfter(parseISO(war.date), nowDate))
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0];
};

export const getRecentCompletedWars = (wars: any[], events: any[], limit: number, now: string) => {
  const nowDate = parseISO(now);
  return wars
    .filter((war) => war.result !== 'pending' && !isAfter(parseISO(war.date), nowDate))
    .sort((a, b) => {
      const eventA = events.find((event) => event.id === a.event_id);
      const eventB = events.find((event) => event.id === b.event_id);
      const timeA = eventA ? parseISO(eventA.start_time).getTime() : parseISO(a.date).getTime();
      const timeB = eventB ? parseISO(eventB.start_time).getTime() : parseISO(b.date).getTime();
      return timeB - timeA;
    })
    .slice(0, limit);
};
