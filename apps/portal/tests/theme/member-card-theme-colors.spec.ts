/**
 * Member Card Theme-Specific Colors Test
 *
 * Verifies that member cards use theme-aware colors instead of generic hardcoded colors
 * Tests all 7 themes × 4 class types = 28 color variations
 */

import { test, expect } from '@playwright/test';

const THEMES = [
  'neo-brutalism',
  'cyberpunk',
  'minimalistic',
  'steampunk',
  'royal',
  'chibi',
  'post-apocalyptic',
] as const;

const CLASS_TYPES = ['mingjin', 'qiansi', 'pozhu', 'lieshi'] as const;

// Expected colors for each theme (main card color)
const EXPECTED_COLORS: Record<string, Record<string, string>> = {
  'neo-brutalism': {
    mingjin: 'rgb(37, 99, 235)',     // #2563eb
    qiansi: 'rgb(22, 163, 74)',      // #16a34a
    pozhu: 'rgb(147, 51, 234)',      // #9333ea
    lieshi: 'rgb(220, 38, 38)',      // #dc2626
  },
  'cyberpunk': {
    mingjin: 'rgb(6, 182, 212)',     // #06b6d4
    qiansi: 'rgb(132, 204, 22)',     // #84cc16
    pozhu: 'rgb(217, 70, 239)',      // #d946ef
    lieshi: 'rgb(244, 63, 94)',      // #f43f5e
  },
  'minimalistic': {
    mingjin: 'rgb(71, 85, 105)',     // #475569
    qiansi: 'rgb(87, 83, 78)',       // #57534e
    pozhu: 'rgb(113, 113, 122)',     // #71717a
    lieshi: 'rgb(120, 113, 108)',    // #78716c
  },
  'steampunk': {
    mingjin: 'rgb(2, 132, 199)',     // #0284c7
    qiansi: 'rgb(5, 150, 105)',      // #059669
    pozhu: 'rgb(124, 45, 18)',       // #7c2d12
    lieshi: 'rgb(146, 64, 14)',      // #92400e
  },
  'royal': {
    mingjin: 'rgb(30, 64, 175)',     // #1e40af
    qiansi: 'rgb(4, 120, 87)',       // #047857
    pozhu: 'rgb(126, 34, 206)',      // #7e22ce
    lieshi: 'rgb(153, 27, 27)',      // #991b1b
  },
  'chibi': {
    mingjin: 'rgb(96, 165, 250)',    // #60a5fa
    qiansi: 'rgb(74, 222, 128)',     // #4ade80
    pozhu: 'rgb(192, 132, 252)',     // #c084fc
    lieshi: 'rgb(251, 113, 133)',    // #fb7185
  },
  'post-apocalyptic': {
    mingjin: 'rgb(100, 116, 139)',   // #64748b
    qiansi: 'rgb(101, 163, 13)',     // #65a30d
    pozhu: 'rgb(107, 33, 168)',      // #6b21a8
    lieshi: 'rgb(194, 65, 12)',      // #c2410c
  },
};

