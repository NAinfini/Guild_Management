import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = path.resolve(__dirname, '../../src/theme');

function readThemeFile(relativePath: string) {
  return fs.readFileSync(path.join(themeRoot, relativePath), 'utf8');
}

describe('theme motion contract', () => {
  it('uses theme motion variables in shared component interactions', () => {
    const css = readThemeFile('presets/_interactions-base.css');

    expect(css).toContain('var(--theme-motion-fast');
    expect(css).toContain('var(--theme-motion-easing');
    expect(css).toContain('var(--theme-motion-hover-lift');
    expect(css).toContain('var(--theme-motion-press-scale');
  });

  it('defines per-theme motion profile tokens in every theme preset', () => {
    const presets = [
      'presets/neo-brutalism.css',
      'presets/steampunk.css',
      'presets/cyberpunk.css',
      'presets/post-apocalyptic.css',
      'presets/chibi.css',
      'presets/royal.css',
      'presets/minimalistic.css',
    ];

    for (const presetPath of presets) {
      const css = readThemeFile(presetPath);
      expect(css, `${presetPath} should define --theme-motion-fast`).toContain('--theme-motion-fast:');
      expect(css, `${presetPath} should define --theme-motion-easing`).toContain('--theme-motion-easing:');
      expect(css, `${presetPath} should define --theme-motion-hover-lift`).toContain('--theme-motion-hover-lift:');
      expect(css, `${presetPath} should define --theme-motion-press-scale`).toContain('--theme-motion-press-scale:');
    }
  });
});
