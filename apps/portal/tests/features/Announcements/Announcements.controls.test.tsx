import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const captured = vi.hoisted(() => ({
  pageFilterProps: null as any,
}));

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', role: 'admin' },
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

vi.mock('@/hooks/useOnline', () => ({
  useOnline: () => true,
}));

vi.mock('@/hooks/useLastSeen', () => ({
  useLastSeen: () => ({
    markAsSeen: vi.fn(),
    hasNewContent: () => false,
  }),
}));

vi.mock('@/hooks/useServerState', () => ({
  useAnnouncements: () => ({ data: [], isLoading: false }),
  useCreateAnnouncement: () => ({ mutateAsync: vi.fn() }),
  useUpdateAnnouncement: () => ({ mutateAsync: vi.fn() }),
  useDeleteAnnouncement: () => ({ mutateAsync: vi.fn() }),
  useTogglePinAnnouncement: () => ({ mutateAsync: vi.fn() }),
  useArchiveAnnouncement: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/components/PageFilterBar', () => ({
  PageFilterBar: (props: any) => {
    captured.pageFilterProps = props;
    return <div data-testid="page-filter-bar">{props.extraActions}</div>;
  },
}));

import { Announcements } from '@/features/Announcements';

describe('Announcements controls', () => {
  it('does not render mark-all-read action and keeps admin create action', () => {
    render(<Announcements />);

    expect(screen.getByText('announcements.new_broadcast')).toBeInTheDocument();
    expect(screen.queryByText('dashboard.mark_all_read')).not.toBeInTheDocument();
    expect(captured.pageFilterProps.categories.some((item: any) => item.value === 'archived')).toBe(true);
  });
});
