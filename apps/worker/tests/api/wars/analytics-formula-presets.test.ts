import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/core/endpoint-factory', () => ({
  createEndpoint: ({ handler, parseQuery, parseBody }: any) => {
    return async (context: any) => {
      let body = null;
      if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
        const raw = await context.request.json().catch(() => null);
        body = parseBody ? parseBody(raw) : raw;
      }

      return handler({
        env: context.env,
        params: context.params ?? {},
        request: context.request,
        query: parseQuery ? parseQuery(new URL(context.request.url).searchParams) : {},
        body,
        user: context.user ?? null,
        session: context.session ?? null,
        isAuthenticated: !!context.user,
        isAdmin: context.isAdmin ?? false,
        isModerator: context.isModerator ?? false,
        waitUntil: context.waitUntil ?? (() => {}),
      });
    };
  },
}));

import {
  onRequestDelete,
  onRequestGet,
  onRequestPost,
} from '../../../src/api/wars/analytics-formula-presets';

describe('wars analytics formula presets API', () => {
  it('returns default preset when table has no rows', async () => {
    const db = {
      exec: vi.fn(async () => ({})),
      prepare: vi.fn(() => ({
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({}),
        bind: () => ({
          all: async () => ({ results: [] }),
          first: async () => null,
          run: async () => ({}),
        }),
      })),
    };

    const response: any = await onRequestGet({
      env: { DB: db },
      request: new Request('https://example.com/api/wars/analytics-formula-presets'),
    } as any);

    expect(response.presets).toHaveLength(1);
    expect(response.presets[0]).toMatchObject({
      preset_id: 'default',
      name: 'Default',
      is_default: 1,
      kda_weight: 60,
      tower_weight: 15,
      distance_weight: 25,
    });
  });

  it('creates a new preset with incremented version', async () => {
    const db = {
      exec: vi.fn(async () => ({})),
      prepare: vi.fn((sql: string) => {
        if (sql.includes('COALESCE(MAX(version), 0)')) {
          return {
            first: async () => ({ max_version: 4 }),
            bind: () => ({ first: async () => ({ max_version: 4 }), run: async () => ({}) }),
            run: async () => ({}),
            all: async () => ({ results: [] }),
          };
        }
        if (sql.includes('WHERE is_default = 1 LIMIT 1')) {
          return {
            first: async () => ({ preset_id: 'existing_default' }),
            bind: () => ({ first: async () => ({ preset_id: 'existing_default' }), run: async () => ({}) }),
            run: async () => ({}),
            all: async () => ({ results: [] }),
          };
        }
        return {
          first: async () => null,
          all: async () => ({ results: [] }),
          run: async () => ({}),
          bind: () => ({
            first: async () => null,
            all: async () => ({ results: [] }),
            run: async () => ({}),
          }),
        };
      }),
    };

    const response: any = await onRequestPost({
      env: { DB: db },
      user: { user_id: 'u_admin' },
      request: new Request('https://example.com/api/wars/analytics-formula-presets', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Aggressive',
          kdaWeight: 70,
          towerWeight: 10,
          distanceWeight: 20,
          isDefault: 0,
        }),
      }),
    } as any);

    expect(response.preset.name).toBe('Aggressive');
    expect(response.preset.version).toBe(5);
    expect(response.preset.kda_weight).toBe(70);
    expect(response.preset.tower_weight).toBe(10);
    expect(response.preset.distance_weight).toBe(20);
  });

  it('rejects deleting the default preset', async () => {
    const db = {
      exec: vi.fn(async () => ({})),
      prepare: vi.fn((sql: string) => {
        if (sql.includes('FROM analytics_formula_presets') && sql.includes('WHERE preset_id = ?')) {
          return {
            bind: () => ({
              first: async () => ({ preset_id: 'default', name: 'Default', is_default: 1 }),
              run: async () => ({}),
              all: async () => ({ results: [] }),
            }),
            first: async (): Promise<null> => null,
            run: async () => ({}),
            all: async () => ({ results: [] }),
          };
        }
        return {
          bind: () => ({
            first: async () => null,
            run: async () => ({}),
            all: async () => ({ results: [] }),
          }),
          first: async (): Promise<null> => null,
          run: async () => ({}),
          all: async () => ({ results: [] }),
        };
      }),
    };

    await expect(
      onRequestDelete({
        env: { DB: db },
        user: { user_id: 'u_admin' },
        request: new Request('https://example.com/api/wars/analytics-formula-presets?id=default', {
          method: 'DELETE',
        }),
      } as any)
    ).rejects.toThrow('Cannot delete default preset');
  });
});
