import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('accessibility enhancements selectors', () => {
  it('avoids broad class-fragment selectors that can style nested MUI internals', () => {
    const cssPath = resolve(process.cwd(), 'apps/portal/src/theme/accessibility-enhancements.css');
    const css = readFileSync(cssPath, 'utf8');

    expect(css).not.toContain('[class*="Input"]');
    expect(css).not.toContain('[class*="Button"]');
    expect(css).not.toContain('[class*="Card"]');
    expect(css).not.toContain('[class*="input"]');
    expect(css).not.toContain('[class*="button"]');
    expect(css).not.toContain('[class*="card"]');
  });
});
