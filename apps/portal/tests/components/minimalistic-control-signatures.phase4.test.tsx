import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/button/Button';
import { Slider } from '@/components/input/Slider';
import { Toggle } from '@/components/input/Toggle';

function renderInMinimalTheme(node: React.ReactNode) {
  return render(<div data-theme="minimalistic">{node}</div>);
}

describe('minimalistic control signatures', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets slider orbit shadow progress variable from current value', () => {
    const { container } = renderInMinimalTheme(
      <Slider value={75} min={0} max={100} onChange={() => {}} />,
    );

    const sliderHost = container.querySelector('[data-minimal-slider-orbit="true"]') as HTMLElement | null;
    expect(sliderHost).toBeTruthy();
    expect(sliderHost?.style.getPropertyValue('--slider-progress')).toBe('0.7500');
  });

  it('triggers and clears 100ms paper grain hit signature on toggle', () => {
    vi.useFakeTimers();
    renderInMinimalTheme(<Toggle pressed={false} onPressedChange={() => {}}>Paper</Toggle>);

    const toggle = screen.getByRole('button', { name: 'Paper' });
    fireEvent.click(toggle);

    expect(toggle.getAttribute('data-theme-signature')).toBe('paper-grain-hit');
    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(toggle.getAttribute('data-theme-signature')).not.toBe('paper-grain-hit');
  });

  it('exposes typography hover marker for gallery button behavior', () => {
    renderInMinimalTheme(<Button disableRipple>Gallery</Button>);
    const button = screen.getByRole('button', { name: 'Gallery' });

    expect(button.getAttribute('data-minimal-typography-hover')).toBe('true');
  });
});
