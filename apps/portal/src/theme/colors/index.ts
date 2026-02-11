import {
  goldAmberColor,
  chineseInkColor,
  tealNeonColor,
  crimsonGoldColor,
  softRoseColor,
  violetCyanColor,
  THEME_COLOR_PRESET_LIST,
  THEME_COLOR_PRESETS,
  GAME_CLASS_COLORS,
} from '../tokens';
import type { ThemeColor, ThemeColorPreset } from '../tokens';

export type { ThemeColor, ThemeColorPreset } from '../tokens';

export {
  THEME_COLOR_PRESET_LIST,
  THEME_COLOR_PRESETS,
  goldAmberColor,
  chineseInkColor,
  tealNeonColor,
  crimsonGoldColor,
  softRoseColor,
  violetCyanColor,
  GAME_CLASS_COLORS,
};

export const THEME_COLOR_IDS = THEME_COLOR_PRESET_LIST.map((preset) => preset.id) as ThemeColor[];
export const DEFAULT_THEME_COLOR: ThemeColor = 'black-gold';

export function isThemeColor(value: string | null): value is ThemeColor {
  return !!value && (THEME_COLOR_IDS as string[]).includes(value);
}

export function getThemeColorTokens(color: ThemeColor): { primary: string; secondary: string } {
  const preset = THEME_COLOR_PRESETS[color];
  return { primary: preset.primary, secondary: preset.secondary };
}

export function getThemeColorPalette(color: ThemeColor): ThemeColorPreset['palette'] {
  return THEME_COLOR_PRESETS[color].palette;
}
