import { describe, expect, it } from 'vitest';
import { THEME_VISUAL_SPEC_LIST } from '@/theme/tokens';
import { resolveThemePostFxStack } from '@/theme/fx/postFxGates';

const FANCY_EFFECTS = new Set(['Glitch', 'GodRays', 'Bloom', 'ChromaticAberration']);

describe('phase 5 reduced-mode fancy-fx suppression', () => {
  it('suppresses heavy/chromatic fancy effects in reduced mode for every theme', () => {
    for (const theme of THEME_VISUAL_SPEC_LIST) {
      const stack = resolveThemePostFxStack({
        themeId: theme.id,
        fxQuality: 3,
        reducedMotion: true,
        motionMode: 'toned-down',
      });

      expect(stack.heavy, `theme=${theme.id}`).toHaveLength(0);
      for (const effect of stack.enabled) {
        expect(FANCY_EFFECTS.has(effect), `theme=${theme.id} effect=${effect}`).toBe(false);
      }
    }
  });
});

