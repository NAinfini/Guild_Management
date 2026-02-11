import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeControllerProvider } from '@/theme/ThemeController';
import {
  NEXUS_CONTROL_CATEGORIES,
  NexusControlStudio,
} from '@/features/Tools/components/NexusControlStudio';

describe('NexusControlStudio header controls and grid layout', () => {
  it('renders theme and color dropdown controls in header', () => {
    render(
      <ThemeControllerProvider>
        <NexusControlStudio />
      </ThemeControllerProvider>,
    );

    expect(screen.getByTestId('nexus-theme-select')).toBeInTheDocument();
    expect(screen.getByTestId('nexus-color-select')).toBeInTheDocument();
  });

  it('renders showcase items in a grid collection', () => {
    render(
      <ThemeControllerProvider>
        <NexusControlStudio />
      </ThemeControllerProvider>,
    );

    const items = screen.getAllByTestId('nexus-showcase-grid-item');
    expect(items.length).toBe(NEXUS_CONTROL_CATEGORIES.length);
  });
});

