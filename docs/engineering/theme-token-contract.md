# Theme Token Contract

Date: 2026-02-11

## Token layers

1. Semantic tokens (`--sys-*`)
- Purpose: app-wide intent-level values, independent of component implementation.
- Examples:
  - Surfaces: `--sys-surface-page`, `--sys-surface-panel`, `--sys-surface-elevated`, `--sys-surface-sunken`
  - Text: `--sys-text-primary`, `--sys-text-secondary`, `--sys-text-tertiary`, `--sys-text-link`, `--sys-text-inverse`
  - Borders: `--sys-border-default`, `--sys-border-strong`, `--sys-border-subtle`
  - Interactive: `--sys-interactive-accent`, `--sys-interactive-hover`, `--sys-interactive-active`, `--sys-interactive-focus-ring`
  - Accent/status foregrounds: `--color-accent-primary-fg`, `--color-status-*-fg`

2. Component tokens (`--cmp-*`)
- Purpose: per-component visual behavior while preserving theme consistency.
- Groups:
  - Button: `--cmp-button-*`
  - Card: `--cmp-card-*`
  - Input: `--cmp-input-*`
  - Table: `--cmp-table-*`
  - Chip: `--cmp-chip-*`
  - Nav: `--cmp-nav-*`
  - Dialog: `--cmp-dialog-*`

## Ownership and flow

- Palette source: `apps/portal/src/theme/tokens.ts`
- Runtime injection: `apps/portal/src/theme/ThemeController.tsx`
- CSS fallbacks/defaults: `apps/portal/src/theme/theme.css`
- Theme-specific component overrides: `apps/portal/src/theme/presets/*.css`

Flow:
1. `tokens.ts` provides palette + visual data.
2. `ThemeController.tsx` computes and injects `--sys-*` and `--cmp-*` vars on `document.documentElement`.
3. Preset CSS files can override component tokens for each theme (without changing semantic meaning).
4. Components should consume `--cmp-*` first, with `--sys-*` as fallback intent layer.

Status foreground contract:
- `palette.status` is the accent stroke/icon color.
- `palette.statusBg` is the pill/container background.
- `palette.statusFg` is the readable text color to render on `statusBg`.
- Components rendering status pills must use `statusFg` (or `--color-status-*-fg`) for text.

## Usage rules

- Do not hardcode palette classes (`text-red-*`, `bg-black/*`, etc.) in feature components.
- For component visuals, prefer `--cmp-*` tokens.
- For non-component primitives/layout semantics, use `--sys-*` tokens.
- If a new component type is introduced, add a dedicated `--cmp-<component>-*` group instead of reusing unrelated tokens.
