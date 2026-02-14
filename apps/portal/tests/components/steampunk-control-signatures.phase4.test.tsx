import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Slider } from '@/components/input/Slider';
import { Toggle } from '@/components/input/Toggle';

function renderInSteampunkTheme(node: React.ReactNode) {
  return render(<div data-theme="steampunk">{node}</div>);
}

describe('steampunk control signatures', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute('data-reduced-motion');
    document.documentElement.removeAttribute('data-motion-mode');
  });

  it('triggers lever recoil and brief steam puff on toggle ON', () => {
    vi.useFakeTimers();
    renderInSteampunkTheme(<Toggle pressed={false} onPressedChange={() => {}}>Valve</Toggle>);

    const toggle = screen.getByRole('button', { name: 'Valve' });
    fireEvent.click(toggle);

    expect(toggle.getAttribute('data-theme-signature')).toBe('lever-recoil');
    expect(toggle.getAttribute('data-steampunk-steam-puff')).toBe('true');

    act(() => {
      vi.advanceTimersByTime(320);
    });

    expect(toggle.getAttribute('data-theme-signature')).not.toBe('lever-recoil');
    expect(toggle.getAttribute('data-steampunk-steam-puff')).not.toBe('true');
  });

  it('suppresses steam puff and pressure vibration markers under reduced motion', () => {
    vi.useFakeTimers();
    document.documentElement.setAttribute('data-motion-mode', 'off');

    const { container } = renderInSteampunkTheme(
      <Slider value={20} min={0} max={100} onChange={() => {}} onChangeCommitted={() => {}} />,
    );
    const slider = container.querySelector('.MuiSlider-root') as HTMLElement | null;
    expect(slider).toBeTruthy();

    fireEvent.mouseDown(slider!);
    fireEvent.mouseUp(slider!);
    fireEvent.blur(slider!);

    expect(slider?.getAttribute('data-theme-signature')).not.toBe('pressure-vibrate');

    renderInSteampunkTheme(<Toggle pressed={false} onPressedChange={() => {}}>Steam</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Steam' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('data-steampunk-steam-puff')).not.toBe('true');
  });

  it('marks pressure-gauge vibration for rapid slider interaction and settles', () => {
    vi.useFakeTimers();
    const { container } = renderInSteampunkTheme(
      <Slider value={35} min={0} max={100} onChange={() => {}} onChangeCommitted={() => {}} />,
    );
    const slider = container.querySelector('.MuiSlider-root') as HTMLElement | null;
    expect(slider).toBeTruthy();

    fireEvent.mouseDown(slider!);
    fireEvent.mouseUp(slider!);

    expect(slider?.getAttribute('data-theme-signature')).toBe('pressure-vibrate');
    act(() => {
      vi.advanceTimersByTime(320);
    });
    expect(slider?.getAttribute('data-theme-signature')).not.toBe('pressure-vibrate');
  });
});
