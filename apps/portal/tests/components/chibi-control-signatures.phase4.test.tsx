import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/button/Button';
import { Slider } from '@/components/input/Slider';
import { Toggle } from '@/components/input/Toggle';

function renderInChibiTheme(node: React.ReactNode) {
  return render(<div data-theme="chibi">{node}</div>);
}

describe('chibi control signatures', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  it('triggers face-swap pop on toggle ON and settles quickly', () => {
    vi.useFakeTimers();
    renderInChibiTheme(<Toggle pressed={false} onPressedChange={() => {}}>Face</Toggle>);

    const toggle = screen.getByRole('button', { name: 'Face' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('data-theme-signature')).toBe('face-swap-pop');

    act(() => {
      vi.advanceTimersByTime(240);
    });
    expect(toggle.getAttribute('data-theme-signature')).not.toBe('face-swap-pop');
  });

  it('triggers candy slosh on slider release and suppresses it under reduced mode', () => {
    vi.useFakeTimers();
    const { container } = renderInChibiTheme(
      <Slider value={48} min={0} max={100} onChange={() => {}} onChangeCommitted={() => {}} />,
    );
    const slider = container.querySelector('.MuiSlider-root') as HTMLElement | null;
    expect(slider?.getAttribute('data-chibi-candy-tube')).toBe('true');

    fireEvent.mouseDown(slider!);
    fireEvent.mouseUp(slider!);
    expect(slider?.getAttribute('data-theme-signature')).toBe('candy-slosh');
    act(() => {
      vi.advanceTimersByTime(260);
    });
    expect(slider?.getAttribute('data-theme-signature')).not.toBe('candy-slosh');

    document.documentElement.setAttribute('data-motion-mode', 'off');
    fireEvent.mouseDown(slider!);
    fireEvent.mouseUp(slider!);
    expect(slider?.getAttribute('data-theme-signature')).not.toBe('candy-slosh');
  });

  it('fires confetti burst only for explicit success events and disables in reduced mode', () => {
    vi.useFakeTimers();
    renderInChibiTheme(<Button disableRipple>Nope</Button>);
    const plain = screen.getByRole('button', { name: 'Nope' });
    fireEvent.mouseDown(plain);
    expect(plain.getAttribute('data-theme-signature')).not.toBe('chibi-confetti-burst');

    renderInChibiTheme(
      <Button disableRipple data-success-event="true">
        Yatta
      </Button>,
    );
    const success = screen.getByRole('button', { name: 'Yatta' });
    fireEvent.mouseDown(success);
    expect(success.getAttribute('data-theme-signature')).toBe('chibi-confetti-burst');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(success.getAttribute('data-theme-signature')).not.toBe('chibi-confetti-burst');

    document.documentElement.setAttribute('data-motion-mode', 'off');
    fireEvent.mouseDown(success);
    expect(success.getAttribute('data-theme-signature')).not.toBe('chibi-confetti-burst');
  });
});
