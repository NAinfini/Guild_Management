import { THEME_COLOR_PRESET_LIST } from '../apps/portal/src/theme/tokens.ts';

const LIGHT_COLOR_THEMES = new Set(['default-violet', 'chinese-ink', 'soft-pink']);

function parseColor(input) {
  const value = input.trim().toLowerCase();

  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const [r, g, b, a = 'f'] = hex.split('');
      return {
        r: parseInt(`${r}${r}`, 16),
        g: parseInt(`${g}${g}`, 16),
        b: parseInt(`${b}${b}`, 16),
        a: parseInt(`${a}${a}`, 16) / 255,
      };
    }

    if (hex.length === 6 || hex.length === 8) {
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a,
      };
    }
  }

  const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/);
  if (rgbMatch?.[1]) {
    const [r = '0', g = '0', b = '0', a = '1'] = rgbMatch[1].split(',').map((v) => v.trim());
    return {
      r: Number.parseFloat(r),
      g: Number.parseFloat(g),
      b: Number.parseFloat(b),
      a: Number.parseFloat(a),
    };
  }

  throw new Error(`Unsupported color format: ${input}`);
}

function toLinearChannel(channel) {
  const normalized = channel / 255;
  if (normalized <= 0.03928) return normalized / 12.92;
  return ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  const r = toLinearChannel(color.r);
  const g = toLinearChannel(color.g);
  const b = toLinearChannel(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function composite(foreground, background) {
  const alpha = Number.isFinite(foreground.a) ? foreground.a : 1;
  if (alpha >= 1) {
    return { r: foreground.r, g: foreground.g, b: foreground.b, a: 1 };
  }

  return {
    r: Math.round(foreground.r * alpha + background.r * (1 - alpha)),
    g: Math.round(foreground.g * alpha + background.g * (1 - alpha)),
    b: Math.round(foreground.b * alpha + background.b * (1 - alpha)),
    a: 1,
  };
}

function alphaColor(baseColor, alphaValue) {
  const parsed = parseColor(baseColor);
  return { ...parsed, a: alphaValue };
}

function check(min, ratio, message, bucket) {
  if (ratio < min) {
    bucket.push(`${message}: ${ratio.toFixed(2)} (< ${min})`);
  }
}

const failures = [];
const warnings = [];

for (const preset of THEME_COLOR_PRESET_LIST) {
  const palette = preset.palette;
  const mode = LIGHT_COLOR_THEMES.has(preset.id) ? 'light' : 'dark';

  const bgDefault = parseColor(palette.background.default);
  const bgPaper = parseColor(palette.background.paper);

  const primaryMain = parseColor(palette.primary.main);
  const primaryText = parseColor(palette.primary.contrastText);
  const secondaryMain = parseColor(palette.secondary.main);
  const secondaryText = parseColor(palette.secondary.contrastText);
  const textPrimary = parseColor(palette.text.primary);
  const textSecondary = parseColor(palette.text.secondary);
  const textDisabled = parseColor(palette.text.disabled);

  const hoverOverlay = alphaColor(palette.primary.main, mode === 'dark' ? 0.86 : 0.92);
  const activeOverlay = alphaColor(palette.primary.main, mode === 'dark' ? 0.74 : 0.9);
  const buttonHoverBg = composite(hoverOverlay, bgPaper);
  const buttonActiveBg = composite(activeOverlay, bgPaper);

  check(4.5, contrastRatio(primaryText, primaryMain), `[${preset.id}] primary.contrastText on primary.main`, failures);
  check(4.5, contrastRatio(secondaryText, secondaryMain), `[${preset.id}] secondary.contrastText on secondary.main`, failures);
  check(4.5, contrastRatio(textPrimary, bgDefault), `[${preset.id}] text.primary on background.default`, failures);
  check(4.5, contrastRatio(textPrimary, bgPaper), `[${preset.id}] text.primary on background.paper`, failures);
  check(4.5, contrastRatio(primaryText, buttonHoverBg), `[${preset.id}] button text on hover background`, failures);
  check(4.5, contrastRatio(primaryText, buttonActiveBg), `[${preset.id}] button text on active background`, failures);

  check(4.5, contrastRatio(textSecondary, bgDefault), `[${preset.id}] text.secondary on background.default`, warnings);
  check(3, contrastRatio(textDisabled, bgPaper), `[${preset.id}] text.disabled on background.paper`, warnings);

  const tones = ['success', 'warning', 'error', 'info'];
  for (const tone of tones) {
    const statusFg = parseColor(palette.statusFg[tone]);
    const statusBg = parseColor(palette.statusBg[tone]);
    check(4.5, contrastRatio(statusFg, statusBg), `[${preset.id}] statusFg.${tone} on statusBg.${tone}`, failures);
  }
}

if (warnings.length > 0) {
  console.log('Warnings (non-blocking):');
  warnings.forEach((warning) => console.log(`- ${warning}`));
  console.log('');
}

if (failures.length > 0) {
  console.error('Contrast audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Contrast audit passed for ${THEME_COLOR_PRESET_LIST.length} theme color presets.`);
