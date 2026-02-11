import { describe, expect, it } from 'vitest';
import { createTheme } from '@mui/material/styles';
import {
  THEME_PRESETS,
  THEME_IDS,
  DEFAULT_THEME_MODE,
  getThemeOptions,
} from '@/theme/presets';
import {
  THEME_COLOR_PRESETS,
  THEME_COLOR_IDS,
  DEFAULT_THEME_COLOR,
  getThemeColorTokens,
} from '@/theme/colors';

describe('nexus theme/color split registries', () => {
  it('keeps visual themes and color palettes in separate registries', () => {
    expect(THEME_IDS.length).toBeGreaterThan(0);
    expect(THEME_COLOR_IDS.length).toBeGreaterThan(0);
    expect(THEME_PRESETS[DEFAULT_THEME_MODE]).toBeDefined();
    expect(THEME_COLOR_PRESETS[DEFAULT_THEME_COLOR]).toBeDefined();
  });

  it('maps each theme to a valid default color palette', () => {
    for (const themeId of THEME_IDS) {
      const mappedColor = THEME_PRESETS[themeId].defaultColor;
      expect(THEME_COLOR_PRESETS[mappedColor]).toBeDefined();
    }
  });

  it('exposes normalized color tokens with primary and secondary values', () => {
    for (const colorId of THEME_COLOR_IDS) {
      const tokens = getThemeColorTokens(colorId);
      expect(tokens.primary).toBeTruthy();
      expect(tokens.secondary).toBeTruthy();
    }
  });

  it('matches Nexus visual themes and removes legacy theme IDs', () => {
    const expectedThemeIds = [
      'neo-brutalism',
      'steampunk',
      'cyberpunk',
      'post-apocalyptic',
      'chibi',
      'royal',
      'minimalistic',
    ];

    expect([...THEME_IDS].sort()).toEqual([...expectedThemeIds].sort());
    expect(THEME_IDS).not.toContain('redgold');
    expect(THEME_IDS).not.toContain('softpink');
    expect(THEME_IDS).not.toContain('dark-gold');
    expect(THEME_IDS).not.toContain('neon-spectral');
    expect(THEME_IDS).not.toContain('default');
    expect(THEME_IDS).not.toContain('chinese-ink');
  });

  it('matches Nexus color palette IDs', () => {
    const expectedColorIds = [
      'black-gold',
      'chinese-ink',
      'neon-spectral',
      'red-gold',
      'soft-pink',
      'default-violet',
    ];

    expect([...THEME_COLOR_IDS].sort()).toEqual([...expectedColorIds].sort());
  });

  it('copies Nexus library color tokens exactly', () => {
    const expected = {
      'black-gold': { primary: '#D4AF37', secondary: '#1E1E1E' },
      'chinese-ink': { primary: '#111111', secondary: '#EBE8E1' },
      'neon-spectral': { primary: '#00F0FF', secondary: '#0F0529' },
      'red-gold': { primary: '#F59E0B', secondary: '#450A0A' },
      'soft-pink': { primary: '#FB7185', secondary: '#FFE4E9' },
      'default-violet': { primary: '#7C3AED', secondary: '#F8FAFC' },
    } as const;

    for (const colorId of THEME_COLOR_IDS) {
      const tokens = getThemeColorTokens(colorId);
      expect(tokens.primary.toUpperCase()).toBe(expected[colorId].primary);
      expect(tokens.secondary.toUpperCase()).toBe(expected[colorId].secondary);
    }
  });

  it('uses the same default color as Nexus library', () => {
    expect(DEFAULT_THEME_COLOR).toBe('black-gold');
  });

  it('copies core visual theme style settings from Nexus library', () => {
    const neoBrutalism = getThemeOptions('neo-brutalism');
    const cyberpunk = getThemeOptions('cyberpunk');
    const chibi = getThemeOptions('chibi');

    expect(neoBrutalism.shape?.borderRadius).toBe(0);
    expect((neoBrutalism.typography as any)?.fontFamily).toBe("'Inter', sans-serif");
    expect((neoBrutalism.typography as any)?.button?.textTransform).toBe('none');

    expect((cyberpunk.typography as any)?.fontFamily).toBe("'Rajdhani', sans-serif");
    expect((cyberpunk.typography as any)?.button?.textTransform).toBe('uppercase');

    expect(chibi.shape?.borderRadius).toBe(24);
  });

  it('applies cyberpunk button geometry and hover glitch signature', () => {
    const cyberpunk = getThemeOptions('cyberpunk');
    const buttonRootOverride = cyberpunk.components?.MuiButton?.styleOverrides?.root;

    expect(typeof buttonRootOverride).toBe('function');

    const buttonRootStyles = (buttonRootOverride as (args: { theme: ReturnType<typeof createTheme> }) => Record<string, unknown>)(
      { theme: createTheme() }
    );

    expect(buttonRootStyles.clipPath).toBeDefined();
    expect(String(buttonRootStyles.clipPath)).toContain('calc(100% - 10px)');
    expect(String(buttonRootStyles.borderLeft)).toContain('3px');

    const hoverStyles = buttonRootStyles['&:hover'] as Record<string, unknown>;
    expect(hoverStyles.animation).toBe('cyberpunk-glitch 0.2s steps(2) 1');
    expect(hoverStyles.textShadow).toBeUndefined();
    expect(hoverStyles.boxShadow).toBe('none');
  });
});
