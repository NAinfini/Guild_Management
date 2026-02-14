import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getThemeColor,
  getThemePreferences,
  initThemePreferences,
  setThemeColor,
  setThemePreferences,
} from '@/theme/ThemeController';

describe('theme-engine preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-color');
  });

  it('rejects unknown theme IDs and falls back to default theme/color', () => {
    localStorage.setItem('baiye_theme', 'redgold');

    const prefs = initThemePreferences();

    expect(prefs).toEqual({
      theme: 'neo-brutalism',
      color: 'default-violet',
      fontScale: 1,
      motionIntensity: 1,
    });
    expect(localStorage.getItem('baiye_theme')).toBe('neo-brutalism');
    expect(localStorage.getItem('baiye_theme_color')).toBe('default-violet');
    expect(document.documentElement.dataset.theme).toBe('neo-brutalism');
    expect(document.documentElement.dataset.themeColor).toBe('default-violet');
  });

  it('persists and exposes color updates independently from theme style', () => {
    setThemePreferences({ theme: 'cyberpunk', color: 'default-violet' });
    setThemeColor('black-gold');

    expect(getThemePreferences()).toEqual({
      theme: 'cyberpunk',
      color: 'black-gold',
      fontScale: 1,
      motionIntensity: 1,
    });
    expect(getThemeColor()).toBe('black-gold');
    expect(localStorage.getItem('baiye_theme')).toBe('cyberpunk');
    expect(localStorage.getItem('baiye_theme_color')).toBe('black-gold');
  });

  it('dispatches both theme and color in theme-change event payload', () => {
    const handler = vi.fn();
    window.addEventListener('theme-change', handler);

    setThemePreferences({ theme: 'neo-brutalism', color: 'neon-spectral' });

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent<{ theme: string; color: string; fontScale: number; motionIntensity: number }>;
    expect(event.detail).toEqual({ theme: 'neo-brutalism', color: 'neon-spectral', fontScale: 1, motionIntensity: 1 });
  });

  it('persists font scale and motion intensity preferences', () => {
    setThemePreferences({
      theme: 'steampunk',
      color: 'black-gold',
      fontScale: 1.12,
      motionIntensity: 0.45,
    });

    expect(getThemePreferences()).toEqual({
      theme: 'steampunk',
      color: 'black-gold',
      fontScale: 1.12,
      motionIntensity: 0.45,
    });
    expect(localStorage.getItem('baiye_theme_font_scale')).toBe('1.12');
    expect(localStorage.getItem('baiye_theme_motion_intensity')).toBe('0.45');
  });
});
