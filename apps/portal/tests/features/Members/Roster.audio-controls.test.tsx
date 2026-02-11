import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

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

describe('Roster audio controls', () => {
  it('renders the volume slider to the left of the mute toggle', () => {
    render(<Roster />);

    const controls = screen.getByTestId('roster-audio-controls');
    const slider = within(controls).getByLabelText('roster.audio_volume');
    const muteButton = within(controls).getByRole('button', { name: 'roster.audio_mute' });
    const divider = within(controls).getByTestId('roster-audio-divider');

    expect(slider).toBeInTheDocument();
    expect(muteButton).toBeInTheDocument();
    expect(divider).toBeInTheDocument();

    const follows = slider.compareDocumentPosition(muteButton) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(follows).toBeTruthy();
    expect(controls.className).toContain('gap-4');
  });
});
