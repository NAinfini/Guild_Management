/**
 * CSS Specificity & Override Audit
 *
 * This test checks for:
 * - Specificity conflicts between theme layers
 * - !important overuse
 * - Conflicting selectors
 * - Unexpected style inheritance
 * - Theme-specific overrides not applying
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

type SpecificityIssue = {
  theme: string;
  element: string;
  property: string;
  expectedValue: string;
  actualValue: string;
  sourceRule: string;
  issue: 'override-failure' | 'important-conflict' | 'specificity-loss' | 'inline-style';
};

/**
 * Calculate CSS specificity score
 */
function calculateSpecificity(selector: string): number {
  // Simplified specificity calculation
  // Format: (inline, ids, classes/attributes, elements)
  const ids = (selector.match(/#/g) || []).length;
  const classes = (selector.match(/\./g) || []).length;
  const attributes = (selector.match(/\[/g) || []).length;
  const elements = (selector.match(/[a-z]/gi) || []).length - classes;

  return ids * 100 + (classes + attributes) * 10 + elements;
}

/**
 * Get computed style with source information
 */
async function getStyleWithSource(
  page: Page,
  selector: string,
  property: string
): Promise<{
  value: string;
  source: string;
  hasImportant: boolean;
  hasInline: boolean;
} | null> {
  return await page.evaluate(
    ({ sel, prop }) => {
      const element = document.querySelector(sel);
      if (!element) return null;

      const computed = window.getComputedStyle(element);
      const value = computed.getPropertyValue(prop);

      // Check if inline style exists
      const inlineStyle = (element as HTMLElement).style.getPropertyValue(prop);
      const hasInline = !!inlineStyle;

      // Try to find source rule (approximate)
      let source = 'unknown';
      let hasImportant = false;

      try {
        const sheets = Array.from(document.styleSheets);
        for (const sheet of sheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule instanceof CSSStyleRule) {
                if (element.matches(rule.selectorText)) {
                  const ruleValue = rule.style.getPropertyValue(prop);
                  if (ruleValue) {
                    source = rule.selectorText;
                    hasImportant = rule.style.getPropertyPriority(prop) === 'important';
                  }
                }
              }
            }
          } catch {
            // Cross-origin or protected stylesheet
          }
        }
      } catch {
        // Error accessing stylesheets
      }

      return {
        value,
        source,
        hasImportant,
        hasInline,
      };
    },
    { sel: selector, prop: property }
  );
}

/**
 * Check theme token application
 */
