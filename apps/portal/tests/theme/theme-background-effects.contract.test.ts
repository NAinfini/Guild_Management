import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const effectsCssPath = path.resolve(__dirname, '../../src/theme/effects.css');

function readEffectsCss() {
  return fs.readFileSync(effectsCssPath, 'utf8');
}

describe('theme background effects contract', () => {
  it('defines at least one page-level background pseudo-layer for every theme', () => {
    const css = readEffectsCss();
    const themes = [
      'neo-brutalism',
      'steampunk',
      'cyberpunk',
      'post-apocalyptic',
      'chibi',
      'royal',
      'minimalistic',
    ];

    for (const theme of themes) {
      const hasPseudoLayer = new RegExp(`\\[data-theme="${theme}"\\]::(before|after)`).test(css);
      expect(hasPseudoLayer, `Missing page-level pseudo background for ${theme}`).toBe(true);
    }
  });
});

