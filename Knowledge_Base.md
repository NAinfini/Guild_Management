# Knowledge Base

## Program Charter

### Purpose
This restructure standardizes the repository into Apps + Packages with centralized config so the portal, worker, shared modules, docs, and infra can scale without path sprawl.

### Scope
- Full repository structure: app code, worker code, shared code, docs, infra, and tool/library config.
- Migration and compatibility-safe path rewiring.
- Continuous capture of mistakes and stronger replacement patterns.

### Non-goals
- No intentional endpoint or route behavior changes.
- No product feature redesign in this migration.

## Decision Log

### 2026-02-07: Adopt Apps + Packages + Centralized Config
- Decision: Move runtime code to `apps/portal` and `apps/worker`, shared runtime contracts/utilities to `packages/shared-*`, and configs to `config/**`.
- Rationale: Removes cross-cutting root sprawl and creates clear ownership boundaries.
- Alternatives considered: Keep a flat root structure with incremental cleanup only.
- Consequences:
  - Short-term: Broad import and script path updates.
  - Long-term: Lower maintenance overhead and clearer extension points.

### 2026-02-07: Standardize shared imports as package imports
- Decision: Replace deep relative/shared alias imports with `@guild/shared-api/*` and `@guild/shared-utils/*`.
- Rationale: Stable import surface across portal and worker, independent of folder depth.
- Alternatives considered: Keep deep relative paths and add compatibility aliases.
- Consequences:
  - Short-term: Workspace package manifests and export maps required.
  - Long-term: Safer refactors and fewer path mistakes.

## Mistakes Ledger

### 2026-02-07: Over-reliance on root-level file placement
- Mistake observed: Source/config/docs were mixed at root, increasing accidental coupling.
- Root cause: Fast feature additions without structural guardrails.
- Replacement pattern: Domain-based folder boundaries (`apps`, `packages`, `config`, `docs`, `infra`).
- Evidence: Code and config are now relocatable with deterministic import/config resolution.

### 2026-02-07: Required directive capture
- Mistake observed: Knowledge continuity was not formalized across restructures.
- Root cause: No persistent learning ledger.
- Correct replacement pattern: Keep a root `Knowledge_Base.md` and update it during each migration phase.
- Evidence: This file is now in place and seeded with actionable decision/mistake entries.
- User directive: "Use this for all sorts of things, track mistakes along the way, and replace less efficient knowledge with better ones."

## Superseded Knowledge

### Flat root structure as default
- Old pattern: Add new files/folders directly at root per feature.
- Why inefficient: High navigation cost, fragile relative imports, and duplicated config logic.
- New standard: Place code by domain ownership under `apps/`, `packages/`, and `config/`.
- Migration status: In progress and applied to portal, worker, shared packages, docs, and infra paths.

## Portable Rules

1. Keep app runtime code in `apps/*`, cross-runtime code in `packages/*`, and tool config in `config/*`.
2. Prefer package imports over deep relative imports for shared modules.
3. Record migration mistakes and stronger replacement patterns immediately in a persistent ledger.
4. Use phased migrations with verification gates at each phase boundary.
5. Freeze compatibility-critical dot-directories unless explicitly decommissioned.
