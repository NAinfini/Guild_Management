/**
 * Visual Audit: Theme Contrast and Control Consistency
 *
 * This test suite audits the portal for:
 * - Contrast ratio compliance (WCAG AA: 4.5:1 text, 3:1 UI components)
 * - Theme token usage vs hardcoded colors
 * - Control visibility across all themes
 * - Color consistency across pages
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Themes to audit
const THEMES = [
  'minimalistic',
  'neo-brutalism',
  'cyberpunk',
  'royal',
  'chibi',
  'steampunk',
  'post-apocalyptic',
] as const;

// Pages to audit
const PAGES = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/members', name: 'Members' },
  { path: '/events', name: 'Events' },
  { path: '/announcements', name: 'Announcements' },
  { path: '/guild-war', name: 'Guild War' },
  { path: '/profile', name: 'Profile' },
  { path: '/settings', name: 'Settings' },
  { path: '/admin', name: 'Admin' },
] as const;

// Critical controls to check
const CRITICAL_CONTROLS = [
  'button',
  'input[type="text"]',
  'input[type="checkbox"]',
  'select',
  '[role="tab"]',
  '[role="switch"]',
  '[role="slider"]',
  '.card',
] as const;

type ContrastIssue = {
  element: string;
  selector: string;
  theme: string;
  page: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
};

type AuditReport = {
  timestamp: string;
  themes: typeof THEMES[number][];
  pages: typeof PAGES;
  contrastIssues: ContrastIssue[];
  missingThemedElements: Array<{
    theme: string;
    page: string;
    selector: string;
    hasHardcodedColor: boolean;
    computedColor: string;
  }>;
  summary: {
    totalChecks: number;
    contrastFailures: number;
    hardcodedColorUsage: number;
    themesAudited: number;
    pagesAudited: number;
  };
};

/**
 * Calculate relative luminance per WCAG formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(rgb1: string, rgb2: string): number {
  const parseRgb = (rgb: string) => {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return [0, 0, 0];
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  };

  const [r1, g1, b1] = parseRgb(rgb1);
  const [r2, g2, b2] = parseRgb(rgb2);

  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color is hardcoded (not using CSS variables)
 */
async function hasHardcodedColor(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;

    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    const borderColor = styles.borderColor;

    // Check if any inline styles use hardcoded colors
    const inlineStyle = (element as HTMLElement).style.cssText;
    const hasInlineColor = /color:\s*(?:rgb|#|hsl)/.test(inlineStyle);

    return hasInlineColor;
  }, selector);
}

/**
 * Get computed colors for an element
 */
async function getElementColors(page: Page, selector: string) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;

    const styles = window.getComputedStyle(element);
    return {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
    };
  }, selector);
}

/**
 * Switch to a specific theme
 */
async function switchTheme(page: Page, theme: string) {
  await page.evaluate((themeName) => {
    // Access the theme controller (assuming it's in window or accessible)
    const themeController = document.querySelector('[data-theme-controller]');
    if (themeController) {
      // Dispatch a custom event or call the theme setter
      window.dispatchEvent(new CustomEvent('set-theme', { detail: themeName }));
    }
    // Also set data attribute for immediate application
    document.documentElement.setAttribute('data-theme', themeName);
  }, theme);

  // Wait for theme transition
  await page.waitForTimeout(500);
}

/**
 * Main audit function
 */
async function auditPageTheme(
  page: Page,
  pageName: string,
  theme: string
): Promise<{
  contrastIssues: ContrastIssue[];
  missingThemedElements: AuditReport['missingThemedElements'];
}> {
  const contrastIssues: ContrastIssue[] = [];
  const missingThemedElements: AuditReport['missingThemedElements'] = [];

  for (const selector of CRITICAL_CONTROLS) {
    const elements = await page.$$(selector);

    for (let i = 0; i < Math.min(elements.length, 5); i++) {
      const elementSelector = `${selector}:nth-of-type(${i + 1})`;

      try {
        const colors = await getElementColors(page, elementSelector);
        if (!colors) continue;

        const hasHardcoded = await hasHardcodedColor(page, elementSelector);

        // Check contrast ratio
        if (colors.color && colors.backgroundColor) {
          const ratio = getContrastRatio(colors.color, colors.backgroundColor);
          const requiredRatio = selector.includes('button') || selector.includes('[role=') ? 3.0 : 4.5;

          if (ratio < requiredRatio) {
            contrastIssues.push({
              element: selector,
              selector: elementSelector,
              theme,
              page: pageName,
              foreground: colors.color,
              background: colors.backgroundColor,
              ratio: Math.round(ratio * 100) / 100,
              required: requiredRatio,
            });
          }
        }

        // Track hardcoded colors
        if (hasHardcoded) {
          missingThemedElements.push({
            theme,
            page: pageName,
            selector: elementSelector,
            hasHardcodedColor: true,
            computedColor: colors.color,
          });
        }
      } catch (error) {
        // Element might not be visible or interactable
        continue;
      }
    }
  }

  return { contrastIssues, missingThemedElements };
}

