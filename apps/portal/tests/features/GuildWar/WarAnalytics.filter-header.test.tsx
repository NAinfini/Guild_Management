import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
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
      t: (key: string, opts?: Record<string, any>) => {
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

vi.mock('@/lib/api', () => ({
  warsAPI: {
    getAnalyticsFormulaPresets: vi.fn(async () => [
      {
        preset_id: 'default',
        name: 'Default',
        version: 1,
        kda_weight: 60,
        tower_weight: 15,
        distance_weight: 25,
        created_at_utc: '2026-02-09T00:00:00.000Z',
        created_by: 'system',
        is_default: 1,
      },
      {
        preset_id: 'aggressive_v2',
        name: 'Aggressive',
        version: 2,
        kda_weight: 70,
        tower_weight: 10,
        distance_weight: 20,
        created_at_utc: '2026-02-10T00:00:00.000Z',
        created_by: 'admin',
        is_default: 0,
      },
    ]),
    createAnalyticsFormulaPreset: vi.fn(async () => ({
      preset_id: 'custom_v3',
      name: 'Custom',
      version: 3,
      kda_weight: 55,
      tower_weight: 20,
      distance_weight: 25,
      created_at_utc: '2026-02-10T00:00:00.000Z',
      created_by: 'admin',
      is_default: 0,
    })),
    deleteAnalyticsFormulaPreset: vi.fn(async () => undefined),
  },
}));

function NormalizationWeightProbe() {
  const { filters } = useAnalytics();
  return (
    <div data-testid="normalization-weights">
      {`${filters.normalizationWeights.kda},${filters.normalizationWeights.towers},${filters.normalizationWeights.distance}`}
    </div>
  );
}

describe('WarAnalytics FilterBar', () => {
  beforeEach(() => {
    mockAuthState.user = { id: 'u1', role: 'member', username: 'tester' } as any;
    mockAuthState.viewRole = null;
    vi.clearAllMocks();
  });

  it('renders unified analytics header controls with mode tabs and metric filter', async () => {
    const { warsAPI } = await import('@/lib/api');
    render(
      <AnalyticsProvider>
        <FilterBar
          wars={[
            { war_id: 1, title: 'War One', war_date: '2026-02-01', result: 'win', our_kills: 10, enemy_kills: 8, our_towers: 2, enemy_towers: 1, participant_count: 10, missing_stats_count: 0 },
          ] as any}
        />
        <NormalizationWeightProbe />
      </AnalyticsProvider>,
    );
    await waitFor(() => expect(warsAPI.getAnalyticsFormulaPresets).toHaveBeenCalled());

    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_compare_desc' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_rankings_desc' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'guild_war.analytics_mode_teams_desc' })).toBeInTheDocument();

    expect(screen.queryByText('guild_war.analytics_filter_header')).not.toBeInTheDocument();
    expect(screen.queryByText('guild_war.analytics_filter_subheader')).not.toBeInTheDocument();

    expect(screen.getAllByText('guild_war.analytics_primary_metric').length).toBeGreaterThan(0);
    expect(screen.getByText('guild_war.analytics_select_wars')).toBeInTheDocument();
  });

  it('shows server formula presets for analytics viewers and applies selected preset', async () => {
    const user = userEvent.setup();
    render(
      <AnalyticsProvider>
        <FilterBar
          wars={[
            { war_id: 1, title: 'War One', war_date: '2026-02-01', result: 'win', our_kills: 10, enemy_kills: 8, our_towers: 2, enemy_towers: 1, participant_count: 10, missing_stats_count: 0 },
          ] as any}
        />
        <NormalizationWeightProbe />
      </AnalyticsProvider>
    );

    const { warsAPI } = await import('@/lib/api');
    await waitFor(() => expect(warsAPI.getAnalyticsFormulaPresets).toHaveBeenCalledTimes(1));

    expect(screen.queryByRole('button', { name: 'guild_war.analytics_formula_editor_title' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'guild_war.analytics_formula_preset' })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'guild_war.analytics_formula_preset' }));
    await user.click(screen.getByRole('option', { name: 'Aggressive v2' }));

    expect(screen.getByTestId('normalization-weights')).toHaveTextContent('70,10,20');
  });

  it('shows formula preset load error copy and supports retry', async () => {
    const user = userEvent.setup();
    const { warsAPI } = await import('@/lib/api');
    vi.mocked(warsAPI.getAnalyticsFormulaPresets).mockRejectedValueOnce(new Error('network'));

    render(
      <AnalyticsProvider>
        <FilterBar
          wars={[
            { war_id: 1, title: 'War One', war_date: '2026-02-01', result: 'win', our_kills: 10, enemy_kills: 8, our_towers: 2, enemy_towers: 1, participant_count: 10, missing_stats_count: 0 },
          ] as any}
        />
      </AnalyticsProvider>
    );

    await waitFor(() => expect(screen.getByText('guild_war.analytics_formula_sync_error_load')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_formula_sync_retry' }));

    await waitFor(() => expect(warsAPI.getAnalyticsFormulaPresets).toHaveBeenCalledTimes(2));
  });

  it('uses server mutations for admin formula preset save/delete flow', async () => {
    const user = userEvent.setup();
    mockAuthState.user = { id: 'admin-1', role: 'admin', username: 'admin' } as any;

    render(
      <AnalyticsProvider>
        <FilterBar
          wars={[
            { war_id: 1, title: 'War One', war_date: '2026-02-01', result: 'win', our_kills: 10, enemy_kills: 8, our_towers: 2, enemy_towers: 1, participant_count: 10, missing_stats_count: 0 },
          ] as any}
        />
      </AnalyticsProvider>
    );

    const { warsAPI } = await import('@/lib/api');
    await waitFor(() => expect(warsAPI.getAnalyticsFormulaPresets).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_formula_editor_title' }));
    await user.type(screen.getByLabelText('guild_war.analytics_formula_preset_name'), 'My Formula');
    await user.click(screen.getByRole('button', { name: 'common.save' }));

    await waitFor(() => expect(warsAPI.createAnalyticsFormulaPreset).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_formula_editor_title' }));
    await user.click(screen.getByRole('combobox', { name: 'guild_war.analytics_formula_preset' }));
    await user.click(screen.getByRole('option', { name: 'Aggressive v2' }));
    await user.click(screen.getByRole('button', { name: 'common.delete' }));

    await waitFor(() => expect(warsAPI.deleteAnalyticsFormulaPreset).toHaveBeenCalledWith('aggressive_v2'));
  });
});
