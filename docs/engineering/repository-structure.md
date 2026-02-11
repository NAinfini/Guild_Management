# Repository Structure Standard

## Monorepo Layout

```text
Guild_Management/
|- apps/
|  |- portal/                # React portal application
|  |- worker/                # Cloudflare worker API
|- packages/
|  |- shared-api/            # Shared contracts and endpoint definitions
|  |- shared-utils/          # Shared runtime-safe utilities
|- config/                   # Centralized tool configuration
|- docs/
|  |- engineering/           # Architecture, standards, and migration docs
|  |- product/               # Product-facing documentation
|  |- plans/                 # Planning documents
`- infra/
   |- cloudflare/            # Cloudflare deployment artifacts
   `- database/              # Database schemas and migrations
```

## Portal Application Structure (`apps/portal/src`)

```text
src/
|- features/                 # Feature modules
|- components/               # Reusable UI primitives and system components
|- theme/                    # Theme tokens, controller, presets, and effects
|- layouts/                  # Layout shells
|- lib/                      # Shared utilities
|- hooks/                    # Shared hooks
|- routes/                   # TanStack Router routes
|- store/                    # Zustand + TanStack Query glue
`- i18n/                     # Localization resources
```

## Import Boundaries

- `@/components` for shared UI primitives and composed UI building blocks.
- `@/theme` for theme tokens/controller/types/presets.
- `@/features` for route-level feature modules.
- `@/lib`, `@/hooks`, and `@/store` for app-level shared logic.

Feature modules should not directly import internals from other feature modules.

## Theming Governance

Primary references:
- `docs/engineering/theming-guidelines.md`
- `docs/engineering/theme-token-contract.md`
- `docs/engineering/theme-contrast-audit.md`

Enforcement commands:
- `npm run -s lint:theme-guardrails`
- `npm run -s audit:theme-contrast`
- Baseline snapshot for expanded guardrail scope: `scripts/theme-token-guardrail-baseline.json`

Guardrail scope currently covers token-migrated high-traffic feature folders and is expanded as additional features are migrated.

## Compatibility Policy

- Keep `.kilocode`, `.gsd`, and `.claude` at repo root.
- Preserve external API behavior during structure-only refactors.
- Prefer additive migration shims only when necessary.
- Keep path aliases stable and consistent across portal and worker code.
