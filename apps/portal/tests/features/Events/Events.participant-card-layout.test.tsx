import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', role: 'moderator' },
    viewRole: null,
  }),
  useUIStore: () => ({
    timezoneOffset: 0,
    setPageTitle: vi.fn(),
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

vi.mock('@/hooks', () => ({
  useMobileOptimizations: () => ({ isMobile: false }),
  useOnline: () => true,
}));

vi.mock('@/hooks/useServerState', () => ({
  useEvents: () => ({
    data: [
      {
        id: 'evt_1',
        type: 'weekly_mission',
        title: 'Weekly Mission Alpha',
        description: '',
        start_time: new Date().toISOString(),
        end_time: null,
        updated_at: new Date().toISOString(),
        is_archived: false,
        is_pinned: false,
        is_locked: false,
        participants: [
          {
            id: 'u2',
            username: 'MemberTwo',
            power: 37000,
            classes: ['mingjin_hong'],
          },
        ],
      },
    ],
    isLoading: false,
  }),
  useMembers: () => ({ data: [], isLoading: false }),
  useCreateEvent: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateEvent: () => ({ mutate: vi.fn(), isPending: false }),
  useJoinEvent: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
  useLeaveEvent: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
  useArchiveEvent: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
  useTogglePinEvent: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
  useToggleLockEvent: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
  useDeleteEvent: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
}));

vi.mock('@/components/PageFilterBar', () => ({
  PageFilterBar: () => <div data-testid="page-filter-bar" />,
}));

import { Events } from '@/features/Events';

describe('Events participant card layout', () => {
  it('keeps kick action separate from the class/power row to avoid overlap', () => {
    render(<Events />);

    const card = screen.getByTestId('participant-card-u2');
    const metaRow = within(card).getByTestId('participant-meta-u2');
    const kickButton = within(card).getByTestId('participant-kick-u2');

    expect(kickButton).toBeInTheDocument();
    expect(within(metaRow).queryByTestId('participant-kick-u2')).not.toBeInTheDocument();
  });
});
