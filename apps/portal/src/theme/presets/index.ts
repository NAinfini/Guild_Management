import type { ThemeOptions } from '@mui/material/styles';
import {
  THEME_VISUAL_SPECS,
  THEME_VISUAL_SPEC_LIST,
} from '../tokens';
import type { ThemeMode, ThemeVisualSpec } from '../tokens';

export type { ThemeMode, ThemeVisualSpec } from '../tokens';

export { THEME_VISUAL_SPEC_LIST };

// Export compatibility aliases
export const THEME_PRESETS = THEME_VISUAL_SPECS;
export const DEFAULT_THEME_MODE: ThemeMode = THEME_VISUAL_SPEC_LIST[0]?.id as ThemeMode || ('system' as ThemeMode);

export const THEME_IDS = THEME_VISUAL_SPEC_LIST.map((p) => p.id);

export function isThemeMode(value: any): value is ThemeMode {
  return typeof value === 'string' && THEME_IDS.includes(value as any);
}

export function getThemeVisualSpec(mode: ThemeMode): ThemeVisualSpec {
  return THEME_VISUAL_SPECS[mode];
}

/**
 * Generates MUI ThemeOptions based on the Nexus ThemeMode.
 * Standardizes typography and shapes across the application.
 */
export function getThemeOptions(mode: ThemeMode): ThemeOptions {
  const spec = getThemeVisualSpec(mode);

  return {
    typography: {
      fontFamily: spec.fontFamily,
      h1: { fontFamily: spec.headingFont, fontWeight: 700 },
      h2: { fontFamily: spec.headingFont, fontWeight: 700 },
      h3: { fontFamily: spec.headingFont, fontWeight: 600 },
      h4: { fontFamily: spec.headingFont, fontWeight: 600 },
      h5: { fontFamily: spec.headingFont, fontWeight: 500 },
      h6: { fontFamily: spec.headingFont, fontWeight: 500 },
      button: {
        textTransform: mode === 'cyberpunk' ? 'uppercase' : 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: spec.shape.borderRadius,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: spec.shape.buttonRadius,
            fontWeight: 600,
            textTransform: mode === 'cyberpunk' ? 'uppercase' : 'none',
            ...(mode === 'cyberpunk' && {
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                borderLeft: '3px solid var(--color-accent-primary)',
                '&:hover': {
                  animation: 'cyberpunk-glitch 0.2s steps(2) 1',
                  boxShadow: 'none',
                },
            }),
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: spec.shape.borderRadius,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: spec.shape.borderRadius,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: spec.shape.inputRadius,
          },
        },
      },
    },
    shadows: [
      'none',
      spec.shadows[1],
      spec.shadows[2],
      spec.shadows[3],
      ...Array(21).fill('none'), // MUI expects 25 shadows
    ] as any,
  };
}

export const THEME_PRESET_LIST = THEME_VISUAL_SPEC_LIST;
