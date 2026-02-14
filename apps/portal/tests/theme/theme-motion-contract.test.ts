import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { THEME_VISUAL_SPEC_LIST } from '@/theme/tokens';

const themeRoot = path.resolve(__dirname, '../../src/theme');

function readThemeFile(relativePath: string) {
  return fs.readFileSync(path.join(themeRoot, relativePath), 'utf8');
}

describe('theme motion contract', () => {
  it('uses theme motion variables in shared component interactions', () => {
    const css = readThemeFile('presets/_interactions-base.css');

    expect(css).toContain('--interaction-fast:');
    expect(css).toContain('--interaction-med:');
    expect(css).toContain('--interaction-slow:');
    expect(css).toContain('--interaction-ease:');
    expect(css).toContain('--interaction-hover-lift:');
    expect(css).toContain('--interaction-card-lift:');
    expect(css).toContain('--interaction-input-lift:');
    expect(css).toContain('--interaction-press-scale:');
    expect(css).toContain('--interaction-press-y:');
    expect(css).toContain('--interaction-focus-ring-color:');
    expect(css).toContain('--interaction-focus-ring-width:');
    expect(css).toContain('--interaction-focus-ring-glow:');
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

  it('defines fx capability flags for every visual theme spec', () => {
    for (const spec of THEME_VISUAL_SPEC_LIST) {
      expect(spec.capabilities).toBeDefined();
      expect(typeof spec.capabilities.hasAnimatedBackground).toBe('boolean');
      expect(typeof spec.capabilities.hasMascot).toBe('boolean');
      expect([0, 1, 2, 3]).toContain(spec.capabilities.fxQuality);
      expect(['css', 'canvas']).toContain(spec.capabilities.backgroundMode);
    }
  });
});
