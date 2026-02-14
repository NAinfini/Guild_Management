import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Event } from '@/types';
import { UpcomingEvents } from '@/features/Dashboard/components/UpcomingEvents';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: 'zh-CN',
        changeLanguage: vi.fn(),
      },
    }),
  };
});

vi.mock('@/store', () => ({
  useAuthStore: (selector: (state: { user: null }) => unknown) => selector({ user: null }),
}));

vi.mock('@/hooks/useServerState', () => ({
  useJoinEvent: () => ({ mutate: vi.fn() }),
  useLeaveEvent: () => ({ mutate: vi.fn() }),
}));

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: overrides.id ?? 'event-1',
    type: overrides.type ?? 'guild_war',
    title: overrides.title ?? 'War Event',
    description: overrides.description ?? 'desc',
    start_time: overrides.start_time ?? '2026-02-13T13:00:00.000Z',
    end_time: overrides.end_time ?? '2026-02-13T15:00:00.000Z',
    capacity: overrides.capacity ?? 10,
    participants: overrides.participants ?? [],
    is_locked: overrides.is_locked ?? false,
    is_pinned: overrides.is_pinned ?? false,
    is_archived: overrides.is_archived ?? false,
    updated_at: overrides.updated_at ?? '2026-02-13T10:00:00.000Z',
  };
}

describe('UpcomingEvents participant card layout', () => {
  it('renders class and power on a single second row', () => {
    const event = createEvent({
      participants: [
        {
          id: 'u-1',
          username: 'ans_admin_20260213',
          role: 'member',
          power: 120000,
          classes: ['mingjin_hong'],
          active_status: 'active',
        },
      ],
    });

    render(<UpcomingEvents events={[event]} />);

    expect(screen.getByText('ans_admin_20260213')).toBeInTheDocument();
    expect(screen.getByText('mingjin_hong / 120k')).toBeInTheDocument();
  });
});
