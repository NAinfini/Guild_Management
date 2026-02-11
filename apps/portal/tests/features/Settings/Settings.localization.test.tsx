import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ColorSection,
  ThemeControllerProvider,
  ThemeSection,
} from '@/theme/ThemeController';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        'settings.visual_theme': 'Visual Theme (L10N)',
        'settings.visual_theme_subtitle': 'Visual subtitle (L10N)',
        'settings.color_palette': 'Color Palette (L10N)',
        'settings.color_palette_subtitle': 'Color subtitle (L10N)',
        'settings.active': 'Active (L10N)',
        'theme_menu.themes.neo-brutalism.label': 'Neo-Brutalism (L10N)',
        'theme_menu.themes.neo-brutalism.description': 'Theme description (L10N)',
        'theme_menu.colors.default-violet.label': 'Default Violet (L10N)',
        'theme_menu.colors.default-violet.description': 'Color description (L10N)',
      };
      return map[key] ?? options?.defaultValue ?? key;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('Settings localization in theme sections', () => {
  it('renders localized labels/descriptions for theme and color cards', () => {
    window.localStorage.setItem('baiye_theme', 'neo-brutalism');
    window.localStorage.setItem('baiye_theme_color', 'default-violet');

    render(
      <ThemeControllerProvider>
        <ThemeSection />
        <ColorSection />
      </ThemeControllerProvider>,
    );

    expect(screen.getByText('Visual Theme (L10N)')).toBeInTheDocument();
    expect(screen.getByText('Color Palette (L10N)')).toBeInTheDocument();
    expect(screen.getByText('Neo-Brutalism (L10N)')).toBeInTheDocument();
    expect(screen.getByText('Default Violet (L10N)')).toBeInTheDocument();
    expect(screen.getByText('Color description (L10N)')).toBeInTheDocument();
    expect(screen.getAllByText('Active (L10N)').length).toBeGreaterThan(0);
  });
});
