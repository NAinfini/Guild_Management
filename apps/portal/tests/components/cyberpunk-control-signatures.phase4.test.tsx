import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/button/Button';
import { Toggle } from '@/components/input/Toggle';

function renderInCyberpunkTheme(node: React.ReactNode) {
  return render(<div data-theme="cyberpunk">{node}</div>);
}

describe('cyberpunk control signatures', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers border-hunt button signature for ~200ms then settles', () => {
    vi.useFakeTimers();
    renderInCyberpunkTheme(<Button disableRipple>Hack</Button>);

    const button = screen.getByRole('button', { name: 'Hack' });
    fireEvent.mouseDown(button);
    expect(button.getAttribute('data-theme-signature')).toBe('cyber-border-hunt');

    act(() => {
      vi.advanceTimersByTime(260);
    });
    expect(button.getAttribute('data-theme-signature')).not.toBe('cyber-border-hunt');
  });

  it('triggers localized scanline sweep on toggle ON', () => {
    vi.useFakeTimers();
    renderInCyberpunkTheme(<Toggle pressed={false} onPressedChange={() => {}}>Grid</Toggle>);

    const toggle = screen.getByRole('button', { name: 'Grid' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('data-theme-signature')).toBe('scanline-sweep');

    act(() => {
      vi.advanceTimersByTime(260);
    });
    expect(toggle.getAttribute('data-theme-signature')).not.toBe('scanline-sweep');
  });
});
