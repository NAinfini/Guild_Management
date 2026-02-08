import { describe, expect, it } from 'vitest';
import {
  buildWarCardMetrics,
  formatKdaRatio,
  sumMemberField,
} from '@/features/GuildWar/components/WarHistory.utils';

describe('WarHistory utils', () => {
  it('sums member stat fields safely', () => {
    expect(sumMemberField(undefined, 'kills')).toBe(0);
    expect(
      sumMemberField(
        [
          { kills: 3 } as any,
          { kills: 2 } as any,
          { kills: undefined } as any,
        ],
        'kills',
      ),
    ).toBe(5);
  });

  it('builds card metrics from member stats and war stats', () => {
    const metrics = buildWarCardMetrics({
      own_stats: { kills: 0, towers: 4, base_hp: 80, credits: 12000, distance: 5600 },
      member_stats: [
        { kills: 4, deaths: 2, assists: 3 } as any,
        { kills: 2, deaths: 1, assists: 5 } as any,
      ],
    } as any);

    expect(metrics.kills).toBe(6);
    expect(metrics.deaths).toBe(3);
    expect(metrics.assists).toBe(8);
    expect(metrics.credits).toBe(12000);
    expect(metrics.distance).toBe(5600);
    expect(metrics.towers).toBe(4);
  });

  it('formats KDA ratio and handles zero deaths', () => {
    expect(formatKdaRatio(10, 2, 4)).toBe('7.00');
    expect(formatKdaRatio(10, 0, 4)).toBe('14.00');
  });
});
