import { beforeEach, describe, expect, it, vi } from 'vitest';

const { putMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  api: {
    put: putMock,
  },
}));

vi.mock('@/lib/api/api-builder', () => ({
  typedAPI: {
    wars: {},
  },
}));

import { warsAPI } from '@/lib/api/wars';

describe('warsAPI.updateMemberStats', () => {
  beforeEach(() => {
    putMock.mockReset();
    putMock.mockResolvedValue({ ok: true });
  });

  it('wraps single member stat updates into stats array payload expected by worker endpoint', async () => {
    await warsAPI.updateMemberStats('war_1', {
      id: 'u_1',
      username: 'Alpha',
      class: 'mingjin_hong',
      kills: 10,
      deaths: 2,
      assists: 12,
      damage: 150000,
      healing: 30000,
      building_damage: 18000,
      damage_taken: 72000,
      credits: 3200,
      note: 'frontline',
    });

    expect(putMock).toHaveBeenCalledWith(
      '/wars/history/war_1/member-stats',
      {
        stats: [
          {
            userId: 'u_1',
            kills: 10,
            deaths: 2,
            assists: 12,
            damage: 150000,
            healing: 30000,
            buildingDamage: 18000,
            damageTaken: 72000,
            credits: 3200,
            note: 'frontline',
          },
        ],
      },
      undefined,
      { headers: undefined },
    );
  });
});
