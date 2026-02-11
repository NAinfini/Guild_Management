import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = path.resolve(__dirname, '../../src/theme');

describe('neo-brutalism hover motion', () => {
  it('does not apply brutal-pop animation to base ui hover selectors', () => {
    const css = fs.readFileSync(path.join(themeRoot, 'effects.css'), 'utf8');
    expect(css).not.toContain('[data-theme="neo-brutalism"] :is(.ui-button, .ui-card, .ui-table):hover');
  });
});

