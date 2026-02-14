import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeControllerProvider } from '@/theme/ThemeController';
import { useAuthStore } from '@/store';

const { getPreferencesMock, updatePreferencesMock } = vi.hoisted(() => ({
  getPreferencesMock: vi.fn(),
  updatePreferencesMock: vi.fn(),
}));

vi.mock('@/lib/api/themePreferences', () => ({
  themePreferencesAPI: {
    get: getPreferencesMock,
    update: updatePreferencesMock,
  },
}));

describe('ThemeController remote preferences sync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getPreferencesMock.mockReset();
    updatePreferencesMock.mockReset();
    localStorage.clear();
    useAuthStore.setState({
      user: {
        id: 'user-theme-sync',
      } as any,
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('disables remote sync quietly when preferences endpoint returns 404', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    getPreferencesMock.mockRejectedValue({
      status: 404,
      message: 'The requested resource was not found.',
    });

    let unmount: (() => void) | null = null;
    await act(async () => {
      const rendered = render(
        <ThemeControllerProvider>
          <div />
        </ThemeControllerProvider>,
      );
      unmount = rendered.unmount;
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(getPreferencesMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });

    expect(updatePreferencesMock).not.toHaveBeenCalled();
    expect(
      warnSpy.mock.calls.some(
        ([message]) =>
          typeof message === 'string'
          && message.includes('Failed to load server theme preferences:'),
      ),
    ).toBe(false);

    await act(async () => {
      unmount?.();
    });

    warnSpy.mockRestore();
  });
});
