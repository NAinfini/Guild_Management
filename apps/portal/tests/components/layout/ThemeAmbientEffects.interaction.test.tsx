import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';

describe('ThemeAmbientEffects interaction feedback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates cursor-driven CSS vars on mouse move', async () => {
    const { container } = render(<ThemeAmbientEffects theme="cyberpunk" />);
    const root = container.firstElementChild as HTMLElement;

    fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });

    await waitFor(() => {
      expect(root.style.getPropertyValue('--ambient-cursor-x')).not.toBe('50%');
      expect(root.style.getPropertyValue('--ambient-cursor-y')).not.toBe('50%');
    });
  });

  it('renders and clears click burst feedback', () => {
    vi.useFakeTimers();
    const { container } = render(<ThemeAmbientEffects theme="cyberpunk" />);

    fireEvent.mouseDown(window, { clientX: 180, clientY: 160 });
    expect(container.querySelector('.theme-ambient__click-burst')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(container.querySelector('.theme-ambient__click-burst')).toBeFalsy();
  });
});

