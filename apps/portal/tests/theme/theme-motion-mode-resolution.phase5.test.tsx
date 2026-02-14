import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeControllerProvider, useThemeController } from '@/theme/ThemeController';

function MotionProbe() {
  const { motionMode, effectiveMotionMode, reducedMotion, setMotionMode } = useThemeController();
  return (
    <div>
      <div data-testid="motion-mode">{motionMode}</div>
      <div data-testid="effective-motion-mode">{effectiveMotionMode}</div>
      <div data-testid="reduced-motion">{String(reducedMotion)}</div>
      <button onClick={() => setMotionMode('full')}>mode-full</button>
      <button onClick={() => setMotionMode('off')}>mode-off</button>
    </div>
  );
}

function installMutableReducedMotionMediaQuery(initial: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = initial;

  const mock = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => false,
  }));

  window.matchMedia = mock as unknown as typeof window.matchMedia;

  return {
    setReduced(next: boolean) {
      matches = next;
      const event = { matches: next, media: '(prefers-reduced-motion: reduce)' } as MediaQueryListEvent;
      for (const listener of listeners) {
        listener(event);
      }
    },
  };
}

describe('phase 5 motion-mode resolution', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-motion-mode');
    document.documentElement.removeAttribute('data-reduced-motion');
    window.matchMedia = originalMatchMedia;
  });

  it('re-resolves effective mode when OS reduced-motion preference changes at runtime', () => {
    localStorage.setItem('baiye_theme_motion_mode', 'full');
    const mq = installMutableReducedMotionMediaQuery(false);

    render(
      <ThemeControllerProvider>
        <MotionProbe />
      </ThemeControllerProvider>,
    );

    expect(screen.getByTestId('motion-mode')).toHaveTextContent('full');
    expect(screen.getByTestId('effective-motion-mode')).toHaveTextContent('full');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');

    act(() => {
      mq.setReduced(true);
    });

    expect(screen.getByTestId('motion-mode')).toHaveTextContent('full');
    expect(screen.getByTestId('effective-motion-mode')).toHaveTextContent('toned-down');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
  });

  it('keeps explicit user override authoritative when OS preference flips back', async () => {
    const mq = installMutableReducedMotionMediaQuery(true);
    const user = userEvent.setup();

    render(
      <ThemeControllerProvider>
        <MotionProbe />
      </ThemeControllerProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'mode-off' }));
    expect(screen.getByTestId('motion-mode')).toHaveTextContent('off');
    expect(screen.getByTestId('effective-motion-mode')).toHaveTextContent('off');

    act(() => {
      mq.setReduced(false);
    });

    expect(screen.getByTestId('motion-mode')).toHaveTextContent('off');
    expect(screen.getByTestId('effective-motion-mode')).toHaveTextContent('off');
    expect(document.documentElement.getAttribute('data-motion-mode')).toBe('off');
  });
});
