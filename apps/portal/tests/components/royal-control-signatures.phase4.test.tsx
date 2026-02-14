import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/button/Button';
import { Slider } from '@/components/input/Slider';

function renderInRoyalTheme(node: React.ReactNode) {
  return render(<div data-theme="royal">{node}</div>);
}

describe('royal control signatures', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  it('triggers velvet press and hover sheen as short one-shots', () => {
    vi.useFakeTimers();
    renderInRoyalTheme(<Button disableRipple>Atelier</Button>);
    const button = screen.getByRole('button', { name: 'Atelier' });

    fireEvent.mouseEnter(button);
    expect(button.getAttribute('data-theme-signature')).toBe('royal-sheen-sweep');

    act(() => {
      vi.advanceTimersByTime(260);
    });
    expect(button.getAttribute('data-theme-signature')).not.toBe('royal-sheen-sweep');

    fireEvent.mouseDown(button);
    expect(button.getAttribute('data-theme-signature')).toBe('royal-velvet-press');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(button.getAttribute('data-theme-signature')).not.toBe('royal-velvet-press');
  });

  it('suppresses sheen/orb travel under reduced motion while preserving royal identity markers', () => {
    vi.useFakeTimers();
    document.documentElement.setAttribute('data-motion-mode', 'off');

    renderInRoyalTheme(<Button disableRipple>Calm</Button>);
    const button = screen.getByRole('button', { name: 'Calm' });
    fireEvent.mouseEnter(button);
    expect(button.getAttribute('data-theme-signature')).not.toBe('royal-sheen-sweep');

    const { container } = renderInRoyalTheme(
      <Slider value={60} min={0} max={100} onChange={() => {}} />,
    );
    const slider = container.querySelector('.MuiSlider-root') as HTMLElement | null;
    expect(slider?.getAttribute('data-royal-glass-orb')).toBe('true');
    fireEvent.mouseDown(slider!);
    expect(slider?.getAttribute('data-theme-signature')).not.toBe('royal-orb-travel');
  });

  it('marks glass-orb highlight travel on royal slider interaction and settles', () => {
    vi.useFakeTimers();
    const { container } = renderInRoyalTheme(
      <Slider value={42} min={0} max={100} onChange={() => {}} />,
    );
    const slider = container.querySelector('.MuiSlider-root') as HTMLElement | null;
    expect(slider?.getAttribute('data-royal-glass-orb')).toBe('true');

    fireEvent.mouseDown(slider!);
    expect(slider?.getAttribute('data-theme-signature')).toBe('royal-orb-travel');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(slider?.getAttribute('data-theme-signature')).not.toBe('royal-orb-travel');
  });
});
