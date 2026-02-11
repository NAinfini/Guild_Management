# Theme Contrast Audit

Date: 2026-02-11

## Scope

Phase 7 contrast hardening for the unified theming migration.

Checked sources:
- `apps/portal/src/theme/tokens.ts`
- `apps/portal/src/theme/ThemeController.tsx`
- `apps/portal/src/theme/colors/color-tokens.css`

## Rules enforced by script

Script: `scripts/theme-contrast-audit.mjs`

Blocking checks (must pass):
- `primary.contrastText` on `primary.main` >= 4.5
- `secondary.contrastText` on `secondary.main` >= 4.5
- `text.primary` on `background.default` and `background.paper` >= 4.5
- Button text contrast on default/hover/active backgrounds >= 4.5
- `statusFg.{success|warning|error|info}` on `statusBg.{...}` >= 4.5

Non-blocking checks (warnings):
- `text.secondary` on page background >= 4.5
- `text.disabled` on paper >= 3.0 (advisory; disabled controls are typically exempt from WCAG contrast requirements)

## Token updates applied

- Added explicit status foreground tokens in palette model:
  - `palette.statusFg.success`
  - `palette.statusFg.warning`
  - `palette.statusFg.error`
  - `palette.statusFg.info`
- Added CSS variable tokens:
  - `--color-status-success-fg`
  - `--color-status-warning-fg`
  - `--color-status-error-fg`
  - `--color-status-info-fg`
  - `--color-accent-primary-fg`
- Updated theme mappings (`theme.custom.status/result/eventTypes/chips/warRoles/roles`) to use `statusFg` when text appears on status pill backgrounds.
- Fixed known soft pink accent issue by changing soft-pink `primary.contrastText` to a dark accessible foreground.
- Adjusted light-mode contained button active background opacity to preserve text contrast.

## Verification

Run:
```bash
npm run -s audit:theme-contrast
```

Current result:
- Blocking checks: pass (all 6 theme color presets)
- Advisory warnings: disabled text contrast remains intentionally subtle in several palettes

## Follow-up

If product requirements change and disabled text must meet stricter contrast, update `palette.text.disabled` values in `apps/portal/src/theme/tokens.ts` and re-run the audit.
