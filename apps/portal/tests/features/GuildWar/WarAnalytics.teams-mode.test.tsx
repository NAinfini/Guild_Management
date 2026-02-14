import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      teamStats: [],
    },
    isLoading: false,
  }),
  useWarHistoryDetail: () => ({
    data: null,
    isLoading: false,
  }),
}));

describe('WarAnalytics teams mode', () => {
  it('does not show placeholder coming-soon copy', async () => {
    const user = userEvent.setup();
    render(<WarAnalyticsMain canCopy={false} />);

    await user.click(screen.getByRole('tab', { name: 'guild_war.analytics_mode_teams' }));

    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });
});
