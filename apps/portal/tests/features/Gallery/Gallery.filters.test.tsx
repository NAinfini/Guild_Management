import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

const captured = vi.hoisted(() => ({
  pageFilterProps: null as any,
  listSpy: vi.fn(),
}));

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', role: 'member' },
    viewRole: null,
  }),
  useUIStore: () => ({
    setPageTitle: vi.fn(),
  }),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => {
    options.queryFn?.();
    return {
      data: {
        images: [],
        pagination: { total: 0, pages: 1 },
      },
      isLoading: false,
    };
  },
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock('@/components', () => ({
  CardGridSkeleton: () => <div data-testid="gallery-skeleton" />,
  PageFilterBar: (props: any) => {
    captured.pageFilterProps = props;
    return <div data-testid="page-filter-bar" />;
  },
}));

vi.mock('@/lib/api/gallery', () => ({
  galleryAPI: {
    list: captured.listSpy.mockResolvedValue({
      images: [],
      pagination: { total: 0, pages: 1 },
    }),
    delete: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/lib/api/media', () => ({
  mediaAPI: {
    uploadImage: vi.fn(),
  },
}));

import { Gallery } from '@/features/Gallery';

describe('Gallery filters', () => {
  it('uses only search and date range filters without category chips or category param', () => {
    render(<Gallery />);

    expect(captured.pageFilterProps.categories).toBeUndefined();
    expect(captured.pageFilterProps.category).toBeUndefined();
    expect(captured.pageFilterProps.onCategoryChange).toBeUndefined();

    expect(captured.listSpy).toHaveBeenCalledTimes(1);
    const requestParams = captured.listSpy.mock.calls[0][0];
    expect(requestParams).not.toHaveProperty('category');
  });
});
