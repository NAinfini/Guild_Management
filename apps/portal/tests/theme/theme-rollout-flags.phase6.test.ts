import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME_MODE } from '@/theme/presets';
import {
  readThemeRolloutConfig,
  resolveThemeRolloutRuntime,
} from '@/theme/rollout';

describe('phase 6 rollout feature flags', () => {
  it('resolves blocked themes to an enabled fallback theme', () => {
    localStorage.setItem('baiye_theme_rollout_enabled_themes', 'chibi, cyberpunk');

    const config = readThemeRolloutConfig();
    const runtime = resolveThemeRolloutRuntime({
      themeId: 'steampunk',
      fxQuality: 3,
      config,
    });

    expect(runtime.themeId).toBe('chibi');
    expect(runtime.themeBlocked).toBe(true);
  });

  it('falls back to default theme when enabled list is empty/invalid', () => {
    localStorage.setItem('baiye_theme_rollout_enabled_themes', ',,,');

    const config = readThemeRolloutConfig();
    const runtime = resolveThemeRolloutRuntime({
      themeId: 'royal',
      fxQuality: 3,
      config,
    });

    expect(runtime.themeId).toBe(DEFAULT_THEME_MODE);
  });

  it('caps fx quality and supports baseline-only runtime fallback switch', () => {
    localStorage.setItem('baiye_theme_rollout_max_fx_quality', '1');
    localStorage.setItem('baiye_theme_baseline_fx_only', '1');

    const config = readThemeRolloutConfig();
    const runtime = resolveThemeRolloutRuntime({
      themeId: 'cyberpunk',
      fxQuality: 3,
      config,
    });

    expect(runtime.fxQuality).toBe(1);
    expect(runtime.baselineFxOnly).toBe(true);
  });
});
