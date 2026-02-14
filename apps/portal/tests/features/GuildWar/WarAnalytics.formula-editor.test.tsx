import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricFormulaEditor } from '@/features/GuildWar/components/WarAnalytics/MetricFormulaEditor';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

describe('MetricFormulaEditor', () => {
  it('submits current weights payload when save is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <MetricFormulaEditor
        open
        onClose={() => {}}
        onSave={onSave}
      />
    );

    await user.click(screen.getByRole('button', { name: 'common.save' }));

    expect(onSave).toHaveBeenCalledWith({ kda: 60, towers: 15, distance: 25 });
  });

  it('removes preset controls and validates total equals 100', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <MetricFormulaEditor
        open
        onClose={() => {}}
        onSave={onSave}
      />
    );

    expect(screen.queryByText('guild_war.analytics_formula_preset')).not.toBeInTheDocument();
    expect(screen.queryByText('guild_war.analytics_formula_preset_name')).not.toBeInTheDocument();

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '80');
    expect(screen.getByRole('button', { name: 'common.save' })).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();

    await user.clear(inputs[1]);
    await user.type(inputs[1], '10');
    await user.clear(inputs[2]);
    await user.type(inputs[2], '10');
    expect(screen.getByRole('button', { name: 'common.save' })).not.toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'common.save' }));

    expect(onSave).toHaveBeenCalledWith({ kda: 80, towers: 10, distance: 10 });
  });
});
