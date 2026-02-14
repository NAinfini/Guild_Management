import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: { id: 1, role: 'admin' },
    viewRole: null,
  }),
}));

vi.mock('@/lib/permissions', () => ({
  canAccessAdminArea: () => false,
  getEffectiveRole: () => 'admin',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'common.more': 'More',
        'nav.dashboard': 'Dashboard',
        'nav.events': 'Events',
        'nav.guild_war': 'Guild War',
        'nav.roster': 'Roster',
        'nav.tools': 'Tools',
        'nav.wiki': 'Wiki',
        'nav.profile': 'Profile',
        'nav.settings': 'Settings',
        'settings.interface_theme': 'Interface Theme',
        'settings.color_palette': 'Color Palette',
        'settings.language': 'Language',
        'settings.language_english': 'English',
        'settings.language_chinese': 'Chinese',
      };
      return map[key] ?? key;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock('@/theme/ThemeController', () => ({
  useThemeController: () => ({
    currentTheme: 'neo-brutalism',
    currentColor: 'black-gold',
    reducedMotion: false,
    motionMode: 'full',
    effectiveMotionMode: 'full',
    setTheme: vi.fn(),
    setColor: vi.fn(),
    setMotionMode: vi.fn(),
  }),
  onThemeChange: () => () => undefined,
  NEXUS_THEME_OPTIONS: [
    { id: 'neo-brutalism', label: 'Neo-Brutalism', description: 'Bold styling' },
  ],
  NEXUS_COLOR_OPTIONS: [
    { id: 'black-gold', label: 'Black Gold', description: 'Warm palette' },
  ],
}));

describe('BottomNavigation account menu', () => {
  it('shows theme, color, language and settings in mobile more menu', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={createTheme()}>
        <BottomNavigation />
      </ThemeProvider>,
    );

    await user.click(screen.getAllByLabelText('More')[0]);

    expect(screen.getByText('Interface Theme')).toBeInTheDocument();
    expect(screen.getByText('Color Palette')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});

