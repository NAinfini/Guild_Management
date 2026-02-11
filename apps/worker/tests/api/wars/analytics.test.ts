import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/core/endpoint-factory', () => ({
  createEndpoint: ({ handler, parseQuery }: any) => {
    return async (context: any) =>
      handler({
        env: context.env,
        params: context.params ?? {},
        request: context.request,
        query: parseQuery ? parseQuery(new URL(context.request.url).searchParams) : {},
        body: null,
        user: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
        isModerator: false,
        waitUntil: context.waitUntil ?? (() => {}),
      });
  },
}));

import { onRequestGet } from '../../../src/api/wars/analytics';

describe('GET /api/wars/analytics', () => {
  it('returns paginated per-war data with metadata', async () => {
    const perWarBindArgs: any[] = [];

    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: (...args: any[]) => {
          if (sql.includes('LIMIT ?') && sql.includes('JOIN war_member_stats wms ON wms.war_id = wh.war_id')) {
            perWarBindArgs.push(args);
          }

          return {
            all: async () => {
              if (sql.includes('GROUP BY u.user_id')) {
                return {
                  results: [
                    { user_id: '101', username: 'A', total_kills: 10, total_damage: 100, total_healing: 20, total_credits: 30 },
                    { user_id: '102', username: 'B', total_kills: 8, total_damage: 90, total_healing: 25, total_credits: 35 },
                  ],
                };
              }
              if (sql.includes('LIMIT ?') && sql.includes('JOIN war_member_stats wms ON wms.war_id = wh.war_id')) {
                return {
                  results: [
                    { war_id: '12', user_id: '101', username: 'A', kills: 5, damage: 50, healing: 10, credits: 15 },
                    { war_id: '11', user_id: '102', username: 'B', kills: 4, damage: 40, healing: 12, credits: 14 },
                  ],
                };
              }
              if (sql.includes('JOIN event_teams et')) {
                return {
                  results: [{ team_id: '1', team_name: 'Alpha', war_id: '12', war_date: '2026-01-01', member_count: 2 }],
                };
              }
              if (sql.includes('GROUP BY wh.result')) {
                return { results: [{ result: 'win', count: 2 }] };
              }
              return { results: [] };
            },
            first: async () => {
              if (sql.includes('COUNT(*) as total') && sql.includes('FROM war_member_stats')) {
                return { total: 3 };
              }
              if (sql.includes('COUNT(DISTINCT wh.war_id) as total')) {
                return { total: 2 };
              }
              return null;
            },
          };
        },
      })),
    };

    const response: any = await onRequestGet({
      env: { DB: db },
      request: new Request(
        'https://example.com/api/wars/analytics?warIds=11,12&userIds=101,102&limit=2&cursor=0&includePerWar=1'
      ),
    } as any);

    expect(response.perWarStats).toHaveLength(2);
    expect(response.meta).toEqual({
      nextCursor: '2',
      hasMore: true,
      totalWars: 2,
      totalRows: 3,
      samplingApplied: true,
      limit: 2,
      cursor: 0,
      normalizationApplied: false,
      normalizationFormulaVersion: null,
      normalizationWeights: { kda: 60, towers: 15, distance: 25 },
    });
    expect(perWarBindArgs[0].slice(-2)).toEqual([2, 0]);
  });

  it('supports skipping per-war rows for lightweight requests', async () => {
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: () => ({
          all: async () => {
            if (sql.includes('GROUP BY u.user_id')) return { results: [] };
            if (sql.includes('JOIN event_teams et')) return { results: [] };
            if (sql.includes('GROUP BY wh.result')) return { results: [] };
            return { results: [] };
          },
          first: async () => {
            if (sql.includes('COUNT(*) as total') && sql.includes('FROM war_member_stats')) return { total: 0 };
            if (sql.includes('COUNT(DISTINCT wh.war_id) as total')) return { total: 0 };
            return null;
          },
        }),
      })),
    };

    const response: any = await onRequestGet({
      env: { DB: db },
      request: new Request('https://example.com/api/wars/analytics?includePerWar=0'),
    } as any);

    expect(response.perWarStats).toEqual([]);
    expect(response.meta.hasMore).toBe(false);
    expect(response.meta.samplingApplied).toBe(false);
    expect(response.meta.normalizationApplied).toBe(false);
    expect(response.meta.normalizationFormulaVersion).toBe(null);
    expect(response.meta.normalizationWeights).toEqual({ kda: 60, towers: 15, distance: 25 });
  });

  it('applies opponent normalization when enabled', async () => {
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: () => ({
          all: async () => {
            if (sql.includes('COALESCE(wh.our_kills, 0) as our_kills')) {
              return {
                results: [
                  { war_id: '12', our_kills: 10, enemy_kills: 20, our_towers: 1, enemy_towers: 2, our_distance: 100, enemy_distance: 200 },
                  { war_id: '11', our_kills: 20, enemy_kills: 10, our_towers: 2, enemy_towers: 1, our_distance: 200, enemy_distance: 100 },
                ],
              };
            }
            if (sql.includes('GROUP BY u.user_id')) {
              return {
                results: [{ user_id: '101', username: 'A', total_kills: 10, total_damage: 100, total_healing: 20, total_credits: 30 }],
              };
            }
            if (sql.includes('LIMIT ?') && sql.includes('JOIN war_member_stats wms ON wms.war_id = wh.war_id')) {
              return {
                results: [
                  {
                    war_id: '12',
                    war_date: '2026-01-02',
                    title: 'War 12',
                    result: 'win',
                    user_id: '101',
                    username: 'A',
                    class: 'qiansi_lin',
                    kills: 10,
                    deaths: 2,
                    assists: 8,
                    damage: 100,
                    healing: 50,
                    building_damage: 20,
                    damage_taken: 30,
                    credits: 40,
                    kda: 9,
                    note: null,
                  },
                ],
              };
            }
            if (sql.includes('JOIN event_teams et')) return { results: [] };
            if (sql.includes('GROUP BY wh.result')) return { results: [{ result: 'win', count: 1 }] };
            return { results: [] };
          },
          first: async () => {
            if (sql.includes('COUNT(*) as total') && sql.includes('FROM war_member_stats')) return { total: 1 };
            if (sql.includes('COUNT(DISTINCT wh.war_id) as total')) return { total: 2 };
            return null;
          },
        }),
      })),
    };

    const response: any = await onRequestGet({
      env: { DB: db },
      request: new Request(
        'https://example.com/api/wars/analytics?mode=compare&includePerWar=1&opponentNormalized=1'
      ),
    } as any);

    expect(response.meta.normalizationApplied).toBe(true);
    expect(response.meta.normalizationFormulaVersion).toBe('kda:60|towers:15|distance:25');
    expect(response.perWarStats[0].normalization_factor).toBeDefined();
    expect(response.perWarStats[0].enemy_strength_tier).toBeDefined();
    expect(response.perWarStats[0].formula_version).toBe('kda:60|towers:15|distance:25');
    expect(response.perWarStats[0].raw_damage).toBe(100);
    expect(response.perWarStats[0].damage).not.toBe(100);
  });
});
