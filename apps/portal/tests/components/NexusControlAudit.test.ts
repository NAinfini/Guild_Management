import { describe, expect, it } from 'vitest';
import { NEXUS_CONTROL_CATEGORIES } from '@/features/Tools/components/NexusControlStudio';

describe('NexusControlStudio', () => {
  it('exports control categories from Tools feature', () => {
    expect(NEXUS_CONTROL_CATEGORIES).toBeDefined();
    expect(Array.isArray(NEXUS_CONTROL_CATEGORIES)).toBe(true);
  });

  it('includes all core control categories', () => {
    const categoryIds = NEXUS_CONTROL_CATEGORIES.map((category) => category.id);

    // Core categories that should be present
    const coreCategories = [
      'cards',
      'buttons',
      'text-input',
      'choice-controls',
      'dropdown-select',
      'range-controls',
      'navigation',
      'feedback',
    ];

    coreCategories.forEach((id) => {
      expect(categoryIds).toContain(id);
    });
  });

  it('has valid category structure', () => {
    expect(NEXUS_CONTROL_CATEGORIES.length).toBeGreaterThanOrEqual(10);

    NEXUS_CONTROL_CATEGORIES.forEach((category) => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('label');
      expect(category).toHaveProperty('component');
      expect(typeof category.id).toBe('string');
      expect(typeof category.label).toBe('string');
      expect(typeof category.component).toBe('function');
    });
  });
});
