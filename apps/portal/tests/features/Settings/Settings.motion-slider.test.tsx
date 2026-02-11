import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Settings } from '@/features/Settings';

const themeControllerMocks = vi.hoisted(() => ({
  setFontScale: vi.fn(),
  setMotionIntensity: vi.fn(),
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
      setTheme: vi.fn(),
      setColor: vi.fn(),
      setFontScale: themeControllerMocks.setFontScale,
      setMotionIntensity: themeControllerMocks.setMotionIntensity,
    }),
  };
});

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: i18nMocks.t,
    i18n: {
      language: 'en',
      resolvedLanguage: 'en',
      changeLanguage: i18nMocks.changeLanguage,
    },
  }),
}));

describe('Settings motion slider', () => {
  beforeEach(() => {
    themeControllerMocks.setFontScale.mockReset();
    themeControllerMocks.setMotionIntensity.mockReset();
  });

  it('applies motion intensity only when slider change is committed', () => {
    render(<Settings />);

    const slider = screen.getByTestId('motion-slider');

    fireEvent.change(slider, { target: { value: '1.2' } });
    expect(themeControllerMocks.setMotionIntensity).not.toHaveBeenCalled();

    fireEvent.mouseUp(slider, { target: { value: '1.2' } });
    expect(themeControllerMocks.setMotionIntensity).toHaveBeenCalledTimes(1);
    expect(themeControllerMocks.setMotionIntensity).toHaveBeenCalledWith(1.2);
  });
});
