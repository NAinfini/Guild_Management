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
        initialWeights={{ kda: 60, towers: 15, distance: 25 }}
        onClose={() => {}}
        onSave={onSave}
      />
    );

    await user.click(screen.getByRole('button', { name: 'common.save' }));

    expect(onSave).toHaveBeenCalledWith({
      weights: { kda: 60, towers: 15, distance: 25 },
      presetName: undefined,
    });
  });

  it('applies selected preset and supports saving with a preset name', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onSelectPreset = vi.fn();

    render(
      <MetricFormulaEditor
        open
        initialWeights={{ kda: 60, towers: 15, distance: 25 }}
        presets={[
          {
            id: 'default',
            name: 'Default',
            version: 1,
            weights: { kda: 60, towers: 15, distance: 25 },
            createdAt: '1970-01-01T00:00:00.000Z',
            isDefault: true,
          },
          {
            id: 'v2',
            name: 'Aggressive',
            version: 2,
            weights: { kda: 70, towers: 10, distance: 20 },
            createdAt: '2026-02-09T00:00:00.000Z',
            isDefault: false,
          },
        ]}
        selectedPresetId="default"
        onSelectPreset={onSelectPreset}
        onDeletePreset={() => {}}
        onClose={() => {}}
        onSave={onSave}
      />
    );

    await user.click(screen.getAllByRole('combobox')[0]);
    await user.click(screen.getByRole('option', { name: 'Aggressive v2' }));
    expect(onSelectPreset).toHaveBeenCalledWith('v2');

    await user.type(screen.getByLabelText('guild_war.analytics_formula_preset_name'), 'My Formula');
    await user.click(screen.getByRole('button', { name: 'common.save' }));

    expect(onSave).toHaveBeenCalledWith({
      weights: { kda: 60, towers: 15, distance: 25 },
      presetName: 'My Formula',
    });
  });
});