async function auditThemeTokens(
  page: Page,
  theme: string
): Promise<SpecificityIssue[]> {
  const issues: SpecificityIssue[] = [];

  // Test cases: element, property, expected source
  const testCases = [
    {
      selector: '.ui-button:first-of-type',
      property: 'border-radius',
      expectedToken: '--cmp-button-radius',
      description: 'Button border-radius',
    },
    {
      selector: '.ui-card:first-of-type',
      property: 'border-radius',
      expectedToken: '--cmp-card-radius',
      description: 'Card border-radius',
    },
    {
      selector: '.ui-input:first-of-type',
      property: 'background-color',
      expectedToken: '--cmp-input-bg',
      description: 'Input background',
    },
    {
      selector: 'button[type="submit"]:first-of-type',
      property: 'color',
      expectedToken: '--cmp-button-text',
      description: 'Submit button text color',
    },
    {
      selector: '.MuiIconButton-root:first-of-type',
      property: 'border-radius',
      expectedValue: '50%',
      description: 'Icon button shape (circular)',
    },
  ];

  for (const testCase of testCases) {
    try {
      const elements = await page.$$(testCase.selector);
      if (elements.length === 0) continue;

      const styleInfo = await getStyleWithSource(
        page,
        testCase.selector,
        testCase.property
      );

      if (!styleInfo) continue;

      // Check for inline styles (bad practice)
      if (styleInfo.hasInline) {
        issues.push({
          theme,
          element: testCase.selector,
          property: testCase.property,
          expectedValue: testCase.expectedToken || testCase.expectedValue || 'token-based',
          actualValue: `inline: ${styleInfo.value}`,
          sourceRule: 'inline style attribute',
          issue: 'inline-style',
        });
      }

      // Check for !important overuse
      if (styleInfo.hasImportant && !testCase.selector.includes('[data-ui="square-icon-button"]')) {
        // Some !important uses are intentional (like shape overrides)
        // But flag excessive use
        const importantCount = await page.evaluate(() => {
          const sheets = Array.from(document.styleSheets);
          let count = 0;
          for (const sheet of sheets) {
            try {
              const rules = Array.from(sheet.cssRules || []);
              for (const rule of rules) {
                if (rule instanceof CSSStyleRule) {
                  const text = rule.cssText;
                  if (text.includes('!important')) count++;
                }
              }
            } catch {}
          }
          return count;
        });

        if (importantCount > 50) {
          issues.push({
            theme,
            element: testCase.selector,
            property: testCase.property,
            expectedValue: 'normal specificity',
            actualValue: `!important (${importantCount} total uses)`,
            sourceRule: styleInfo.source,
            issue: 'important-conflict',
          });
        }
      }

      // Check if expected value matches (for specific tests)
      if (testCase.expectedValue && styleInfo.value !== testCase.expectedValue) {
        // Normalize values for comparison
        const normalize = (v: string) => v.trim().replace(/\s+/g, ' ').toLowerCase();
        if (normalize(styleInfo.value) !== normalize(testCase.expectedValue)) {
          issues.push({
            theme,
            element: testCase.selector,
            property: testCase.property,
            expectedValue: testCase.expectedValue,
            actualValue: styleInfo.value,
            sourceRule: styleInfo.source,
            issue: 'override-failure',
          });
        }
      }
    } catch (error) {
      console.warn(`Failed to audit ${testCase.selector}: ${error}`);
    }
  }

  return issues;
}

/**
 * Check for conflicting theme rules
 */
async function auditConflictingRules(page: Page, theme: string): Promise<SpecificityIssue[]> {
  const issues: SpecificityIssue[] = [];

  const conflicts = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    const ruleMap = new Map<string, Array<{ selector: string; property: string; value: string; important: boolean }>>();

    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            const style = rule.style;

            for (let i = 0; i < style.length; i++) {
              const property = style[i];
              const value = style.getPropertyValue(property);
              const important = style.getPropertyPriority(property) === 'important';

              const key = `${selector}::${property}`;
              if (!ruleMap.has(key)) {
                ruleMap.set(key, []);
              }
              ruleMap.get(key)!.push({ selector, property, value, important });
            }
          }
        }
      } catch {
        // Skip inaccessible sheets
      }
    }

    // Find duplicates
    const duplicates: Array<{ selector: string; property: string; count: number }> = [];
    for (const [key, rules] of ruleMap.entries()) {
      if (rules.length > 1) {
        const [selector, property] = key.split('::');
        duplicates.push({ selector, property, count: rules.length });
      }
    }

    return duplicates;
  });

  for (const conflict of conflicts) {
    if (conflict.count > 2) {
      issues.push({
        theme,
        element: conflict.selector,
        property: conflict.property,
        expectedValue: 'single rule',
        actualValue: `${conflict.count} conflicting rules`,
        sourceRule: conflict.selector,
        issue: 'specificity-loss',
      });
    }
  }

  return issues;
}

