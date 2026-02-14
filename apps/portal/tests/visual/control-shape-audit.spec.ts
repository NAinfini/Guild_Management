/**
 * Control Shape & Clipping Audit
 *
 * This test checks:
 * - Border-radius consistency across similar controls
 * - Overflow/clipping issues (overflow: hidden vs visible)
 * - Container vs child shape mismatches
 * - Shadow clipping issues
 * - Content bleeding outside bounds
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const THEMES = [
  'minimalistic',
  'neo-brutalism',
  'cyberpunk',
  'royal',
  'chibi',
  'steampunk',
  'post-apocalyptic',
] as const;

const PAGES = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/members', name: 'Members' },
  { path: '/events', name: 'Events' },
  { path: '/guild-war', name: 'Guild War' },
  { path: '/profile', name: 'Profile' },
  { path: '/settings', name: 'Settings' },
] as const;

type ControlShape = {
  selector: string;
  borderRadius: string;
  overflow: string;
  clipPath: string;
  boxShadow: string;
  hasClipping: boolean;
  childrenClipped: boolean;
};

type ShapeIssue = {
  theme: string;
  page: string;
  control: string;
  issue: string;
  expected: string;
  actual: string;
  severity: 'critical' | 'warning' | 'info';
};

/**
 * Get computed shape properties for a control
 */
async function getControlShape(page: Page, selector: string): Promise<ControlShape | null> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;

    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    // Check if children are being clipped
    let childrenClipped = false;
    if (element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        const childRect = child.getBoundingClientRect();

        // Check if child extends beyond parent
        if (
          childRect.left < rect.left ||
          childRect.right > rect.right ||
          childRect.top < rect.top ||
          childRect.bottom > rect.bottom
        ) {
          childrenClipped = true;
          break;
        }
      }
    }

    return {
      selector: sel,
      borderRadius: styles.borderRadius,
      overflow: styles.overflow,
      clipPath: styles.clipPath,
      boxShadow: styles.boxShadow,
      hasClipping: styles.overflow !== 'visible',
      childrenClipped,
    };
  }, selector);
}

/**
 * Parse border-radius value to numeric pixels
 */
function parseBorderRadius(value: string): number {
  if (value === '0px' || value === 'none') return 0;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Check if two border-radius values are similar (within 2px)
 */
function radiusIsSimilar(a: string, b: string): boolean {
  const aVal = parseBorderRadius(a);
  const bVal = parseBorderRadius(b);
  return Math.abs(aVal - bVal) <= 2;
}

/**
 * Audit control shapes on a page
 */
async function auditPageShapes(
  page: Page,
  pageName: string,
  theme: string
): Promise<ShapeIssue[]> {
  const issues: ShapeIssue[] = [];

  // Define control groups that should have consistent shapes
  const controlGroups = [
    {
      name: 'Buttons',
      selectors: [
        'button[type="submit"]',
        'button[type="button"]:not([aria-label*="icon"])',
        '.MuiButton-root:not(.MuiIconButton-root)',
      ],
      expectedRadius: 'var(--cmp-button-radius)',
    },
    {
      name: 'Icon Buttons',
      selectors: [
        'button[aria-label*="icon"]',
        '.MuiIconButton-root',
        '[data-ui="icon-button"]',
      ],
      expectedRadius: '50%', // Circular
    },
    {
      name: 'Input Fields',
      selectors: [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="password"]',
        '.MuiOutlinedInput-root',
        '[data-ui="input"]',
      ],
      expectedRadius: 'var(--cmp-input-radius)',
    },
    {
      name: 'Cards',
      selectors: [
        '.card',
        '[data-ui="card"]',
        '.MuiCard-root',
      ],
      expectedRadius: 'var(--cmp-card-radius)',
    },
    {
      name: 'Dialogs',
      selectors: [
        '.MuiDialog-paper',
        '[role="dialog"]',
      ],
      expectedRadius: 'var(--cmp-dialog-radius)',
    },
    {
      name: 'Chips/Badges',
      selectors: [
        '.MuiChip-root',
        '[data-ui="chip"]',
        '[data-ui="badge"]',
      ],
      expectedRadius: '999px', // Pill shape
    },
  ];

  for (const group of controlGroups) {
    const shapes: ControlShape[] = [];

    for (const selector of group.selectors) {
      const elements = await page.$$(selector);

      for (let i = 0; i < Math.min(elements.length, 3); i++) {
        const shape = await getControlShape(page, `${selector}:nth-of-type(${i + 1})`);
        if (shape) {
          shapes.push(shape);
        }
      }
    }

    // Check consistency within group
    if (shapes.length > 1) {
      const firstRadius = shapes[0].borderRadius;

      for (let i = 1; i < shapes.length; i++) {
        if (!radiusIsSimilar(firstRadius, shapes[i].borderRadius)) {
          issues.push({
            theme,
            page: pageName,
            control: `${group.name} #${i}`,
            issue: 'Inconsistent border-radius within group',
            expected: firstRadius,
            actual: shapes[i].borderRadius,
            severity: 'warning',
          });
        }
      }
    }

    // Check for clipping issues
    for (const shape of shapes) {
      // Shadow clipping
      if (shape.boxShadow !== 'none' && shape.hasClipping) {
        issues.push({
          theme,
          page: pageName,
          control: shape.selector,
          issue: 'Shadow clipped by overflow:hidden',
          expected: 'overflow: visible or use inset shadows',
          actual: `overflow: ${shape.overflow}, shadow: ${shape.boxShadow}`,
          severity: 'critical',
        });
      }

      // Children clipping
      if (shape.childrenClipped && shape.hasClipping) {
        issues.push({
          theme,
          page: pageName,
          control: shape.selector,
          issue: 'Child elements extend beyond clipped bounds',
          expected: 'overflow: visible or adjust child layout',
          actual: `overflow: ${shape.overflow}`,
          severity: 'warning',
        });
      }

      // Overflow inconsistency
      if (shape.overflow !== 'visible' && shape.overflow !== 'hidden' && shape.overflow !== 'auto') {
        issues.push({
          theme,
          page: pageName,
          control: shape.selector,
          issue: 'Non-standard overflow value',
          expected: 'visible, hidden, or auto',
          actual: shape.overflow,
          severity: 'info',
        });
      }
    }
  }

  return issues;
}

