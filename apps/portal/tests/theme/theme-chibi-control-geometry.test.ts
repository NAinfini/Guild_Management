import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = path.resolve(__dirname, '../../src/theme');

describe('chibi control geometry', () => {
  it('avoids pill radius and broad control selectors that affect large controls', () => {
    const chibiCss = fs.readFileSync(path.join(themeRoot, 'presets/chibi.css'), 'utf8');
    const effectsCss = fs.readFileSync(path.join(themeRoot, 'effects.css'), 'utf8');

    expect(chibiCss).not.toContain('--cmp-button-radius: 999px;');
    expect(chibiCss).not.toContain(':is(.ui-button, .ui-chip, .ui-nav, .control)');
    expect(effectsCss).not.toContain('[data-theme="chibi"] :is(.ui-button, .ui-chip, .ui-nav, .control):active');
  });
});