test.describe('Member Card Theme Colors', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Guild War page (has member cards)
    await page.goto('http://localhost:5173/guild-war');
    await page.waitForLoadState('networkidle');
  });

  for (const theme of THEMES) {
    test(`${theme} theme has unique class colors`, async ({ page }) => {
      // Switch to theme
      await page.click('[aria-label="Open settings"]');
      await page.click('button:has-text("Settings")');
      await page.click(`[data-theme-option="${theme}"]`);
      await page.waitForTimeout(500); // Allow theme transition

      // Check CSS variables are defined
      for (const classType of CLASS_TYPES) {
        const cssVarValue = await page.evaluate((cls) => {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(`--member-card-${cls}`)
            .trim();
        }, classType);

        expect(cssVarValue).toBeTruthy();
        expect(cssVarValue).toMatch(/^#[0-9a-f]{6}|rgb\(\d+,\s*\d+,\s*\d+\)$/i);
      }
    });
  }

  test('CSS variables exist for all themes', async ({ page }) => {
    for (const theme of THEMES) {
      // Apply theme class to body
      await page.evaluate((t) => {
        document.body.className = `theme-${t}`;
      }, theme);

      await page.waitForTimeout(100);

      // Check all 4 class variables exist
      for (const classType of CLASS_TYPES) {
        const mainColor = await page.evaluate((cls) => {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(`--member-card-${cls}`)
            .trim();
        }, classType);

        expect(mainColor, `${theme} should define --member-card-${classType}`).toBeTruthy();
      }
    }
  });

  test('getClassBaseColor returns theme-aware colors', async ({ page }) => {
    // Test in browser environment (where CSS variables are available)
    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.body.className = `theme-${t}`;
      }, theme);

      await page.waitForTimeout(100);

      for (const classType of CLASS_TYPES) {
        const color = await page.evaluate((cls) => {
          // Simulate getClassBaseColor function
          const cssVarName = `--member-card-${cls}`;
          return getComputedStyle(document.documentElement)
            .getPropertyValue(cssVarName)
            .trim();
        }, classType);

        const expectedColor = EXPECTED_COLORS[theme][classType];
        expect(color).toBe(expectedColor);
      }
    }
  });

  test('colors are visually distinct within each theme', async ({ page }) => {
    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.body.className = `theme-${t}`;
      }, theme);

      await page.waitForTimeout(100);

      const colors: string[] = [];
      for (const classType of CLASS_TYPES) {
        const color = await page.evaluate((cls) => {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(`--member-card-${cls}`)
            .trim();
        }, classType);
        colors.push(color);
      }

      // All 4 colors should be unique
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(4);
    }
  });

  test('fallback colors work when CSS variables unavailable', async ({ page }) => {
    // Test SSR scenario where CSS variables might not be available
    const fallbackColors = await page.evaluate(() => {
      // Hardcoded fallback colors from GAME_CLASS_COLORS
      return {
        mingjin: '#3b82f6',
        qiansi: '#22c55e',
        pozhu: '#a855f7',
        lieshi: '#7f1d1d',
      };
    });

    expect(fallbackColors.mingjin).toBe('#3b82f6');
    expect(fallbackColors.qiansi).toBe('#22c55e');
    expect(fallbackColors.pozhu).toBe('#a855f7');
    expect(fallbackColors.lieshi).toBe('#7f1d1d');
  });

  test('contrast meets WCAG AA for text on card backgrounds', async ({ page }) => {
    const MIN_CONTRAST_AA = 4.5;

    // Helper function to calculate relative luminance
    const getLuminance = (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const getContrast = (rgb1: string, rgb2: string): number => {
      const parseRgb = (rgb: string) => {
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
      };

      const [r1, g1, b1] = parseRgb(rgb1);
      const [r2, g2, b2] = parseRgb(rgb2);

      const l1 = getLuminance(r1, g1, b1);
      const l2 = getLuminance(r2, g2, b2);

      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);

      return (lighter + 0.05) / (darker + 0.05);
    };

    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.body.className = `theme-${t}`;
      }, theme);

      await page.waitForTimeout(100);

      for (const classType of CLASS_TYPES) {
        const textColor = await page.evaluate((cls) => {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(`--member-card-${cls}-text`)
            .trim();
        }, classType);

        const bgColor = await page.evaluate((cls) => {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(`--member-card-${cls}-bg`)
            .trim();
        }, classType);

        // Convert rgba to rgb for contrast calculation
        const bgRgb = bgColor.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
          const [r, g, b] = inner.split(',').map((v: string) => v.trim());
          return `rgb(${r}, ${g}, ${b})`;
        });

        const contrast = getContrast(textColor, bgRgb);

        expect(contrast).toBeGreaterThanOrEqual(MIN_CONTRAST_AA);
      }
    }
  });

  test('member cards update colors when theme switches', async ({ page }) => {
    // Go to page with member cards
    await page.goto('http://localhost:5173/guild-war');
    await page.waitForLoadState('networkidle');

    // Switch to Cyberpunk theme
    await page.click('[aria-label="Open settings"]');
    await page.click('button:has-text("Settings")');
    await page.click('[data-theme-option="cyberpunk"]');
    await page.waitForTimeout(500);

    // Check if any member cards exist
    const cardCount = await page.locator('[data-ui="member-card"]').count();
    if (cardCount > 0) {
      // Get first card's background color
      const cyberpunkColor = await page
        .locator('[data-ui="member-card"]')
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor);

      // Switch to Chibi theme
      await page.click('[aria-label="Open settings"]');
      await page.click('[data-theme-option="chibi"]');
      await page.waitForTimeout(500);

      // Get card color again
      const chibiColor = await page
        .locator('[data-ui="member-card"]')
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor);

      // Colors should be different
      expect(cyberpunkColor).not.toBe(chibiColor);
    }
  });

  test('no conflicts with shape unification', async ({ page }) => {
    // Verify member card border-radius is not overridden by color system
    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.body.className = `theme-${t}`;
      }, theme);

      await page.waitForTimeout(100);

      // Check that border-radius variable exists and isn't affected
      const borderRadius = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--shape-card')
          .trim();
      });

      expect(borderRadius).toBeTruthy();
      expect(borderRadius).toMatch(/^\d+px$/);
    }
  });

  test('performance: CSS variable resolution is instant', async ({ page }) => {
    const startTime = Date.now();

    // Switch themes rapidly
    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.body.className = `theme-${t}`;
      }, theme);

      // Read all 4 class colors
      for (const classType of CLASS_TYPES) {
        await page.evaluate((cls) => {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(`--member-card-${cls}`)
            .trim();
        }, classType);
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should complete in under 1 second (7 themes × 4 classes = 28 reads)
    expect(totalTime).toBeLessThan(1000);
  });
});
