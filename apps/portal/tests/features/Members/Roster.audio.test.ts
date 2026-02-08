import { describe, expect, it, vi } from 'vitest';
import { resolveRosterHoverAudioUrl } from '@/features/Members';

const baseMember = {
  id: 'member-1',
  username: 'Member One',
  role: 'member',
  power: 100,
  classes: [],
  active_status: 'active',
} as any;

describe('Roster hover audio resolution', () => {
  it('uses member.audio_url immediately without API fetch', async () => {
    const getMemberDetail = vi.fn();
    const cache = new Map<string, string | null>();
    const member = { ...baseMember, audio_url: '/api/media/direct.opus' };

    const resolved = await resolveRosterHoverAudioUrl(member, cache, getMemberDetail);

    expect(resolved).toBe('/api/media/direct.opus');
    expect(getMemberDetail).not.toHaveBeenCalled();
  });

  it('fetches and caches audio URL on first hover, then reuses cache', async () => {
    const getMemberDetail = vi.fn().mockResolvedValue({
      ...baseMember,
      media: [{ id: 'm1', type: 'audio', url: '/api/media/lazy.opus' }],
    });
    const cache = new Map<string, string | null>();

    const first = await resolveRosterHoverAudioUrl(baseMember, cache, getMemberDetail);
    const second = await resolveRosterHoverAudioUrl(baseMember, cache, getMemberDetail);

    expect(first).toBe('/api/media/lazy.opus');
    expect(second).toBe('/api/media/lazy.opus');
    expect(getMemberDetail).toHaveBeenCalledTimes(1);
  });

  it('caches null when fetch fails to avoid repeated failed requests', async () => {
    const getMemberDetail = vi.fn().mockRejectedValue(new Error('network'));
    const cache = new Map<string, string | null>();

    const first = await resolveRosterHoverAudioUrl(baseMember, cache, getMemberDetail);
    const second = await resolveRosterHoverAudioUrl(baseMember, cache, getMemberDetail);

    expect(first).toBeNull();
    expect(second).toBeNull();
    expect(getMemberDetail).toHaveBeenCalledTimes(1);
  });
});
