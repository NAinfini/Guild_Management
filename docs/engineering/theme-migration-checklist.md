# Theme Migration Status

Date: 2026-02-11
Owner: Dashboard + Theme migration

## Finalized outcomes

1. Theme wiring is consistent
- `data-theme` and `data-theme-color` are initialized before first paint.
- Runtime CSS variables are injected by `ThemeController`.

2. Token model is unified
- Runtime palette source: `apps/portal/src/theme/tokens.ts`.
- Class token declarations: `apps/portal/src/theme/colors/color-tokens.css`.
- Semantic and component token contracts are documented in `docs/engineering/theme-token-contract.md`.

3. Shared primitives are token-driven
- Migrated primitives: `Card`, `Button`, `Input`, `Badge`, `Table`, `Dialog`.

4. Dashboard migration is complete
- Dashboard widgets use theme tokens instead of hardcoded palette utility classes.

5. Theme effects are component-scoped
- Interaction effects use `ui-*` selectors instead of one-size global wildcard transitions.

6. Contrast hardening is enforced
- Explicit `statusFg` tokens and `--color-status-*-fg` variables are in place.
- Automated contrast check: `npm run -s audit:theme-contrast`.

## Regression guardrails

1. No hardcoded palette utilities in guarded feature folders
- Guardrail script: `scripts/enforce-theme-token-usage.mjs`.
- Command: `npm run -s lint:theme-guardrails`.
- Integrated into portal lint: `npm run -s lint:portal`.
- Baseline debt snapshot for expanded folders: `scripts/theme-token-guardrail-baseline.json`.

2. Contrast audit gate
- Script: `scripts/theme-contrast-audit.mjs`.
- Command: `npm run -s audit:theme-contrast`.

## Current guarded scope

Strict zero-tolerance scope:
- `apps/portal/src/features/Dashboard`
- `apps/portal/src/features/Events`
- `apps/portal/src/features/Announcements`
- `apps/portal/src/features/Settings`
- `apps/portal/src/features/Tools`
- `apps/portal/src/features/Members`
- `apps/portal/src/features/Profile`
- `apps/portal/src/features/Wiki`
- `apps/portal/src/features/GuildWar`

Baseline policy:
- Baseline file remains in repo for guardrail compatibility and can stay empty when no baseline-managed scope remains.

## Related docs

- `docs/engineering/theming-guidelines.md`
- `docs/engineering/theme-token-contract.md`
- `docs/engineering/theme-contrast-audit.md`