test.describe('Control Shape & Clipping Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('Full shape consistency audit', async ({ page }) => {
    const allIssues: ShapeIssue[] = [];

    for (const theme of THEMES) {
      console.log(`\n🎨 Auditing theme: ${theme}`);

      // Switch theme
      await page.goto('http://localhost:5173/settings');
      await page.evaluate((themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
      }, theme);
      await page.waitForTimeout(300);

      for (const pageInfo of PAGES) {
        console.log(`  📄 Checking page: ${pageInfo.name}`);

        try {
          await page.goto(`http://localhost:5173${pageInfo.path}`, {
            waitUntil: 'networkidle',
            timeout: 10000,
          });
          await page.waitForTimeout(500);

          const issues = await auditPageShapes(page, pageInfo.name, theme);
          allIssues.push(...issues);
        } catch (error) {
          console.warn(`    ⚠️  Failed to audit ${pageInfo.name}: ${error}`);
        }
      }
    }

    // Generate report
    const report = generateShapeReport(allIssues);

    const reportDir = path.join(__dirname, '__reports__');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `shape-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));

    const summaryPath = path.join(reportDir, `shape-audit-summary-${Date.now()}.md`);
    fs.writeFileSync(summaryPath, report);

    console.log(`\n📊 Shape Audit Complete!`);
    console.log(`   Total issues: ${allIssues.length}`);
    console.log(`   Critical: ${allIssues.filter(i => i.severity === 'critical').length}`);
    console.log(`   Warnings: ${allIssues.filter(i => i.severity === 'warning').length}`);
    console.log(`   Info: ${allIssues.filter(i => i.severity === 'info').length}`);
    console.log(`\n   Reports saved:`);
    console.log(`   - ${reportPath}`);
    console.log(`   - ${summaryPath}`);
  });

  test('Quick shape spot check - Dashboard', async ({ page }) => {
    const results: Array<{ theme: string; issues: number }> = [];

    for (const theme of ['minimalistic', 'cyberpunk', 'chibi']) {
      await page.goto('http://localhost:5173/settings');
      await page.evaluate((themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
      }, theme);

      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(500);

      const issues = await auditPageShapes(page, 'Dashboard', theme);
      results.push({ theme, issues: issues.length });
    }

    console.log('\n🚀 Quick shape check:');
    results.forEach(r => {
      console.log(`   ${r.theme}: ${r.issues} issues`);
    });

    const reportDir = path.join(__dirname, '__reports__');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportDir, `quick-shape-check-${Date.now()}.json`),
      JSON.stringify(results, null, 2)
    );
  });
});

function generateShapeReport(issues: ShapeIssue[]): string {
  let md = '# Control Shape & Clipping Audit Report\n\n';
  md += `**Generated:** ${new Date().toLocaleString()}\n\n`;

  md += '## Summary\n\n';
  md += `- **Total Issues:** ${issues.length}\n`;
  md += `- **Critical:** ${issues.filter(i => i.severity === 'critical').length} ⚠️\n`;
  md += `- **Warnings:** ${issues.filter(i => i.severity === 'warning').length}\n`;
  md += `- **Info:** ${issues.filter(i => i.severity === 'info').length}\n\n`;

  // Group by severity
  md += '## Critical Issues (Must Fix)\n\n';
  const critical = issues.filter(i => i.severity === 'critical');
  if (critical.length === 0) {
    md += 'None! ✅\n\n';
  } else {
    md += '| Theme | Page | Control | Issue |\n';
    md += '|-------|------|---------|-------|\n';
    critical.forEach(issue => {
      md += `| ${issue.theme} | ${issue.page} | ${issue.control} | ${issue.issue} |\n`;
    });
    md += '\n';
  }

  md += '## Warnings (Should Fix)\n\n';
  const warnings = issues.filter(i => i.severity === 'warning');
  if (warnings.length === 0) {
    md += 'None! ✅\n\n';
  } else {
    md += '| Theme | Page | Control | Issue |\n';
    md += '|-------|------|---------|-------|\n';
    warnings.slice(0, 20).forEach(issue => {
      md += `| ${issue.theme} | ${issue.page} | ${issue.control} | ${issue.issue} |\n`;
    });
    if (warnings.length > 20) {
      md += `\n_...and ${warnings.length - 20} more warnings_\n`;
    }
    md += '\n';
  }

  // Group by issue type
  md += '## Issues by Type\n\n';
  const byType = issues.reduce((acc, issue) => {
    acc[issue.issue] = (acc[issue.issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      md += `- **${type}**: ${count} occurrences\n`;
    });

  md += '\n## Recommendations\n\n';
  md += '1. **Fix shadow clipping** - Use `overflow: visible` or move shadows to pseudo-elements\n';
  md += '2. **Unify border-radius** - Ensure similar controls use consistent radius values\n';
  md += '3. **Check container bounds** - Prevent children from extending beyond clipped parents\n';
  md += '4. **Use CSS variables** - Define radius values in theme tokens for consistency\n';
  md += '5. **Test all themes** - Verify shapes remain consistent across theme switches\n\n';

  return md;
}
