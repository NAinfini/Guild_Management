import { describe, expect, it } from 'vitest';
import { parsePaginationQuery, encodeCursor } from '@guild/shared-utils/pagination';

describe('shared pagination parsing', () => {
  it('falls back to default limit for invalid numbers', () => {
    const parsed = parsePaginationQuery({ limit: 'NaN' });
    expect(parsed.limit).toBe(50);
  });

  it('clamps limits into the accepted range', () => {
    expect(parsePaginationQuery({ limit: '-10' }).limit).toBe(1);
    expect(parsePaginationQuery({ limit: '250' }).limit).toBe(100);
  });

  it('decodes cursor payloads for list queries', () => {
    const cursor = encodeCursor('2026-02-12 10:11:12', 'usr_1');
    const parsed = parsePaginationQuery({ limit: '20', cursor });

    expect(parsed.limit).toBe(20);
    expect(parsed.cursor).toEqual({
      timestamp: '2026-02-12 10:11:12',
      id: 'usr_1',
    });
  });
});
