import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = path.resolve(__dirname, '../../src/theme');

describe('chibi control geometry', () => {
  it('avoids pill radius and broad control selectors that affect large controls', () => {
    const chibiCss = fs.readFileSync(path.join(themeRoot, 'presets/chibi.css'), 'utf8');
    const effectsCss = fs.readFileSync(path.join(themeRoot, 'effects.css'), 'utf8');
    const tokensTs = fs.readFileSync(path.join(themeRoot, 'tokens.ts'), 'utf8');

    expect(chibiCss).not.toContain('--cmp-button-radius: 999px;');
    expect(chibiCss).not.toContain(':is(.ui-button, .ui-chip, .ui-nav, .control)');
    expect(effectsCss).not.toContain('[data-theme="chibi"] :is(.ui-button, .ui-chip, .ui-nav, .control):active');

    const chibiShapeMatch = tokensTs.match(
      /CHIBI_VISUAL_SPEC[\s\S]*?shape:\s*\{\s*borderRadius:\s*(\d+),\s*buttonRadius:\s*(\d+),\s*inputRadius:\s*(\d+)\s*\}/,
    );

    expect(chibiShapeMatch).toBeTruthy();
    const borderRadius = Number(chibiShapeMatch?.[1] ?? 0);
    const buttonRadius = Number(chibiShapeMatch?.[2] ?? 0);
    const inputRadius = Number(chibiShapeMatch?.[3] ?? 0);

    expect(borderRadius).toBeLessThanOrEqual(16);
    expect(buttonRadius).toBeLessThanOrEqual(14);
    expect(inputRadius).toBeLessThanOrEqual(14);
  });
});

