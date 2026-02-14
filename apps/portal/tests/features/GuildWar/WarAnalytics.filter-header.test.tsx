import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalyticsProvider, useAnalytics } from '@/features/GuildWar/components/WarAnalytics/AnalyticsContext';
import { FilterBar } from '@/features/GuildWar/components/WarAnalytics/FilterBar';

const mockAuthState = {
  user: { id: 'u1', role: 'member', username: 'tester' },
  viewRole: null,
};

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, opts?: Record<string, unknown>) => {
        if (opts && typeof opts.count !== 'undefined') {
          return `${key}:${opts.count}`;
        }
        return key;
      },
    }),
  };
});

vi.mock('@/store', () => ({
  useAuthStore: () => mockAuthState,
}));

function NormalizationWeightProbe() {
  const { filters } = useAnalytics();
  return (
    <div data-testid="normalization-weights">
      {`${filters.normalizationWeights.kda},${filters.normalizationWeights.towers},${filters.normalizationWeights.distance}`}
    </div>
  );
}

const wars = [
  {
    war_id: 1,
    title: 'War One',
    war_date: '2026-02-01',
    result: 'win',
    our_kills: 10,
    enemy_kills: 8,
    our_towers: 2,
    enemy_towers: 1,
    participant_count: 10,
    missing_stats_count: 0,
  },
] as any;

describe('WarAnalytics FilterBar', () => {
  beforeEach(() => {
    mockAuthState.user = { id: 'u1', role: 'member', username: 'tester' } as any;
    mockAuthState.viewRole = null;
  });

  it('renders unified analytics header controls with mode tabs and metric filter', () => {
    render(
      <AnalyticsProvider>
        <FilterBar wars={wars} />
      </AnalyticsProvider>,
    );

    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_compare' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_rankings' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_teams' })).toBeInTheDocument();
    expect(screen.getByText('guild_war.analytics_select_wars')).toBeInTheDocument();
  });

  it('hides formula editor action for non-admin users', () => {
    render(
      <AnalyticsProvider>
        <FilterBar wars={wars} />
      </AnalyticsProvider>,
    );

    expect(screen.queryByRole('button', { name: 'guild_war.analytics_formula_editor_title' })).not.toBeInTheDocument();
  });

  it('lets admins update normalization weights in-session and closes the dialog on save', async () => {
    const user = userEvent.setup();
    mockAuthState.user = { id: 'admin-1', role: 'admin', username: 'admin' } as any;

    render(
      <AnalyticsProvider>
        <FilterBar wars={wars} />
        <NormalizationWeightProbe />
      </AnalyticsProvider>,
    );

    expect(screen.getByTestId('normalization-weights')).toHaveTextContent('60,15,25');

    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_formula_editor_title' }));
    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '70');
    await user.clear(inputs[1]);
    await user.type(inputs[1], '10');
    await user.clear(inputs[2]);
    await user.type(inputs[2], '20');
    await user.click(screen.getByRole('button', { name: 'common.save' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByTestId('normalization-weights')).toHaveTextContent('70,10,20');
  });

  it('reopens formula editor with default values each time', async () => {
    const user = userEvent.setup();
    mockAuthState.user = { id: 'admin-1', role: 'admin', username: 'admin' } as any;

    render(
      <AnalyticsProvider>
        <FilterBar wars={wars} />
      </AnalyticsProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_formula_editor_title' }));
    let inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '70');
    await user.clear(inputs[1]);
    await user.type(inputs[1], '10');
    await user.clear(inputs[2]);
    await user.type(inputs[2], '20');
    await user.click(screen.getByRole('button', { name: 'common.save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_formula_editor_title' }));
    inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(60);
    expect(inputs[1]).toHaveValue(15);
    expect(inputs[2]).toHaveValue(25);
  });
});
