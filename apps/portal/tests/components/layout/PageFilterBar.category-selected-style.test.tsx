import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageFilterBar } from '@/components/layout/PageFilterBar';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

describe('PageFilterBar selected category styling', () => {
  it('keeps selected category text readable via explicit token color', () => {
    render(
      <PageFilterBar
        category="all"
        categories={[
          { value: 'all', label: 'All Events' },
          { value: 'war', label: 'War' },
        ]}
      />
    );

    const selected = screen.getByRole('button', { name: 'All Events' });
    expect(selected).toHaveStyle({ color: 'var(--sys-text-primary)' });
  });
});
