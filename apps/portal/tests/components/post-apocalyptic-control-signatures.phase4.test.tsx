import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/button/Button';
import { Slider } from '@/components/input/Slider';
import { Toggle } from '@/components/input/Toggle';

function renderInWastelandTheme(node: React.ReactNode) {
  return render(<div data-theme="post-apocalyptic">{node}</div>);
}

describe('post-apocalyptic control signatures', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  it('enables metallic tape slider marker and transient hitch signature', () => {
    vi.useFakeTimers();
    const { container } = renderInWastelandTheme(
      <Slider value={44} min={0} max={100} onChange={() => {}} onChangeCommitted={() => {}} />,
    );

    const slider = container.querySelector('.MuiSlider-root') as HTMLElement | null;
    expect(slider).toBeTruthy();
    expect(slider?.getAttribute('data-wasteland-metal-thumb')).toBe('true');

    fireEvent.mouseDown(slider!);
    fireEvent.mouseUp(slider!);
    expect(slider?.getAttribute('data-theme-signature')).toBe('wasteland-hitch');

    act(() => {
      vi.advanceTimersByTime(320);
    });
    expect(slider?.getAttribute('data-theme-signature')).not.toBe('wasteland-hitch');

    document.documentElement.setAttribute('data-motion-mode', 'off');
    fireEvent.mouseDown(slider!);
    fireEvent.mouseUp(slider!);
    expect(slider?.getAttribute('data-theme-signature')).not.toBe('wasteland-hitch');
  });

  it('keeps toggle usable by default and only applies rusted-stick in optional hardcore mode', () => {
    vi.useFakeTimers();
    renderInWastelandTheme(<Toggle pressed={false} onPressedChange={() => {}}>Gate</Toggle>);
    const defaultToggle = screen.getByRole('button', { name: 'Gate' });
    fireEvent.click(defaultToggle);
    expect(defaultToggle.getAttribute('data-theme-signature')).not.toBe('wasteland-rusted-stick');

    renderInWastelandTheme(
      <Toggle data-hardcore-mode="true" pressed={false} onPressedChange={() => {}}>
        Rust
      </Toggle>,
    );
    const hardcoreToggle = screen.getByRole('button', { name: 'Rust' });
    fireEvent.click(hardcoreToggle);
    expect(hardcoreToggle.getAttribute('data-theme-signature')).toBe('wasteland-rusted-stick');

    act(() => {
      vi.advanceTimersByTime(320);
    });
    expect(hardcoreToggle.getAttribute('data-theme-signature')).not.toBe('wasteland-rusted-stick');
  });

  it('fires crack-bleed signature only on explicit glow events and suppresses it under reduced mode', () => {
    vi.useFakeTimers();
    renderInWastelandTheme(<Button disableRipple>No Glow</Button>);
    const plain = screen.getByRole('button', { name: 'No Glow' });
    fireEvent.mouseDown(plain);
    expect(plain.getAttribute('data-theme-signature')).not.toBe('wasteland-crack-bleed');

    renderInWastelandTheme(
      <Button disableRipple data-glow-event="true">
        Glow
      </Button>,
    );
    const glow = screen.getByRole('button', { name: 'Glow' });
    fireEvent.mouseDown(glow);
    expect(glow.getAttribute('data-theme-signature')).toBe('wasteland-crack-bleed');

    act(() => {
      vi.advanceTimersByTime(320);
    });
    expect(glow.getAttribute('data-theme-signature')).not.toBe('wasteland-crack-bleed');

    document.documentElement.setAttribute('data-motion-mode', 'off');
    fireEvent.mouseDown(glow);
    expect(glow.getAttribute('data-theme-signature')).not.toBe('wasteland-crack-bleed');
  });
});
