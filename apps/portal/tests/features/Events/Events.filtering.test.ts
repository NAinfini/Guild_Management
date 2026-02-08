import { describe, expect, it } from 'vitest';
import type { Event } from '@/types';
import { filterEventsByCategory } from '@/features/Events/Events.filtering';

const baseEvent = {
  description: '',
  start_time: '2026-02-08T00:00:00.000Z',
  updated_at: '2026-02-08T00:00:00.000Z',
  participants: [],
  is_locked: false,
  is_pinned: false,
} as const satisfies Partial<Event>;

describe('filterEventsByCategory', () => {
  const events = [
    { ...baseEvent, id: '1', type: 'weekly_mission', title: 'A', is_archived: false },
    { ...baseEvent, id: '2', type: 'guild_war', title: 'B', is_archived: false },
    { ...baseEvent, id: '3', type: 'other', title: 'C', is_archived: false },
    { ...baseEvent, id: '4', type: 'guild_war', title: 'D', is_archived: true },
  ] as Event[];

  it('returns only active guild war events for guild_war filter', () => {
    const result = filterEventsByCategory(events, 'guild_war');

    expect(result.map((event) => event.id)).toEqual(['2']);
  });

  it('returns only archived events for archived filter', () => {
    const result = filterEventsByCategory(events, 'archived');

    expect(result.map((event) => event.id)).toEqual(['4']);
  });
});
