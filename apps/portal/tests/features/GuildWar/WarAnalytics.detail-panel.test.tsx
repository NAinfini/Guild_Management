import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarDetailSidePanel } from '@/features/GuildWar/components/WarAnalytics/WarDetailSidePanel';

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
        {
          id: '1',
          username: 'Alpha',
          class: 'qiansi_lin',
          kills: 10,
          deaths: 2,
          assists: 9,
          damage: 105000,
          healing: 6200,
          building_damage: 2500,
          credits: 520,
          damage_taken: 39000,
        },
      ],
      notes: 'Mock note',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    isLoading: false,
  }),
}));

describe('WarDetailSidePanel', () => {
  it('renders detail content and team snapshot empty-state', () => {
    render(<WarDetailSidePanel open warId="101" onClose={() => {}} />);

    expect(screen.getByText('common.details')).toBeInTheDocument();
    expect(screen.getByText('War A')).toBeInTheDocument();
    expect(screen.getByText('guild_war.history_no_team_snapshot')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });
});

