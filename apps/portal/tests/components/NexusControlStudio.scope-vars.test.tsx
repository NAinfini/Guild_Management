import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeControllerProvider } from '@/theme/ThemeController';
import { NexusControlStudio } from '@/features/Tools/components/NexusControlStudio';

describe('NexusControlStudio style scope', () => {
  it('does not override theme motion/shape css variables inline', () => {
    const { container } = render(
      <ThemeControllerProvider>
        <NexusControlStudio />
      </ThemeControllerProvider>
    );

    const scope = container.querySelector('.nexus-control-scope') as HTMLElement | null;
    expect(scope).not.toBeNull();
    expect(scope!.style.getPropertyValue('--theme-duration')).toBe('');
    expect(scope!.style.getPropertyValue('--theme-border-width')).toBe('');
    expect(scope!.style.getPropertyValue('--theme-border-radius')).toBe('');
  });
});

