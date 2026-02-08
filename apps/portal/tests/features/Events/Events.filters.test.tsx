import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { getEventFilterCategories, isArchivedEventFilter } from '@/features/Events';

const captured = vi.hoisted(() => ({
  pageFilterProps: null as any,
}));

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
  useEvents: () => ({ data: [], isLoading: false }),
  useMembers: () => ({ data: [], isLoading: false }),
  useJoinEvent: () => ({ mutateAsync: vi.fn() }),
  useLeaveEvent: () => ({ mutateAsync: vi.fn() }),
  useArchiveEvent: () => ({ mutateAsync: vi.fn() }),
  useTogglePinEvent: () => ({ mutateAsync: vi.fn() }),
  useToggleLockEvent: () => ({ mutateAsync: vi.fn() }),
  useDeleteEvent: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/components/PageFilterBar', () => ({
  PageFilterBar: (props: any) => {
    captured.pageFilterProps = props;
    return <div data-testid="page-filter-bar">{props.extraActions}</div>;
  },
}));

import { Events } from '@/features/Events';

describe('Events filters', () => {
  it('treats archived as history filter', () => {
    expect(isArchivedEventFilter('archived')).toBe(true);
    expect(isArchivedEventFilter('all')).toBe(false);
  });

  it('includes history as a chip category in page filters', () => {
    render(<Events />);

    expect(captured.pageFilterProps.categories.some((item: any) => item.value === 'archived')).toBe(true);
    const labels = getEventFilterCategories((key) => key).map((item) => item.label);
    expect(labels).toContain('events.filter_archived');
  });
});