test.describe('Visual Audit: Theme Contrast and Consistency', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('Full portal audit across all themes', async ({ page }) => {
    const report: AuditReport = {
      timestamp: new Date().toISOString(),
      themes: [...THEMES],
      pages: PAGES,
      contrastIssues: [],
      missingThemedElements: [],
      summary: {
        totalChecks: 0,
        contrastFailures: 0,
        hardcodedColorUsage: 0,
        themesAudited: 0,
        pagesAudited: 0,
      },
    };

    for (const theme of THEMES) {
      console.log(`\n🎨 Auditing theme: ${theme}`);

      // Open settings to change theme
      await page.goto('http://localhost:5173/settings');
      await switchTheme(page, theme);
      report.summary.themesAudited++;

      for (const pageInfo of PAGES) {
        console.log(`  📄 Checking page: ${pageInfo.name}`);

        try {
          await page.goto(`http://localhost:5173${pageInfo.path}`, {
            waitUntil: 'networkidle',
            timeout: 10000
          });

          // Wait for content to render
          await page.waitForTimeout(1000);

          const audit = await auditPageTheme(page, pageInfo.name, theme);

          report.contrastIssues.push(...audit.contrastIssues);
          report.missingThemedElements.push(...audit.missingThemedElements);
          report.summary.totalChecks += CRITICAL_CONTROLS.length;
          report.summary.pagesAudited++;
        } catch (error) {
          console.warn(`    ⚠️  Failed to audit ${pageInfo.name}: ${error}`);
        }
      }
    }

    // Calculate summary
    report.summary.contrastFailures = report.contrastIssues.length;
    report.summary.hardcodedColorUsage = report.missingThemedElements.filter(
      (e) => e.hasHardcodedColor
    ).length;

    // Save report
    const reportDir = path.join(__dirname, '__reports__');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `theme-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable summary
    const summaryPath = path.join(reportDir, `theme-audit-summary-${Date.now()}.md`);
    const summary = generateMarkdownSummary(report);
    fs.writeFileSync(summaryPath, summary);

    console.log(`\n📊 Audit complete! Reports saved:`);
    console.log(`   - ${reportPath}`);
    console.log(`   - ${summaryPath}`);

    // Print summary
    console.log(`\n📋 Summary:`);
    console.log(`   Total checks: ${report.summary.totalChecks}`);
    console.log(`   Themes audited: ${report.summary.themesAudited}`);
    console.log(`   Pages audited: ${report.summary.pagesAudited}`);
    console.log(`   ⚠️  Contrast failures: ${report.summary.contrastFailures}`);
    console.log(`   ⚠️  Hardcoded colors: ${report.summary.hardcodedColorUsage}`);

    // Test should pass but report issues
    expect(report.summary.themesAudited).toBeGreaterThan(0);
    expect(report.summary.pagesAudited).toBeGreaterThan(0);
  });

  test('Quick theme contrast spot check', async ({ page }) => {
    // Quick check on Dashboard with multiple themes
    const results: Array<{ theme: string; issues: number }> = [];

    for (const theme of ['minimalistic', 'cyberpunk', 'royal']) {
      await page.goto('http://localhost:5173/settings');
      await switchTheme(page, theme);

      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(1000);

      const audit = await auditPageTheme(page, 'Dashboard', theme);
      results.push({
        theme,
        issues: audit.contrastIssues.length,
      });
    }

    console.log('\n🚀 Quick spot check results:');
    results.forEach((r) => {
      console.log(`   ${r.theme}: ${r.issues} contrast issues`);
    });

    // Save quick report
    const reportDir = path.join(__dirname, '__reports__');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportDir, `quick-check-${Date.now()}.json`),
      JSON.stringify(results, null, 2)
    );
  });
});

/**
 * Generate a markdown summary from the audit report
 */
function generateMarkdownSummary(report: AuditReport): string {
  let md = '# Theme Visual Audit Report\n\n';
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;

  md += '## Summary\n\n';
  md += `- **Themes Audited:** ${report.summary.themesAudited}\n`;
  md += `- **Pages Audited:** ${report.summary.pagesAudited}\n`;
  md += `- **Total Checks:** ${report.summary.totalChecks}\n`;
  md += `- **Contrast Failures:** ${report.summary.contrastFailures} ⚠️\n`;
  md += `- **Hardcoded Colors:** ${report.summary.hardcodedColorUsage} ⚠️\n\n`;

  // Contrast issues by theme
  md += '## Contrast Issues by Theme\n\n';
  const issuesByTheme = report.contrastIssues.reduce((acc, issue) => {
    acc[issue.theme] = (acc[issue.theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(issuesByTheme)
    .sort(([, a], [, b]) => b - a)
    .forEach(([theme, count]) => {
      md += `- **${theme}**: ${count} issues\n`;
    });

  // Top contrast issues
  md += '\n## Top Contrast Issues\n\n';
  md += '| Element | Theme | Page | Ratio | Required |\n';
  md += '|---------|-------|------|-------|----------|\n';

  report.contrastIssues
    .slice(0, 20)
    .forEach((issue) => {
      md += `| ${issue.element} | ${issue.theme} | ${issue.page} | ${issue.ratio} | ${issue.required} |\n`;
    });

  // Hardcoded color usage by page
  md += '\n## Hardcoded Color Usage by Page\n\n';
  const hardcodedByPage = report.missingThemedElements
    .filter((e) => e.hasHardcodedColor)
    .reduce((acc, el) => {
      acc[el.page] = (acc[el.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  Object.entries(hardcodedByPage)
    .sort(([, a], [, b]) => b - a)
    .forEach(([page, count]) => {
      md += `- **${page}**: ${count} elements with hardcoded colors\n`;
    });

  // Recommendations
  md += '\n## Recommendations\n\n';
  md += '1. **Replace hardcoded colors** with CSS custom properties (--sys-*, --cmp-*)\n';
  md += '2. **Improve contrast ratios** for failed elements:\n';
  md += '   - Text: minimum 4.5:1 (WCAG AA)\n';
  md += '   - UI components: minimum 3:1 (WCAG AA)\n';
  md += '3. **Audit theme-specific overrides** to ensure consistent token usage\n';
  md += '4. **Test with reduced contrast mode** for accessibility\n';
  md += '5. **Use semantic color mappings** for status/outcomes\n\n';

  return md;
}
