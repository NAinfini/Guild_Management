import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
    data: [
      { war_id: 101, war_date: '2026-01-01', title: 'War A', result: 'win', missing_stats_count: 0 },
      { war_id: 102, war_date: '2026-01-08', title: 'War B', result: 'loss', missing_stats_count: 0 },
    ],
    isLoading: false,
  }),
  useAnalyticsData: () => ({
    data: {
      memberStats: [
        {
          user_id: 1,
          username: 'Alpha',
          class: 'qiansilin',
          wars_participated: 2,
          total_damage: 220000,
          total_healing: 12000,
          total_building_damage: 5000,
          total_credits: 1000,
          total_kills: 20,
          total_deaths: 4,
          total_assists: 18,
          total_damage_taken: 80000,
          avg_damage: 110000,
          avg_healing: 6000,
          avg_building_damage: 2500,
          avg_credits: 500,
          avg_kills: 10,
          avg_deaths: 2,
          avg_assists: 9,
          avg_damage_taken: 40000,
          kda_ratio: 9.5,
        },
        {
          user_id: 2,
          username: 'Bravo',
          class: 'lieshiwei',
          wars_participated: 2,
          total_damage: 200000,
          total_healing: 10000,
          total_building_damage: 4200,
          total_credits: 980,
          total_kills: 17,
          total_deaths: 6,
          total_assists: 15,
          total_damage_taken: 90000,
          avg_damage: 100000,
          avg_healing: 5000,
          avg_building_damage: 2100,
          avg_credits: 490,
          avg_kills: 8.5,
          avg_deaths: 3,
          avg_assists: 7.5,
          avg_damage_taken: 45000,
          kda_ratio: 5.4,
        },
      ],
      perWarStats: [
        {
          war_id: 101,
          war_date: '2026-01-01',
          user_id: 1,
          username: 'Alpha',
          class: 'qiansilin',
          kills: 10,
          deaths: 2,
          assists: 9,
          damage: 105000,
          healing: 6200,
          building_damage: 2500,
          credits: 520,
          damage_taken: 39000,
          kda: 9.5,
        },
        {
          war_id: 102,
          war_date: '2026-01-08',
          user_id: 1,
          username: 'Alpha',
          class: 'qiansilin',
          kills: 10,
          deaths: 2,
          assists: 9,
          damage: 115000,
          healing: 5800,
          building_damage: 2500,
          credits: 480,
          damage_taken: 41000,
          kda: 9.5,
        },
        {
          war_id: 101,
          war_date: '2026-01-01',
          user_id: 2,
          username: 'Bravo',
          class: 'lieshiwei',
          kills: 8,
          deaths: 3,
          assists: 8,
          damage: 98000,
          healing: 4700,
          building_damage: 2100,
          credits: 470,
          damage_taken: 46000,
          kda: 5.3,
        },
        {
          war_id: 102,
          war_date: '2026-01-08',
          user_id: 2,
          username: 'Bravo',
          class: 'lieshiwei',
          kills: 9,
          deaths: 3,
          assists: 7,
          damage: 102000,
          healing: 5300,
          building_damage: 2100,
          credits: 510,
          damage_taken: 44000,
          kda: 5.3,
        },
      ],
      teamStats: [],
    },
    isLoading: false,
  }),
  useWarHistoryDetail: () => ({
    data: {
      id: '101',
      event_id: 'evt_1',
      date: '2026-01-01T00:00:00.000Z',
      title: 'War A',
      result: 'victory',
      own_stats: { kills: 10, towers: 2, base_hp: 80, credits: 1000, distance: 1200 },
      enemy_stats: { kills: 8, towers: 1, base_hp: 70, credits: 900, distance: 1100 },
      teams_snapshot: [],
      pool_snapshot: [],
      member_stats: [
        { id: '1', username: 'Alpha', class: 'qiansi_lin', kills: 10, deaths: 2, assists: 9, damage: 105000, healing: 6200, building_damage: 2500, credits: 520, damage_taken: 39000 },
      ],
      notes: 'Mock note',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    isLoading: false,
  }),
}));

describe('WarAnalyticsMain modes', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('shows only Compare, Rankings, and Teams tabs', () => {
    render(<WarAnalyticsMain canCopy={false} />);

    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_compare' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_rankings' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_teams' })).toBeInTheDocument();
    expect(screen.queryByText(/^Player$/)).not.toBeInTheDocument();
  });

  it('uses timeline chart when exactly one member is selected', async () => {
    const user = userEvent.setup();
    render(<WarAnalyticsMain canCopy={false} />);

    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_select_wars' }));
    await user.click(screen.getByRole('button', { name: 'common.all' }));
    await user.click(screen.getByText('Alpha'));

    expect(screen.getByText('guild_war.analytics_multi_metric_hint')).toBeInTheDocument();
  });

  it('uses compare trend chart when two members are selected', async () => {
    const user = userEvent.setup();
    render(<WarAnalyticsMain canCopy={false} />);

    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_select_wars' }));
    await user.click(screen.getByRole('button', { name: 'common.all' }));
    await user.click(screen.getByText('Alpha'));
    await user.click(screen.getByText('Bravo'));

    expect(screen.getByText('guild_war.analytics_compare_chart_hint')).toBeInTheDocument();
  });

});
