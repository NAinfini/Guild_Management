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

import { onRequestGet } from '../../../src/api/members/index';

describe('GET /api/members pagination contracts', () => {
  it('uses safe default limit when query limit is invalid', async () => {
    const sqlCalls: string[] = [];
    const bindCalls: any[][] = [];

    const db = {
      prepare: vi.fn((sql: string) => {
        sqlCalls.push(sql);
        return {
          bind: (...args: any[]) => {
            bindCalls.push(args);
            return {
              all: async () => ({
                results: [
                  {
                    user_id: 'u_1',
                    username: 'Alpha',
                    wechat_name: null,
                    role: 'member',
                    power: 100,
                    is_active: 1,
                    title_html: null,
                    classes_csv: 'mingjin',
                    media_count: 2,
                    created_at_utc: '2026-02-12 12:00:00',
                    updated_at_utc: '2026-02-12 12:00:00',
                  },
                ],
              }),
            };
          },
        };
      }),
    };

    const response: any = await onRequestGet({
      env: { DB: db },
      request: new Request('https://example.com/api/members?limit=abc'),
    } as any);

    const listQuerySql = sqlCalls.find((sql) => sql.includes('FROM users u'));
    expect(listQuerySql).toBeTruthy();
    expect(listQuerySql).not.toContain('LIMIT NaN');

    const listBind = bindCalls.find((args) => args[args.length - 1] === 51);
    expect(listBind).toBeTruthy();

    expect(response.pagination.limit).toBe(50);
    expect(response.pagination.hasMore).toBe(false);
  });

  it('keeps cursor generation stable even when sparse fields are requested', async () => {
    const db = {
      prepare: vi.fn(() => ({
        bind: () => ({
          all: async () => ({
            results: [
              {
                user_id: 'u_2',
                username: 'Bravo',
                wechat_name: null,
                role: 'member',
                power: 120,
                is_active: 1,
                title_html: null,
                classes_csv: 'qiansi',
                media_count: 1,
                created_at_utc: '2026-02-12 11:00:00',
                updated_at_utc: '2026-02-12 11:00:00',
              },
              {
                user_id: 'u_1',
                username: 'Alpha',
                wechat_name: null,
                role: 'member',
                power: 100,
                is_active: 1,
                title_html: null,
                classes_csv: 'mingjin',
                media_count: 2,
                created_at_utc: '2026-02-12 10:00:00',
                updated_at_utc: '2026-02-12 10:00:00',
              },
            ],
          }),
        }),
      })),
    };

    const response: any = await onRequestGet({
      env: { DB: db },
      request: new Request('https://example.com/api/members?limit=1&fields=username'),
    } as any);

    expect(response.items).toEqual([{ username: 'Bravo' }]);
    expect(response.pagination.hasMore).toBe(true);
    expect(typeof response.pagination.nextCursor).toBe('string');
    expect(response.pagination.nextCursor.length).toBeGreaterThan(0);
  });
});
