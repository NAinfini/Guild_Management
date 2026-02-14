import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarHistoryDetail } from '@/features/GuildWar/components/WarHistoryDetail';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

const authStoreMock = vi.fn();

vi.mock('@/store', () => ({
  useAuthStore: () => authStoreMock(),
}));

vi.mock('@/features/GuildWar/hooks/useWars', () => ({
  useUpdateWarStats: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useUpdateWarMemberStats: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    apiError: vi.fn(),
  },
}));

const war = {
  id: 'war_1',
  event_id: 'evt_1',
  date: '2026-02-03T15:00:00.000Z',
  title: 'Guild War - Feb 03',
  result: 'victory',
  own_stats: { kills: 16, towers: 8, base_hp: 90, credits: 19700, distance: 13100 },
  enemy_stats: { kills: 12, towers: 7, base_hp: 70, credits: 19100, distance: 12700 },
  teams_snapshot: [],
  pool_snapshot: [],
  member_stats: [
    {
      id: 'u1',
      username: 'Alpha',
      class: 'mingjin_hong',
      kills: 10,
      deaths: 5,
      assists: 13,
      damage: 173000,
      healing: 41000,
      building_damage: 26000,
      credits: 3400,
      damage_taken: 85000,
      note: '',
    },
  ],
  notes: 'Stable control and objective conversion.',
  updated_at: '2026-02-03T15:00:00.000Z',
} as any;

describe('WarHistoryDetail modal edit controls', () => {
  it('shows edit action for admin role', () => {
    authStoreMock.mockReturnValue({
      user: { role: 'admin' },
      viewRole: null,
    });

    render(<WarHistoryDetail war={war} open onClose={() => {}} />);

    expect(screen.getByRole('button', { name: 'common.edit' })).toBeInTheDocument();
  });

  it('hides edit action for member role', () => {
    authStoreMock.mockReturnValue({
      user: { role: 'member' },
      viewRole: null,
    });

    render(<WarHistoryDetail war={war} open onClose={() => {}} />);

    expect(screen.queryByRole('button', { name: 'common.edit' })).toBeNull();
  });
});
