import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalyticsProvider, useAnalytics } from '@/features/GuildWar/components/WarAnalytics/AnalyticsContext';
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

const mockState = {
  wars: [] as any[],
  analyticsData: {
    memberStats: [],
    perWarStats: [],
    teamStats: [],
  } as any,
};

vi.mock('@/hooks', () => ({
  useWarsList: () => ({
    data: mockState.wars,
    isLoading: false,
  }),
  useAnalyticsData: () => ({
    data: mockState.analyticsData,
    isLoading: false,
  }),
  useWarHistoryDetail: () => ({
    data: null,
    isLoading: false,
  }),
}));

function AnalyticsFilterProbe() {
  const { filters, rankingsMode, updateFilters, updateRankingsMode } = useAnalytics();

  return (
    <div>
      <div data-testid="mode">{filters.mode}</div>
      <div data-testid="wars">{filters.selectedWars.join(',')}</div>
      <div data-testid="metric">{filters.primaryMetric}</div>
      <div data-testid="participation">{String(filters.participationOnly)}</div>
      <div data-testid="normalized">{String(filters.opponentNormalized)}</div>
      <div data-testid="topN">{String(rankingsMode.topN)}</div>
      <button
        type="button"
        onClick={() => {
          updateFilters({
            mode: 'rankings',
            selectedWars: [99],
            primaryMetric: 'kda',
            participationOnly: false,
          });
          updateRankingsMode({ topN: 20 });
        }}
      >
        apply
      </button>
    </div>
  );
}

describe('WarAnalytics deterministic filters', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    mockState.wars = [];
    mockState.analyticsData = {
      memberStats: [],
      perWarStats: [],
      teamStats: [],
    };
  });

  it('hydrates analytics filter state from URL and writes updates back to URL', async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      {},
      '',
      '/?aw_mode=rankings&aw_wars=101,102&aw_metric=healing&aw_participation=0&aw_norm=1&aw_top_n=50'
    );

    render(
      <AnalyticsProvider>
        <AnalyticsFilterProbe />
      </AnalyticsProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('rankings');
    expect(screen.getByTestId('wars')).toHaveTextContent('101,102');
    expect(screen.getByTestId('metric')).toHaveTextContent('healing');
    expect(screen.getByTestId('participation')).toHaveTextContent('false');
    expect(screen.getByTestId('normalized')).toHaveTextContent('true');
    expect(screen.getByTestId('topN')).toHaveTextContent('50');

    await user.click(screen.getByRole('button', { name: 'apply' }));

    expect(window.location.search).toContain('aw_mode=rankings');
    expect(window.location.search).toContain('aw_wars=99');
    expect(window.location.search).toContain('aw_metric=kda');
    expect(window.location.search).toContain('aw_participation=0');
    expect(window.location.search).toContain('aw_top_n=20');
  });

  it('shows no-wars-in-range empty state when date filter yields no wars', () => {
    mockState.wars = [];

    render(<WarAnalyticsMain canCopy={false} />);

    expect(screen.getByText('guild_war.analytics_empty_no_wars_in_range')).toBeInTheDocument();
  });

  it('shows no-wars-selected empty state when wars exist but none selected', () => {
    mockState.wars = [
      { war_id: 101, war_date: '2026-02-01', title: 'War A', result: 'win', missing_stats_count: 0 },
    ];

    render(<WarAnalyticsMain canCopy={false} />);

    expect(screen.getByText('guild_war.analytics_empty_no_wars_selected')).toBeInTheDocument();
  });

  it('shows no-matching-members state when wars are selected but member data is empty', () => {
    window.history.replaceState({}, '', '/?aw_wars=101');
    mockState.wars = [
      { war_id: 101, war_date: '2026-02-01', title: 'War A', result: 'win', missing_stats_count: 0 },
    ];
    mockState.analyticsData = {
      memberStats: [],
      perWarStats: [],
      teamStats: [],
    };

    render(<WarAnalyticsMain canCopy={false} />);

    expect(screen.getByText('guild_war.analytics_empty_no_matching_members')).toBeInTheDocument();
  });
});
