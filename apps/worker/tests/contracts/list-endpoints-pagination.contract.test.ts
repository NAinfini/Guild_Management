import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/core/endpoint-factory', () => ({
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

import { onRequestGet as onMembersGet } from '../../src/api/members/index';
import { onRequestGet as onEventsGet } from '../../src/api/events/index';
import { onRequestGet as onAnnouncementsGet } from '../../src/api/announcements/index';

function buildCaptureDb(sqlCalls: string[]) {
  return {
    prepare: vi.fn((sql: string) => {
      sqlCalls.push(sql);
      return {
        bind: () => ({
          all: async () => ({ results: [] }),
        }),
      };
    }),
  };
}

describe('list endpoint pagination contracts', () => {
  it('keeps deterministic ORDER BY clauses with timestamp + id tie-breakers', async () => {
    const memberSqlCalls: string[] = [];
    const eventSqlCalls: string[] = [];
    const announcementSqlCalls: string[] = [];

    await onMembersGet({
      env: { DB: buildCaptureDb(memberSqlCalls) },
      request: new Request('https://example.com/api/members?limit=5'),
    } as any);

    await onEventsGet({
      env: { DB: buildCaptureDb(eventSqlCalls) },
      request: new Request('https://example.com/api/events?limit=5'),
    } as any);

    await onAnnouncementsGet({
      env: { DB: buildCaptureDb(announcementSqlCalls) },
      request: new Request('https://example.com/api/announcements?limit=5'),
    } as any);

    expect(memberSqlCalls.join('\n')).toContain('ORDER BY u.created_at_utc DESC, u.user_id DESC');
    expect(eventSqlCalls.join('\n')).toContain('ORDER BY start_at_utc DESC, event_id DESC');
    expect(announcementSqlCalls.join('\n')).toContain('ORDER BY is_pinned DESC, created_at_utc DESC, announcement_id DESC');
  });
});
