import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/button/Button';
import { Slider } from '@/components/input/Slider';

function renderInNeoTheme(node: React.ReactNode) {
  return render(<div data-theme="neo-brutalism">{node}</div>);
}

describe('neo-brutalism control signatures', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  it('triggers stamp + clunk markers for primary button press', () => {
    vi.useFakeTimers();
    renderInNeoTheme(<Button disableRipple>Stamp</Button>);

    const button = screen.getByRole('button', { name: 'Stamp' });
    fireEvent.mouseDown(button);

    expect(button.getAttribute('data-theme-signature')).toBe('neo-stamp');
    expect(button.getAttribute('data-neo-clunk')).toBe('true');

    act(() => {
      vi.advanceTimersByTime(320);
    });

    expect(button.getAttribute('data-theme-signature')).not.toBe('neo-stamp');
    expect(button.getAttribute('data-neo-clunk')).not.toBe('true');
  });

  it('suppresses clunk flash marker under reduced motion while keeping stamp behavior', () => {
    vi.useFakeTimers();
    document.documentElement.setAttribute('data-motion-mode', 'off');
    renderInNeoTheme(<Button disableRipple>Safe</Button>);

    const button = screen.getByRole('button', { name: 'Safe' });
    fireEvent.mouseDown(button);

    expect(button.getAttribute('data-theme-signature')).toBe('neo-stamp');
    expect(button.getAttribute('data-neo-clunk')).not.toBe('true');
  });

  it('enables segmented slider identity and transient invert signature', () => {
    vi.useFakeTimers();
    const { container } = renderInNeoTheme(
      <Slider value={55} min={0} max={100} onChange={() => {}} onChangeCommitted={() => {}} />,
    );

    const slider = container.querySelector('.MuiSlider-root') as HTMLElement | null;
    expect(slider).toBeTruthy();
    expect(slider?.getAttribute('data-neo-segmented-slider')).toBe('true');

    fireEvent.mouseDown(slider!);
    expect(slider?.getAttribute('data-theme-signature')).toBe('neo-segment-invert');

    act(() => {
      vi.advanceTimersByTime(260);
    });
    expect(slider?.getAttribute('data-theme-signature')).not.toBe('neo-segment-invert');
  });
});
