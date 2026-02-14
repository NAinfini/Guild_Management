import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
        description: 'Mission',
        start_time: new Date().toISOString(),
        end_time: null,
        updated_at: new Date().toISOString(),
        is_archived: false,
        is_pinned: false,
        is_locked: false,
        participants: [],
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
  PageFilterBar: (props: any) => <div data-testid="page-filter-bar">{props.extraActions}</div>,
}));

import { Events } from '@/features/Events';

describe('Events create/edit controls', () => {
  it('opens event editor in create mode from top action button', async () => {
    const user = userEvent.setup();
    render(<Events />);

    await user.click(screen.getByTestId('event-create-button'));

    expect(screen.getByTestId('event-editor-dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.create' })).toBeInTheDocument();
  });

  it('opens event editor in edit mode from event card edit button', async () => {
    const user = userEvent.setup();
    render(<Events />);

    await user.click(screen.getByTestId('event-edit-button'));

    expect(screen.getByTestId('event-editor-dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.save' })).toBeInTheDocument();
  });
});

