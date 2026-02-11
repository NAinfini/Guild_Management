import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const STRICT_DIRS = [
  'apps/portal/src/features/Dashboard',
  'apps/portal/src/features/Events',
  'apps/portal/src/features/Announcements',
  'apps/portal/src/features/Settings',
  'apps/portal/src/features/Tools',
  'apps/portal/src/features/Members',
  'apps/portal/src/features/Profile',
  'apps/portal/src/features/Wiki',
  'apps/portal/src/features/GuildWar',
];

const BASELINE_DIRS = [];

const PATTERN =
  'text-(red|blue|green|yellow|white)|bg-(black|white|red|blue|green|yellow)|border-(red|blue|green|white)';

const MATCH_REGEX = new RegExp(PATTERN, 'g');
const BASELINE_PATH = path.resolve('scripts/theme-token-guardrail-baseline.json');

function runRgFiles(targetDir) {
  const result = spawnSync('rg', ['--files', targetDir, '-g', '*.tsx'], { encoding: 'utf8' });

  if (result.status === 1) return [];
  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(`Failed to list files in ${targetDir}${stderr ? `: ${stderr}` : ''}`);
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function countMatches(content) {
  const matches = content.match(MATCH_REGEX);
  return matches ? matches.length : 0;
}

function collectCounts(directories) {
  const counts = {};

  for (const dir of directories) {
    const files = runRgFiles(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const count = countMatches(content);
      if (count > 0) {
        counts[file.replace(/\\/g, '/')] = count;
      }
    }
  }

  return counts;
}

function writeBaseline() {
  const counts = collectCounts(BASELINE_DIRS);
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    pattern: PATTERN,
    baselineDirs: BASELINE_DIRS,
    counts,
  };

  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote guardrail baseline with ${Object.keys(counts).length} files: ${BASELINE_PATH}`);
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    throw new Error(
      `Missing baseline file at ${BASELINE_PATH}. Run: node scripts/enforce-theme-token-usage.mjs --write-baseline`
    );
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  if (!baseline || typeof baseline !== 'object' || !baseline.counts) {
    throw new Error(`Invalid baseline format in ${BASELINE_PATH}`);
  }

  return baseline;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--write-baseline')) {
    writeBaseline();
    return;
  }

  const baseline = loadBaseline();
  const strictCounts = collectCounts(STRICT_DIRS);
  const expandedCounts = collectCounts(BASELINE_DIRS);

  const violations = [];

  for (const [file, count] of Object.entries(strictCounts)) {
    violations.push(`${file}: ${count} blocked class match(es) (strict scope requires zero)`);
  }

  const baselineCounts = baseline.counts || {};
  for (const [file, count] of Object.entries(expandedCounts)) {
    const baselineCount = baselineCounts[file] ?? 0;
    if (count > baselineCount) {
      violations.push(
        `${file}: ${count} blocked class match(es), baseline ${baselineCount}`
      );
    }
  }

  if (violations.length > 0) {
    console.error('Theme guardrails failed. New hardcoded palette utility regressions found:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    console.error('Use theme tokens (`--sys-*`, `--cmp-*`, `--color-status-*-fg`) instead.');
    process.exit(1);
  }

  console.log('Theme guardrails passed: strict scopes are clean and expanded scopes did not exceed baseline debt.');
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Theme guardrails could not run: ${message}`);
  process.exit(2);
}
