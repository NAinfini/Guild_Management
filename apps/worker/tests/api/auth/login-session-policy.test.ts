import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/core/endpoint-factory', () => ({
  createEndpoint: ({ handler, parseBody }: any) => {
    return async (context: any) => {
      const jsonBody = await context.request.clone().json().catch(() => ({}));
      const body = parseBody ? parseBody(jsonBody) : jsonBody;
      return handler({
        env: context.env,
        request: context.request,
        body,
        params: context.params ?? {},
      });
    };
  },
}));

import { onRequestPost } from '../../../src/api/auth/login';

type InsertCapture = {
  values?: unknown[];
};

function createLoginDb(capture: InsertCapture) {
  return {
    prepare: vi.fn((sql: string) => {
      if (sql.includes('SELECT * FROM users')) {
        return {
          bind: () => ({
            first: vi.fn().mockResolvedValue({
              user_id: 'u_1',
              username: 'tester',
              wechat_name: null,
              role: 'member',
              power: 1000,
              is_active: 1,
            }),
          }),
        };
      }

      if (sql.includes('SELECT password_hash, salt FROM user_auth_password')) {
        return {
          bind: () => ({
            first: vi.fn().mockResolvedValue({
              password_hash: 'secret123',
              salt: '',
            }),
          }),
        };
      }

      if (sql.includes('INSERT INTO sessions')) {
        return {
          bind: (...values: unknown[]) => {
            capture.values = values;
            return {
              run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            };
          },
        };
      }

      return {
        bind: () => ({
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
        }),
      };
    }),
  };
}

function parseSqlDate(value: unknown): Date {
  const text = String(value);
  return new Date(text.replace(' ', 'T') + 'Z');
}

describe('auth login session policy', () => {
  it('uses 30-day persistent cookie when rememberMe=true', async () => {
    const capture: InsertCapture = {};
    const db = createLoginDb(capture);

    const response = await onRequestPost({
      env: { DB: db },
      request: new Request('https://example.com/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'tester',
          password: 'secret123',
          rememberMe: true,
        }),
      }),
    } as any);

    const setCookie = response.headers.get('set-cookie') || '';
    expect(setCookie).toContain('Max-Age=2592000');

    expect(capture.values).toBeDefined();
    const expiresAt = parseSqlDate(capture.values?.[4]);
    const hours = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
    expect(hours).toBeGreaterThan(24 * 29);
    expect(hours).toBeLessThan(24 * 31);
  });

  it('uses 2-hour non-persistent cookie when rememberMe=false', async () => {
    const capture: InsertCapture = {};
    const db = createLoginDb(capture);

    const response = await onRequestPost({
      env: { DB: db },
      request: new Request('https://example.com/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'tester',
          password: 'secret123',
          rememberMe: false,
        }),
      }),
    } as any);

    const setCookie = response.headers.get('set-cookie') || '';
    expect(setCookie).not.toContain('Max-Age=');

    expect(capture.values).toBeDefined();
    const expiresAt = parseSqlDate(capture.values?.[4]);
    const hours = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
    expect(hours).toBeGreaterThan(1.7);
    expect(hours).toBeLessThan(2.3);
  });
});

