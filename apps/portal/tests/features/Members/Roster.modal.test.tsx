import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', role: 'member' },
    viewRole: null,
  }),
  useUIStore: () => ({
    setPageTitle: vi.fn(),
    audioSettings: { mute: true, volume: 50 },
    setAudioSettings: vi.fn(),
  }),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock('@/hooks/useServerState', () => ({
  useMembers: () => ({
    isLoading: false,
    data: [
      {
        id: 'm1',
        username: 'NoMediaMember',
        role: 'member',
        power: 1000,
        classes: ['mingjin_hong'],
        active_status: 'active',
        last_seen: new Date().toISOString(),
        media_counts: { images: 0, videos: 0 },
        media: [],
      },
    ],
  }),
}));

import { Roster } from '@/features/Members';

describe('Roster member details modal', () => {
  it('opens member detail dialog when clicking member card even without media', () => {
    render(<Roster />);

    fireEvent.click(screen.getByText('NoMediaMember'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
