import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

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

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', role: 'member' },
    viewRole: null,
  }),
  useUIStore: () => ({
    setPageTitle: vi.fn(),
    audioSettings: { mute: false, volume: 50 },
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
        username: 'PanelTarget',
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
  }),
}));

import { Roster } from '@/features/Members';

describe('Roster member detail panel', () => {
  it('opens as a modal overlay instead of a drawer', () => {
    render(<Roster />);

    fireEvent.click(screen.getByText('PanelTarget'));

    const panel = screen.getByTestId('roster-member-detail-panel');
    expect(panel).toBeInTheDocument();

    const modalSurface = panel.querySelector('.MuiDialog-paper');
    expect(modalSurface).not.toBeNull();
    expect(panel.querySelector('.MuiDrawer-paper')).toBeNull();
    expect(modalSurface?.className).toContain('w-[min(1800px,calc(100vw-1rem))]');
    expect(modalSurface?.className).not.toContain('MuiDialog-paperWidthSm');

    const contentLayout = panel.querySelector('div.relative.flex.h-full.w-full');
    expect(contentLayout).not.toBeNull();
    expect(contentLayout?.className).not.toContain('lg:flex-row');
  });
});
