import { describe, expect, it } from 'vitest';
import { WAR_HISTORY_PIE_COLORS } from '@/features/GuildWar/components/WarHistoryPieCharts';

describe('War history pie chart colors', () => {
  it('uses theme status tokens for win/loss/draw and role slices', () => {
    expect(WAR_HISTORY_PIE_COLORS.victory).toBe('var(--color-status-success)');
    expect(WAR_HISTORY_PIE_COLORS.defeat).toBe('var(--color-status-error)');
    expect(WAR_HISTORY_PIE_COLORS.draw).toBe('var(--color-status-warning)');
    expect(WAR_HISTORY_PIE_COLORS.info).toBe('var(--color-status-info)');
  });
});

