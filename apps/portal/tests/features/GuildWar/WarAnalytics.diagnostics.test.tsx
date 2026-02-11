import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NormalizationDiagnosticsPanel } from '@/features/GuildWar/components/WarAnalytics/NormalizationDiagnosticsPanel';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

describe('NormalizationDiagnosticsPanel', () => {
  it('renders normalization rows and copies diagnostics export', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();

    render(
      <NormalizationDiagnosticsPanel
        onCopy={onCopy}
        formulaVersion="kda:60|towers:15|distance:25"
        metric="damage"
        rows={[
          {
            war_id: 101,
            war_date: '2026-01-01',
            user_id: 1,
            username: 'Alpha',
            class: 'qiansilin',
            damage: 120000,
            raw_damage: 100000,
            normalization_factor: 1.2,
            enemy_strength_tier: 'strong',
            formula_version: 'kda:60|towers:15|distance:25',
          },
        ] as any}
      />
    );

    expect(screen.getByText('guild_war.analytics_normalization_diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('strong')).toBeInTheDocument();
    expect(screen.getByText('kda:60|towers:15|distance:25')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'guild_war.analytics_copy_diagnostics' }));
    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledTimes(1);
    });
  });

  it('hides copy action when copy permission is disabled', () => {
    render(
      <NormalizationDiagnosticsPanel
        canCopy={false}
        metric="damage"
        rows={[
          {
            war_id: 101,
            war_date: '2026-01-01',
            user_id: 1,
            username: 'Alpha',
            class: 'qiansilin',
            damage: 120000,
            raw_damage: 100000,
            normalization_factor: 1.2,
            enemy_strength_tier: 'strong',
          },
        ] as any}
      />
    );

    expect(screen.queryByRole('button', { name: 'guild_war.analytics_copy_diagnostics' })).not.toBeInTheDocument();
  });

  it('hides formula version metadata when formula-version permission is disabled', () => {
    render(
      <NormalizationDiagnosticsPanel
        canViewFormulaVersion={false}
        formulaVersion="kda:60|towers:15|distance:25"
        metric="damage"
        rows={[
          {
            war_id: 101,
            war_date: '2026-01-01',
            user_id: 1,
            username: 'Alpha',
            class: 'qiansilin',
            damage: 120000,
            raw_damage: 100000,
            normalization_factor: 1.2,
            enemy_strength_tier: 'strong',
            formula_version: 'kda:60|towers:15|distance:25',
          },
        ] as any}
      />
    );

    expect(screen.queryByText('guild_war.analytics_formula_version')).not.toBeInTheDocument();
    expect(screen.queryByText('kda:60|towers:15|distance:25')).not.toBeInTheDocument();
  });
});
