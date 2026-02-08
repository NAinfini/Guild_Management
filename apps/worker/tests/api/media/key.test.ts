import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/core/endpoint-factory', () => ({
  createEndpoint: ({ handler }: any) => {
    return async (context: any) =>
      handler({
        env: context.env,
        params: context.params,
        request: context.request,
        query: {},
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

import { onRequestGet } from '../../../src/api/media/[key]';

describe('GET /api/media/[key]', () => {
  it('decodes encoded key before bucket lookup', async () => {
    const writeHttpMetadata = vi.fn((headers: Headers) => {
      headers.set('content-type', 'audio/ogg');
    });
    const bucketGet = vi.fn().mockResolvedValue({
      body: 'binary-body',
      httpEtag: '"etag-1"',
      writeHttpMetadata,
    });
    const encodedKey = encodeURIComponent('members/member-1/audio file.opus');

    const response = await onRequestGet({
      env: { BUCKET: { get: bucketGet } },
      params: { key: encodedKey },
      request: new Request(`https://example.com/api/media/${encodedKey}`),
      waitUntil: () => {},
    } as any);

    expect(bucketGet).toHaveBeenCalledWith('members/member-1/audio file.opus');
    expect(response.headers.get('content-type')).toBe('audio/ogg');
    expect(response.headers.get('etag')).toBe('"etag-1"');
  });
});
