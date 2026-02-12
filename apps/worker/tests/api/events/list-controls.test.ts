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

import { onRequestGet } from '../../../src/api/events/index';

describe('GET /api/events list controls', () => {
  it('skips participants expansion when include=summary', async () => {
    const sqlCalls: string[] = [];

    const db = {
      prepare: vi.fn((sql: string) => {
        sqlCalls.push(sql);
        return {
          bind: () => ({
            all: async () => {
              if (sql.includes('FROM events')) {
                return {
                  results: [
                    {
                      event_id: 'evt_1',
                      type: 'guild_war',
                      title: 'War Event',
                      description: null,
                      start_at_utc: '2026-02-12 12:00:00',
                      end_at_utc: null,
                      capacity: 40,
                      is_pinned: 0,
                      is_archived: 0,
                      signup_locked: 0,
                      created_by: null,
                      updated_by: null,
                      created_at_utc: '2026-02-12 10:00:00',
                      updated_at_utc: '2026-02-12 10:00:00',
                      archived_at_utc: null,
                      deleted_at_utc: null,
                    },
                  ],
                };
              }
              return { results: [] };
            },
          }),
        };
      }),
    };

    const response: any = await onRequestGet({
      env: { DB: db },
      request: new Request('https://example.com/api/events?include=summary&limit=5'),
    } as any);

    expect(sqlCalls.some((sql) => sql.includes('FROM team_members'))).toBe(false);
    expect(response.items).toHaveLength(1);
    expect(response.items[0].participants).toBeUndefined();
  });

  it('uses explicit select fields instead of SELECT * in list mode', async () => {
    const sqlCalls: string[] = [];

    const db = {
      prepare: vi.fn((sql: string) => {
        sqlCalls.push(sql);
        return {
          bind: () => ({
            all: async () => ({
              results: [
                {
                  event_id: 'evt_1',
                  title: 'Minimal Event',
                  start_at_utc: '2026-02-12 12:00:00',
                },
              ],
            }),
          }),
        };
      }),
    };

    await onRequestGet({
      env: { DB: db },
      request: new Request(
        'https://example.com/api/events?include=summary&fields=event_id,title,start_at_utc&limit=5'
      ),
    } as any);

    const listSql = sqlCalls.find((sql) => sql.includes('FROM events')) || '';
    expect(listSql).toContain('SELECT');
    expect(listSql).not.toContain('SELECT * FROM');
  });
});
