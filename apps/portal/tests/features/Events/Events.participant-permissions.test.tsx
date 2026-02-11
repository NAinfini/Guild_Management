import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, within } from '@testing-library/react';

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', role: 'member' },
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
            power: 1234,
            classes: ['warrior'],
          },
        ],
      },
    ],
    isLoading: false,
  }),
  useMembers: () => ({ data: [], isLoading: false }),
  useJoinEvent: () => ({ mutateAsync: vi.fn() }),
  useLeaveEvent: () => ({ mutateAsync: vi.fn() }),
  useArchiveEvent: () => ({ mutateAsync: vi.fn() }),
  useTogglePinEvent: () => ({ mutateAsync: vi.fn() }),
  useToggleLockEvent: () => ({ mutateAsync: vi.fn() }),
  useDeleteEvent: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/components/PageFilterBar', () => ({
  PageFilterBar: () => <div data-testid="page-filter-bar" />,
}));

import { Events } from '@/features/Events';

describe('Events participant permissions', () => {
  it('hides kick controls for non-moderator roles', () => {
    const { getByTestId } = render(<Events />);

    const grid = getByTestId('participant-grid');
    const buttons = within(grid).queryAllByRole('button');

    expect(buttons).toHaveLength(0);
  });
});
