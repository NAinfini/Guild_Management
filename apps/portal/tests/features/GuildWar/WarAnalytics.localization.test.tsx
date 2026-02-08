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
    data: [{ war_id: 101, war_date: '2026-01-01', title: 'War A', result: 'win', missing_stats_count: 0 }],
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

describe('WarAnalytics localization', () => {
  it('does not leak inline English in filter controls', () => {
    render(<WarAnalyticsMain canCopy={false} />);

    expect(screen.queryByText('Select wars')).not.toBeInTheDocument();
    expect(screen.queryByText('Participated')).not.toBeInTheDocument();
    expect(screen.queryByText('Search wars...')).not.toBeInTheDocument();
  });
});

