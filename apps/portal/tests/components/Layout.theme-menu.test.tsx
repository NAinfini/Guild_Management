import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppShell as Layout } from '@/layouts';

const navigateMock = vi.fn();
let mockUser: any = {
  id: 1,
  username: 'tester',
  role: 'admin',
  avatar_url: null,
};

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, activeOptions: _activeOptions, ...props }: any) => <a {...props}>{children}</a>,
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => navigateMock,
}));

vi.mock('@/hooks', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: vi.fn(),
  }),
  useMobileOptimizations: () => ({
    isMobile: false,
    spacing: { page: 16 },
  }),
}));

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    viewRole: null,
    setViewRole: vi.fn(),
  }),
  useUIStore: () => ({
    sidebarOpen: false,
    toggleSidebar: vi.fn(),
    closeSidebar: vi.fn(),
    sidebarCollapsed: false,
    toggleSidebarCollapsed: vi.fn(),
    pageTitle: 'Dashboard',
  }),
}));

vi.mock('@/components/app/BottomNavigation', () => ({
  BottomNavigation: () => null,
}));

vi.mock('@/components/app/OfflineBanner', () => ({
  OfflineBanner: () => null,
}));

vi.mock('@/theme/ThemeController', () => ({
  useThemeController: () => ({
    currentTheme: 'neo-brutalism',
    currentColor: 'default-violet',
    reducedMotion: false,
    motionMode: 'full',
    effectiveMotionMode: 'full',
    setTheme: vi.fn(),
    setColor: vi.fn(),
    setMotionMode: vi.fn(),
  }),
  getThemeModeIcon: () => () => <span data-testid="theme-mode-icon" />,
  onThemeChange: () => () => undefined,
  NEXUS_THEME_OPTIONS: [
    { id: 'neo-brutalism', label: 'Neo-Brutalism', description: 'Bold styling' },
    { id: 'steampunk', label: 'Steampunk', description: 'Mechanical styling' },
  ],
  NEXUS_COLOR_OPTIONS: [
    { id: 'default-violet', label: 'Default Violet', description: 'Default palette' },
    { id: 'black-gold', label: 'Black Gold', description: 'Warm palette' },
  ],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'settings.interface_theme': 'Interface Theme',
        'settings.language': 'Language',
        'settings.language_english': 'English',
        'settings.language_chinese': 'Chinese',
        'settings.color_palette': 'Color Palette',
        'nav.settings': 'Settings',
        'auth.login_title': 'Login',
        'common.guest': 'Guest',
        'theme_menu.themes.neo-brutalism.label': 'Neo-Brutalism (L10N)',
        'theme_menu.themes.neo-brutalism.description': 'Bold geometry (L10N)',
        'theme_menu.colors.default-violet.label': 'Default Violet (L10N)',
        'theme_menu.colors.default-violet.description': 'Default palette (L10N)',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

describe('Layout account menu', () => {
  it('renders profile dropdown menu items without stacked per-item borders', async () => {
    mockUser = {
      id: 1,
      username: 'tester',
      role: 'admin',
      avatar_url: null,
    };
    const user = userEvent.setup();

    render(<Layout />);

    await user.click(screen.getByRole('button', { name: /tester/i }));
    const menu = screen.getByRole('menu');
    const themeToggle = within(menu).getByText('Interface Theme').closest('[role="menuitem"]');

    expect(themeToggle).not.toBeNull();
    expect(themeToggle).toHaveClass('profile-menu-item');
    const style = window.getComputedStyle(themeToggle as Element);
    expect(style.borderTopWidth).toBe('0px');
    expect(style.borderRightWidth).toBe('0px');
    expect(style.borderBottomWidth).toBe('0px');
    expect(style.borderLeftWidth).toBe('0px');
  });

  it('shows localized theme, color, language and settings in the top-right profile dropdown', async () => {
    mockUser = {
      id: 1,
      username: 'tester',
      role: 'admin',
      avatar_url: null,
    };
    const user = userEvent.setup();

    render(<Layout />);

    await user.click(screen.getByRole('button', { name: /tester/i }));
    const menu = screen.getByRole('menu');

    expect(within(menu).getByText('Interface Theme')).toBeInTheDocument();
    expect(within(menu).getByText('Color Palette')).toBeInTheDocument();
    expect(within(menu).getByText('Language')).toBeInTheDocument();
    expect(within(menu).getAllByText('Settings').length).toBeGreaterThan(0);

    await user.click(within(menu).getByText('Interface Theme'));
    expect(screen.getAllByText('Neo-Brutalism (L10N)').length).toBeGreaterThan(0);
    expect(screen.getByText('Bold geometry (L10N)')).toBeInTheDocument();

    await user.click(within(menu).getByText('Color Palette'));
    expect(screen.getAllByText('Default Violet (L10N)').length).toBeGreaterThan(0);
    expect(screen.getByText('Default palette (L10N)')).toBeInTheDocument();

    await user.click(within(menu).getByText('Language'));
    expect(screen.getAllByText('English').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chinese').length).toBeGreaterThan(0);
  });

  it('shows theme, color, language and settings for guest in desktop profile dropdown', async () => {
    mockUser = null;
    const user = userEvent.setup();

    render(<Layout />);

    await user.click(screen.getByRole('button', { name: /guest/i }));
    const menu = screen.getByRole('menu');

    expect(within(menu).getByText('Interface Theme')).toBeInTheDocument();
    expect(within(menu).getByText('Color Palette')).toBeInTheDocument();
    expect(within(menu).getByText('Language')).toBeInTheDocument();
    expect(within(menu).getByText('Settings')).toBeInTheDocument();
    expect(within(menu).getByText('Login')).toBeInTheDocument();
  });
});
