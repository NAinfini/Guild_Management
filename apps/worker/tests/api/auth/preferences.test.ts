import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/core/endpoint-factory', () => ({
  createEndpoint: ({ handler, parseQuery, parseBody }: any) => {
    return async (context: any) => {
      const query = parseQuery ? parseQuery(new URL(context.request.url).searchParams) : {};
      let body = null;

      if (parseBody) {
        const jsonBody = await context.request.clone().json().catch(() => ({}));
        body = parseBody(jsonBody);
      }

      return handler({
        env: context.env,
        params: context.params ?? {},
        request: context.request,
        query,
        body,
        user: context.user ?? null,
        session: null,
        isAuthenticated: !!context.user,
        isAdmin: context.user?.role === 'admin',
        isModerator: context.user?.role === 'moderator',
        waitUntil: context.waitUntil ?? (() => {}),
      });
    };
  },
}));

import { onRequestGet, onRequestPut } from '../../../src/api/auth/preferences';

describe('auth preferences endpoints', () => {
  it('upserts preferences for authenticated users', async () => {
    const db = {
      exec: vi.fn().mockResolvedValue(undefined),
      prepare: vi.fn(() => ({
        bind: () => ({ run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }) }),
      })),
    };

    const response: any = await onRequestPut({
      env: { DB: db },
      user: { user_id: 'u_1', role: 'member' },
      request: new Request('https://example.com/api/auth/preferences', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          theme: 'cyberpunk',
          color: 'neon-spectral',
          fontScale: 1.1,
          motionIntensity: 1.25,
        }),
      }),
    } as any);

    expect(db.exec).toHaveBeenCalled();
    expect(db.prepare).toHaveBeenCalled();
    expect(response.preferences).toMatchObject({
      theme: 'cyberpunk',
      color: 'neon-spectral',
      fontScale: 1.1,
      motionIntensity: 1.25,
    });
  });

  it('returns stored preferences when present', async () => {
    const db = {
      exec: vi.fn().mockResolvedValue(undefined),
      prepare: vi.fn(() => ({
        bind: () => ({
          first: vi.fn().mockResolvedValue({
            theme: 'royal',
            color: 'red-gold',
            font_scale: 1,
            motion_intensity: 0.8,
            updated_at_utc: '2026-02-12 12:00:00',
          }),
        }),
      })),
    };

    const response: any = await onRequestGet({
      env: { DB: db },
      user: { user_id: 'u_1', role: 'member' },
      request: new Request('https://example.com/api/auth/preferences'),
    } as any);

    expect(response.preferences).toEqual({
      theme: 'royal',
      color: 'red-gold',
      fontScale: 1,
      motionIntensity: 0.8,
      updatedAtUtc: '2026-02-12 12:00:00',
    });
  });
});
