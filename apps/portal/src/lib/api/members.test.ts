import { describe, it, expect, beforeEach, vi } from 'vitest';

const { updateMock, getMock } = vi.hoisted(() => ({
  updateMock: vi.fn(),
  getMock: vi.fn(),
}));

vi.mock('./api-builder', () => ({
  typedAPI: {
    members: {
      update: updateMock,
      get: getMock,
    },
  },
}));

import { membersAPI } from './members';

describe('membersAPI.updateProfile', () => {
  beforeEach(() => {
    updateMock.mockReset();
    getMock.mockReset();
    getMock.mockResolvedValue({
      member: {
        user_id: 'user-1',
        username: 'TestUser',
        wechat_name: 'wx-old',
        role: 'member',
        power: 100,
        is_active: 1,
        title_html: null,
        classes: [],
        media_counts: { images: 0, videos: 0, audio: 0 },
        created_at_utc: '2026-01-01T00:00:00.000Z',
        updated_at_utc: '2026-01-01T00:00:00.000Z',
      },
    });
  });

  it('maps profile form fields to API payload fields', async () => {
    await membersAPI.updateProfile('user-1', {
      bio: '**markdown bio**',
      title_html: '<span>Title</span>',
      wechat_name: 'wx-new',
      power: 250,
    } as any);

    expect(updateMock).toHaveBeenCalledWith({
      params: { id: 'user-1' },
      body: expect.objectContaining({
        bio_text: '**markdown bio**',
        title_html: '<span>Title</span>',
        wechat_name: 'wx-new',
        power: 250,
      }),
    });
  });
});
