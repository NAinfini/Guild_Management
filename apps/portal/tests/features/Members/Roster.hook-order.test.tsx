import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

const setPageTitle = vi.fn();
const setAudioSettings = vi.fn();

let membersState: { isLoading: boolean; data: any[] } = {
  isLoading: true,
  data: [],
};

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', role: 'member' },
    viewRole: null,
  }),
  useUIStore: () => ({
    setPageTitle,
    audioSettings: { mute: false, volume: 50 },
    setAudioSettings,
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
  useMembers: () => membersState,
}));

import { Roster } from '@/features/Members';

describe('Roster hook order', () => {
  it('keeps hook order stable when transitioning from loading to loaded', () => {
    membersState = { isLoading: true, data: [] };

    const { rerender } = render(<Roster />);
    expect(setPageTitle).toHaveBeenCalled();

    membersState = {
      isLoading: false,
      data: [
        {
          id: 'm1',
          username: 'HookSafeMember',
          role: 'member',
          power: 1000,
          classes: ['mingjin_hong'],
          active_status: 'active',
          last_seen: new Date().toISOString(),
          media_counts: { images: 0, videos: 0 },
          media: [],
          bio: '',
        },
      ],
    };

    expect(() => rerender(<Roster />)).not.toThrow();
    expect(screen.getByText('HookSafeMember')).toBeInTheDocument();
  });
});
