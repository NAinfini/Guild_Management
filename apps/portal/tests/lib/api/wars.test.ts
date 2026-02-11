import { describe, expect, it } from 'vitest';
import { mapHistoryToDomain } from '@/lib/api/wars';

describe('mapHistoryToDomain', () => {
  it('maps member_stats from DTO when present', () => {
    const mapped = mapHistoryToDomain({
      war_id: 'war_1',
      event_id: 'event_1',
      war_date: '2026-02-08 12:00:00',
      title: 'War 1',
      result: 'win',
      our_kills: 10,
      enemy_kills: 8,
      our_towers: 3,
      enemy_towers: 2,
      our_base_hp: 90,
      enemy_base_hp: 20,
      our_distance: 1200,
      enemy_distance: 1100,
      our_credits: 5000,
      enemy_credits: 4800,
      notes: null,
      updated_at_utc: '2026-02-08 13:00:00',
      member_stats: [
        {
          user_id: 'u1',
          username: 'Alpha',
          class_code: 'mingjin_hong',
          kills: 4,
          deaths: 1,
          assists: 3,
          damage: 1000,
          healing: 300,
          building_damage: 200,
          damage_taken: 500,
          credits: 900,
          note: null,
        },
      ],
    } as any);

    expect(mapped.member_stats).toHaveLength(1);
    expect(mapped.member_stats[0]).toMatchObject({
      id: 'u1',
      username: 'Alpha',
      kills: 4,
      deaths: 1,
      assists: 3,
      damage: 1000,
      healing: 300,
      building_damage: 200,
      damage_taken: 500,
      credits: 900,
    });
  });
});
