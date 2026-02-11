import { describe, expect, it } from 'vitest';

describe('legacy root component paths', () => {
  it('resolve moved component modules from root compatibility paths', async () => {
    await expect(import('@/components/layout/PageFilterBar')).resolves.toBeDefined();
    await expect(import('@/components/feedback/Skeleton')).resolves.toBeDefined();
    await expect(import('@/components/data-display/MarkdownRenderer')).resolves.toBeDefined();
    await expect(import('@/components/input/TiptapEditor')).resolves.toBeDefined();
    await expect(import('@/components/advanced/MediaUpload')).resolves.toBeDefined();
    await expect(import('@/components/advanced/MediaReorder')).resolves.toBeDefined();
  }, 30000);
});
