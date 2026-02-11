import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LockIcon from '@mui/icons-material/Lock';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { DecorativeBackground } from '@/components';

describe('DecorativeBackground layered composition', () => {
  it('renders layered icon/shape composition with variant overlays', () => {
    const { container } = render(
      <DecorativeBackground
        variant="war-room"
        layers={[
          { id: 'icon-main', icon: TrackChangesIcon, size: 220, opacity: 0.08, top: 0, right: 0 },
          { id: 'orb-support', type: 'orb', size: 180, opacity: 0.18, bottom: -40, left: -20 },
          { id: 'ring-focus', type: 'ring', size: 260, opacity: 0.12, top: 20, left: 40 },
        ]}
      />
    );

    expect(container.querySelector('[data-ui="decorative-background"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-ui-layer]').length).toBe(3);
    expect(container.querySelector('[data-ui-overlay="gradient"]')).toBeInTheDocument();
    expect(container.querySelector('[data-ui-overlay="noise"]')).toBeInTheDocument();
    expect(container.querySelector('[data-ui-layer="ring-focus"]')).toBeInTheDocument();
  });

  it('keeps legacy single-icon API working', () => {
    const { container } = render(
      <DecorativeBackground icon={LockIcon} color="var(--color-status-info)" size={160} opacity={0.05} />
    );

    expect(container.querySelector('[data-ui-layer="legacy-icon"]')).toBeInTheDocument();
    expect(screen.queryByTestId('decorative-background-empty')).not.toBeInTheDocument();
  });

  it('supports drift and parallax motion layers', () => {
    const { container } = render(
      <DecorativeBackground
        motion="parallax"
        layers={[{ id: 'orb-parallax', type: 'orb', size: 200, opacity: 0.2, top: 20, left: 20 }]}
      />
    );

    const root = container.querySelector('[data-ui="decorative-background"]') as HTMLElement;
    const layer = container.querySelector('[data-ui-layer="orb-parallax"]') as HTMLElement;

    expect(root.getAttribute('data-motion')).toBe('parallax');

    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 200,
      bottom: 200,
      width: 200,
      height: 200,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.mouseMove(window, { clientX: 150, clientY: 60 });
    expect(layer.style.transform).toContain('translate3d');
  });

  it('disables motion when reduced-motion preference is active', async () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { container } = render(
      <DecorativeBackground
        motion="reactive"
        layers={[{ id: 'reduce-motion-layer', type: 'ring', size: 180, opacity: 0.15, top: 12, right: 12 }]}
      />
    );

    await waitFor(() => {
      const root = container.querySelector('[data-ui="decorative-background"]');
      expect(root?.getAttribute('data-motion')).toBe('none');
    });

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });
});
