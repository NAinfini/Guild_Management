import { describe, expect, it } from 'vitest';
import { getMemberMetricColor, getUserColor } from '@/features/GuildWar/components/WarAnalytics/types';
import { transformForCompare } from '@/features/GuildWar/components/WarAnalytics/utils';

describe('War analytics chart identity', () => {
  it('assigns distinct colors for users that previously collided by palette modulo', () => {
    expect(getUserColor(1)).not.toBe(getUserColor(21));
  });

  it('creates separate compare series for each member+metric combination', () => {
    const data = transformForCompare(
      [
        { war_id: 10, user_id: 1, damage: 1000, healing: 200 } as any,
        { war_id: 10, user_id: 2, damage: 700, healing: 350 } as any,
      ],
      [{ war_id: 10, war_date: '2026-02-09', title: 'War 10' } as any],
      [1, 2],
      ['damage', 'healing'] as any,
    );

    expect(data[0]).toMatchObject({
      war_id: 10,
      user_1__damage: 1000,
      user_1__healing: 200,
      user_2__damage: 700,
      user_2__healing: 350,
    });

    expect(getMemberMetricColor(1, 'damage')).not.toBe(getMemberMetricColor(1, 'healing'));
    expect(getMemberMetricColor(1, 'damage')).not.toBe(getMemberMetricColor(2, 'damage'));
  });
});
