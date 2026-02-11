import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent } from '@/components/feedback/Dialog';

describe('DialogContent close button visibility', () => {
  it('hides the built-in close button when hideCloseButton is true', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent hideCloseButton>
          <div>content</div>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('renders the built-in close button by default', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent>
          <div>content</div>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});

