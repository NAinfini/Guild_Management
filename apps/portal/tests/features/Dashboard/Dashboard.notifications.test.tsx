import { describe, expect, it } from 'vitest';
import {
  applyNotificationSeen,
  getLatestCompletedWar,
  getRecentCompletedWars,
} from '@/features/Dashboard';

describe('Dashboard notification read state', () => {
  it('marks event notifications as seen without changing announcements', () => {
    const next = applyNotificationSeen(
      {
        events: '2026-01-01T00:00:00.000Z',
        announcements: '2026-01-01T00:00:00.000Z',
      },
      'event',
      '2026-02-08T10:00:00.000Z'
    );

    expect(next.events).toBe('2026-02-08T10:00:00.000Z');
    expect(next.announcements).toBe('2026-01-01T00:00:00.000Z');
  });

  it('marks announcement notifications as seen without changing events', () => {
    const next = applyNotificationSeen(
      {
        events: '2026-01-01T00:00:00.000Z',
        announcements: '2026-01-01T00:00:00.000Z',
      },
      'announcement',
      '2026-02-08T10:00:00.000Z'
    );

    expect(next.events).toBe('2026-01-01T00:00:00.000Z');
    expect(next.announcements).toBe('2026-02-08T10:00:00.000Z');
  });

  it('returns the latest non-pending war that already happened', () => {
    const wars = [
      {
        id: 'future-completed',
        result: 'victory',
        date: '2026-02-10T00:00:00.000Z',
        updated_at: '2026-02-10T01:00:00.000Z',
      },
      {
        id: 'latest-completed',
        result: 'defeat',
        date: '2026-02-07T00:00:00.000Z',
        updated_at: '2026-02-07T01:00:00.000Z',
      },
      {
        id: 'pending',
        result: 'pending',
        date: '2026-02-06T00:00:00.000Z',
        updated_at: '2026-02-06T01:00:00.000Z',
      },
    ] as any;

    const war = getLatestCompletedWar(wars, '2026-02-08T00:00:00.000Z');

    expect(war?.id).toBe('latest-completed');
  });

  it('returns undefined when no completed war exists in the past', () => {
    const wars = [
      {
        id: 'future-pending',
        result: 'pending',
        date: '2026-02-10T00:00:00.000Z',
        updated_at: '2026-02-10T01:00:00.000Z',
      },
    ] as any;

    const war = getLatestCompletedWar(wars, '2026-02-08T00:00:00.000Z');

    expect(war).toBeUndefined();
  });

  it('returns the last 4 completed wars sorted by guild war event time', () => {
    const wars = [
      { id: 'w1', event_id: 'e1', result: 'victory', date: '2026-02-01T00:00:00.000Z' },
      { id: 'w2', event_id: 'e2', result: 'defeat', date: '2026-02-02T00:00:00.000Z' },
      { id: 'w3', event_id: 'e3', result: 'draw', date: '2026-02-03T00:00:00.000Z' },
      { id: 'w4', event_id: 'e4', result: 'victory', date: '2026-02-04T00:00:00.000Z' },
      { id: 'w5', event_id: 'e5', result: 'defeat', date: '2026-02-05T00:00:00.000Z' },
      { id: 'w6', event_id: 'e6', result: 'pending', date: '2026-02-06T00:00:00.000Z' },
    ] as any;
    const events = [
      { id: 'e1', type: 'guild_war', start_time: '2026-02-01T10:00:00.000Z' },
      { id: 'e2', type: 'guild_war', start_time: '2026-02-02T10:00:00.000Z' },
      { id: 'e3', type: 'guild_war', start_time: '2026-02-03T10:00:00.000Z' },
      { id: 'e4', type: 'guild_war', start_time: '2026-02-04T10:00:00.000Z' },
      { id: 'e5', type: 'guild_war', start_time: '2026-02-05T10:00:00.000Z' },
      { id: 'e6', type: 'guild_war', start_time: '2026-02-06T10:00:00.000Z' },
    ] as any;

    const recent = getRecentCompletedWars(wars, events, 4, '2026-02-08T00:00:00.000Z');

    expect(recent.map((war) => war.id)).toEqual(['w5', 'w4', 'w3', 'w2']);
  });
});
