import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarAnalyticsMain } from '@/features/GuildWar/components/WarAnalytics/WarAnalyticsMain';

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
  useWarsList: () => ({
    data: [
      { war_id: 101, war_date: '2026-01-01', title: 'War A', result: 'win', missing_stats_count: 0 },
      { war_id: 102, war_date: '2026-01-08', title: 'War B', result: 'loss', missing_stats_count: 0 },
    ],
    isLoading: false,
  }),
  useAnalyticsData: () => ({
    data: {
      memberStats: [],
      perWarStats: [],
    },
    isLoading: false,
  }),
}));

describe('WarAnalyticsMain modes', () => {
  it('shows only Compare, Rankings, and Teams tabs', () => {
    render(<WarAnalyticsMain canCopy={false} />);

    expect(screen.getByText(/^Compare$/)).toBeInTheDocument();
    expect(screen.getByText(/^Rankings$/)).toBeInTheDocument();
    expect(screen.getByText(/^Teams$/)).toBeInTheDocument();
    expect(screen.queryByText(/^Player$/)).not.toBeInTheDocument();
  });
});
