import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/button/Button';

describe('Button disabled visibility', () => {
  it('does not rely on blanket disabled opacity utility that fades labels too much', () => {
    render(<Button disabled>Create Event</Button>);
    const button = screen.getByRole('button', { name: 'Create Event' });

    expect(button.className).not.toContain('disabled:opacity-50');
  });
});
