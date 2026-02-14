import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeControllerProvider } from '@/theme/ThemeController';
import { NexusControlStudio } from '@/features/Tools/components/NexusControlStudio';

describe('NexusControlStudio theme isolation', () => {
  it('does not mutate global website theme when studio theme changes', async () => {
    const user = userEvent.setup();

    render(
      <ThemeControllerProvider>
        <NexusControlStudio />
      </ThemeControllerProvider>,
    );

    const initialTheme = document.documentElement.getAttribute('data-theme');
    expect(initialTheme).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /visual theme/i }));
    await user.click(screen.getByRole('option', { name: /cyberpunk/i }));

    expect(document.documentElement.getAttribute('data-theme')).toBe(initialTheme);
  });
});
