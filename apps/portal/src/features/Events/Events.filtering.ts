import type { Event } from '../../types';

export type EventFilter = 'all' | 'weekly_mission' | 'guild_war' | 'other' | 'archived';

export function filterEventsByCategory(events: Event[], filter: EventFilter): Event[] {
  if (filter === 'archived') {
    return events.filter((event) => !!event.is_archived);
  }

  return events.filter((event) => {
    if (event.is_archived) return false;
    if (filter === 'all') return true;
    return event.type === filter;
  });
}