test.describe('CSS Specificity & Override Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('Full CSS specificity audit', async ({ page }) => {
    const allIssues: SpecificityIssue[] = [];

    for (const theme of THEMES) {
      console.log(`\n🎨 Auditing theme: ${theme}`);

      // Switch theme
      await page.goto('http://localhost:5173/settings');
      await page.evaluate((themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
      }, theme);
      await page.waitForTimeout(300);

      // Go to a page with various controls
      await page.goto('http://localhost:5173/events');
      await page.waitForTimeout(500);

      const tokenIssues = await auditThemeTokens(page, theme);
      const conflictIssues = await auditConflictingRules(page, theme);

      allIssues.push(...tokenIssues, ...conflictIssues);
    }

    // Generate report
    const report = generateSpecificityReport(allIssues);

    const reportDir = path.join(__dirname, '__reports__');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `specificity-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));

    const summaryPath = path.join(reportDir, `specificity-audit-summary-${Date.now()}.md`);
    fs.writeFileSync(summaryPath, report);

    console.log(`\n📊 Specificity Audit Complete!`);
    console.log(`   Total issues: ${allIssues.length}`);
    console.log(`   Override failures: ${allIssues.filter(i => i.issue === 'override-failure').length}`);
    console.log(`   Important conflicts: ${allIssues.filter(i => i.issue === 'important-conflict').length}`);
    console.log(`   Specificity loss: ${allIssues.filter(i => i.issue === 'specificity-loss').length}`);
    console.log(`   Inline styles: ${allIssues.filter(i => i.issue === 'inline-style').length}`);
  });

  test('Quick specificity check - Cyberpunk theme', async ({ page }) => {
    await page.goto('http://localhost:5173/settings');
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'cyberpunk');
    });

    await page.goto('http://localhost:5173/events');
    await page.waitForTimeout(500);

    const issues = await auditThemeTokens(page, 'cyberpunk');

    console.log('\n🚀 Quick specificity check (Cyberpunk):');
    console.log(`   Total issues: ${issues.length}`);

    issues.forEach(issue => {
      console.log(`   - ${issue.element}: ${issue.property}`);
      console.log(`     Expected: ${issue.expectedValue}`);
      console.log(`     Actual: ${issue.actualValue}`);
    });
  });
});

function generateSpecificityReport(issues: SpecificityIssue[]): string {
  let md = '# CSS Specificity & Override Audit Report\n\n';
  md += `**Generated:** ${new Date().toLocaleString()}\n\n`;

  md += '## Summary\n\n';
  md += `- **Total Issues:** ${issues.length}\n`;
  md += `- **Override Failures:** ${issues.filter(i => i.issue === 'override-failure').length}\n`;
  md += `- **Important Conflicts:** ${issues.filter(i => i.issue === 'important-conflict').length}\n`;
  md += `- **Specificity Loss:** ${issues.filter(i => i.issue === 'specificity-loss').length}\n`;
  md += `- **Inline Styles:** ${issues.filter(i => i.issue === 'inline-style').length}\n\n`;

  // Group by issue type
  md += '## Override Failures\n\n';
  const overrides = issues.filter(i => i.issue === 'override-failure');
  if (overrides.length === 0) {
    md += 'None! ✅\n\n';
  } else {
    md += '| Theme | Element | Property | Expected | Actual |\n';
    md += '|-------|---------|----------|----------|--------|\n';
    overrides.forEach(issue => {
      md += `| ${issue.theme} | ${issue.element} | ${issue.property} | ${issue.expectedValue} | ${issue.actualValue} |\n`;
    });
    md += '\n';
  }

  md += '## Inline Style Usage (Should Avoid)\n\n';
  const inlines = issues.filter(i => i.issue === 'inline-style');
  if (inlines.length === 0) {
    md += 'None! ✅\n\n';
  } else {
    md += '| Theme | Element | Property |\n';
    md += '|-------|---------|----------|\n';
    inlines.forEach(issue => {
      md += `| ${issue.theme} | ${issue.element} | ${issue.property} |\n`;
    });
    md += '\n';
  }

  md += '## !important Overuse\n\n';
  const importants = issues.filter(i => i.issue === 'important-conflict');
  if (importants.length === 0) {
    md += 'None! ✅\n\n';
  } else {
    md += '| Theme | Element | Property | Count |\n';
    md += '|-------|---------|----------|-------|\n';
    importants.forEach(issue => {
      const match = issue.actualValue.match(/\((\d+) total uses\)/);
      const count = match ? match[1] : '?';
      md += `| ${issue.theme} | ${issue.element} | ${issue.property} | ${count} |\n`;
    });
    md += '\n';
  }

  md += '## Recommendations\n\n';
  md += '1. **Remove inline styles** - Use CSS classes or theme tokens instead\n';
  md += '2. **Reduce !important usage** - Increase specificity naturally\n';
  md += '3. **Consolidate duplicate rules** - Merge conflicting selectors\n';
  md += '4. **Use CSS variables** - Allow easy overrides without specificity wars\n';
  md += '5. **Layer styles properly** - Base → Theme → Component → Override\n\n';

  return md;
}
