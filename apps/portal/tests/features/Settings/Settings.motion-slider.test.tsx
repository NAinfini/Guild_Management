import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Settings } from '@/features/Settings';

const themeControllerMocks = vi.hoisted(() => ({
  setFontScale: vi.fn(),
  setMotionIntensity: vi.fn(),
  setMotionMode: vi.fn(),
  setHighContrast: vi.fn(),
  setDyslexiaFriendly: vi.fn(),
  setColorBlindMode: vi.fn(),
}));
const i18nMocks = vi.hoisted(() => ({
  t: (key: string) => key,
  changeLanguage: vi.fn(),
}));

vi.mock('@/theme/ThemeController', async () => {
  const actual = await vi.importActual<typeof import('@/theme/ThemeController')>('@/theme/ThemeController');
  return {
    ...actual,
    ThemeSection: () => <div data-testid="theme-section" />,
    ColorSection: () => <div data-testid="color-section" />,
    useThemeController: () => ({
      currentTheme: 'neo-brutalism',
      currentColor: 'default-violet',
      fontScale: 1,
      motionIntensity: 1,
      motionMode: 'full',
      effectiveMotionMode: 'full',
      reducedMotion: false,
      highContrast: false,
      dyslexiaFriendly: false,
      colorBlindMode: 'off',
      setTheme: vi.fn(),
      setColor: vi.fn(),
      setFontScale: themeControllerMocks.setFontScale,
      setMotionIntensity: themeControllerMocks.setMotionIntensity,
      setMotionMode: themeControllerMocks.setMotionMode,
      setHighContrast: themeControllerMocks.setHighContrast,
      setDyslexiaFriendly: themeControllerMocks.setDyslexiaFriendly,
      setColorBlindMode: themeControllerMocks.setColorBlindMode,
    }),
  };
});

vi.mock('@/components', async () => {
  const actual = await vi.importActual<typeof import('@/components')>('@/components');
  return {
    ...actual,
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    Slider: ({ value, onChange, onChangeCommitted }: any) => (
      <input
        data-testid="motion-slider"
        type="range"
        value={value}
        onChange={(event) => onChange?.(event, Number((event.target as HTMLInputElement).value))}
        onMouseUp={(event) => onChangeCommitted?.(event, Number((event.target as HTMLInputElement).value))}
      />
    ),
  };
});

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual<typeof import('react-i18next')>('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: i18nMocks.t,
      i18n: {
        language: 'en',
        resolvedLanguage: 'en',
        changeLanguage: i18nMocks.changeLanguage,
      },
    }),
  };
});

describe('Settings motion slider', () => {
  beforeEach(() => {
    themeControllerMocks.setFontScale.mockReset();
    themeControllerMocks.setMotionIntensity.mockReset();
    themeControllerMocks.setMotionMode.mockReset();
    themeControllerMocks.setHighContrast.mockReset();
    themeControllerMocks.setDyslexiaFriendly.mockReset();
    themeControllerMocks.setColorBlindMode.mockReset();
  });

  it('applies motion intensity only when slider change is committed', () => {
    render(<Settings />);

    const slider = screen.getByTestId('motion-slider') as HTMLInputElement;

    fireEvent.change(slider, { target: { value: '1.2' } });
    expect(themeControllerMocks.setMotionIntensity).not.toHaveBeenCalled();

    fireEvent.mouseUp(slider, { target: { value: '1.2' } });
    expect(themeControllerMocks.setMotionIntensity).toHaveBeenCalledTimes(1);
    expect(themeControllerMocks.setMotionIntensity).toHaveBeenCalledWith(1.2);
  });

  it('wires accessibility controls to theme controller setters', () => {
    render(<Settings />);

    fireEvent.click(screen.getByTestId('high-contrast-toggle'));
    fireEvent.click(screen.getByTestId('dyslexia-toggle'));
    fireEvent.change(screen.getByTestId('color-blind-mode-select'), {
      target: { value: 'tritanopia' },
    });

    expect(themeControllerMocks.setHighContrast).toHaveBeenCalledWith(true);
    expect(themeControllerMocks.setDyslexiaFriendly).toHaveBeenCalledWith(true);
    expect(themeControllerMocks.setColorBlindMode).toHaveBeenCalledWith('tritanopia');
  });
});
