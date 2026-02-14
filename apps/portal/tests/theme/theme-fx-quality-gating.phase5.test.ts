import { describe, expect, it } from 'vitest';
import { THEME_VISUAL_SPEC_LIST } from '@/theme/tokens';
import {
  FX_EFFECT_GATING_MATRIX,
  type ThemePostEffect,
} from '@/theme/runtimeContracts';
import { isEffectAllowedAtQuality, resolveThemePostFxStack } from '@/theme/fx/postFxGates';

const QUALITY_RANK = {
  off: 0,
  low: 1,
  medium: 2,
  high: 3,
} as const;

describe('phase 5 fxQuality gating matrix', () => {
  it('enforces each effect threshold exactly as declared in runtime contracts', () => {
    const levels: Array<0 | 1 | 2 | 3> = [0, 1, 2, 3];
    for (const [effect, tier] of Object.entries(FX_EFFECT_GATING_MATRIX) as Array<[ThemePostEffect, keyof typeof QUALITY_RANK]>) {
      for (const level of levels) {
        expect(isEffectAllowedAtQuality(effect, level)).toBe(level >= QUALITY_RANK[tier]);
      }
    }
  });

  it('never emits a post-fx effect that exceeds the active fxQuality level', () => {
    const levels: Array<0 | 1 | 2 | 3> = [0, 1, 2, 3];
    for (const theme of THEME_VISUAL_SPEC_LIST) {
      for (const level of levels) {
        const stack = resolveThemePostFxStack({
          themeId: theme.id,
          fxQuality: level,
          reducedMotion: false,
          motionMode: 'full',
        });
        for (const effect of stack.enabled) {
          expect(
            isEffectAllowedAtQuality(effect, level),
            `theme=${theme.id} effect=${effect} level=${level}`,
          ).toBe(true);
        }
      }
    }
  });
});

