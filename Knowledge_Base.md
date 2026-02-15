# Knowledge Base

## Concrete rules (DO NOT MODIFY)
- Rules in this document must be followed
- DO NOT EDIT THIS SECTION
- Start every response with `主人`
- End every response with `好了喵`
- Use skills and MCP for each task; when a skill is missing, use `find-skills` and install what is needed.

## Purpose
- Keep this file as reusable engineering guidance, not a changelog.
- Capture durable patterns that prevent regressions.
- Prefer concise rules over historical narration.

## Maintenance Rules
- Record bugfixes as `issue`, `cause`, and `fix pattern`.
- For non-bug work, record only reusable implementation patterns.
- Merge overlapping entries into one canonical rule.
- Remove stale snapshots, completion counters, and temporary status text.
- Before each response, write new knowledge into the knowledge base file.
- After structural changes (files/folders/exports), update `Repo_Index.md` in the same change set.
- For all edits made in the code, edit comment to explain what code does, where every piece of code leads to.

## Workflow Discipline

### Scope and Discovery
- Pin scope before implementation.
- Ask targeted questions when intent is ambiguous.
- For cross-page issues, inspect shared components, theme runtime, and state layers first.
- Before any repo investigation, read `Repo_Index.md` first.

### Repo Index Governance
- Keep only root `Repo_Index.md` as canonical index.
- Do not maintain active repo index files under `docs/engineering`.
- `Repo_Index.md` must include every repository file (excluding generated/cache directories) with a search parameter.
- Use the relative file path itself as `Search Parameter` for deterministic lookup.
- If a class/module becomes unused, mark it `OBSOLETE` or `OBSOLETE CANDIDATE` in `Repo_Index.md` before removal.

### Obsolescence Lifecycle
- First pass: deprecate and document with evidence; do not delete unless clearly generated output.
- Evidence must include at least one of: no imports/usages, not referenced by routes/entrypoints, replaced by explicit path.
- Remove only after verification and migration path confirmation.

### Verification Discipline
- Prefer targeted tests for touched behavior, then run broader regressions.
- For migration phases, run this sequence before claiming completion:
  1. Feature-targeted tests
  2. Week/phase sweep tests
  3. Lint
  4. Build
  5. Typecheck
- If baseline debt blocks typecheck, report it explicitly with representative errors and keep claim scope narrow.

### Encoding and Localization Integrity
- Keep instruction and locale files UTF-8 clean.
- Re-read key lines after edits to catch mojibake early.
- Ensure touched keys exist in both `en` and `zh`.
- Replace hardcoded user-visible strings with `t(...)` keys.

## Frontend Architecture Patterns

### Token and Primitive-First Strategy
- Use runtime tokens (`--sys-*`, `--cmp-*`) as styling source of truth.
- Apply token usage at primitive/component layer so feature screens inherit consistency.
- Avoid hardcoded palette classes in features.

### Component Migration and Compatibility
- Migrate large pages in phases behind stable interfaces.
- Keep wrapper compatibility during migration (legacy import paths and props) until all callers are updated.
- Add stable `data-testid` hooks for newly split components to preserve testability during refactors.
- Keep frontend architecture primitives-first: no direct legacy vendor UI imports and no legacy bridge namespace usage in app surfaces.

### Layout and Dense Data UI
- Participant/member cards must preserve strict hierarchy: `name -> metadata -> actions`.
- Reserve action space in dense grids so destructive/action icons do not overlap metadata.
- Prefer stepped responsive columns (`1/2/3/4/5`) with consistent card height for stable layout.

### Event Page Patterns
- Keep `EventDetails` isolated from action controls to simplify rendering and testing.
- For participant overflow, use explicit `limit`, overflow card (`+N`), and reversible expand/collapse.
- `InviteMemberDialog` should support existing-member add flow, email invite flow, and explicit success/error feedback.

### Virtualization and Performance
- Gate virtualization by explicit threshold and keep non-virtual path for small lists.
- Use prefetch-on-hover for detail-heavy cards where query reuse is likely.
- Track bundle warnings and split heavy features incrementally instead of broad rewrites.

### Motion and Accessibility
- Respect reduced motion for CSS and JS animation paths.
- Keep one transform owner per interactive state to avoid stacked motion artifacts.
- Treat flicker, shake, and heavy glitch as optional FX; disable in reduced mode.

## Data and Contract Reliability
- Audit backend routes, shared contracts, and frontend usage together.
- For endpoint changes, update shared `ENDPOINTS` and worker route mapping in the same change.
- Normalize date/time at mapping boundaries.
- Gate privileged actions at render level, not icon/state only.

## Testing and QA Patterns
- Keep assertions behavior-focused and deterministic.
- Add dedicated tests for newly extracted UI contracts (component-level test IDs and interactions).
- For invite flows, test invalid input, valid input, and mutation path in the same suite.
- Keep checklist progress in plan docs tied to executed command evidence.

## Issue, Cause, Fix Patterns

### Theme and Styling
- **issue**: Theme-scoped control signature tests missed expected markers on first interaction.
  **cause**: active theme was resolved from document scope before mounted node scope was available.
  **fix pattern**: initialize from document theme, then re-resolve in `useLayoutEffect` using `closest('[data-theme]')` with forwarded ref synchronization.

- **issue**: Theme preference sync produced repeated `404` noise and retry churn.
  **cause**: frontend expected `/auth/preferences` before backend capability was deployed.
  **fix pattern**: treat `404` as optional capability absence, disable remote sync for that session, continue local-state behavior.

### Accessibility
- **issue**: Accessibility audit parsing failed even when Lighthouse JSON file was valid.
  **cause**: PowerShell `ConvertFrom-Json` was brittle on large report payloads and special characters.
  **fix pattern**: use Node `JSON.parse` for Lighthouse report parsing and summary generation; keep PowerShell for orchestration only.

- **issue**: Accessibility regressions appeared from shimmed controls with downgraded DOM semantics.
  **cause**: generic MUI subpath shim rendered many components as `div`, so control ARIA/state props were attached to non-interactive elements.
  **fix pattern**: implement semantic subpath shims for interactive controls (`button`, `input`, `range`) and add subpath-level contract tests for role/ARIA behavior.

- **issue**: Form-related accessibility checks failed on date, range, and select controls.
  **cause**: controls relied on visual context but lacked explicit accessible names in DOM.
  **fix pattern**: require explicit `aria-label`/`aria-labelledby` for non-textual or unlabeled controls, sourced from i18n keys to preserve localization parity.

- **issue**: Icon-only controls regressed accessibility semantics during UI refactors.
  **cause**: tooltip text and visual context were present, but buttons themselves lacked stable accessible names.
  **fix pattern**: for every icon-only control, define explicit `aria-label` from existing i18n keys (or item-aware labels when dynamic), then lock contracts with source assertions on critical pages.

### Error Handling and Recovery
- **issue**: GuildWar active team management had no recoverable UI when team query failed.
  **cause**: `ActiveWarManagement` handled loading/no-war branches but omitted `useWarTeams` error-state branching.
  **fix pattern**: for query-driven pages, add explicit error-state + retry (`refetch`) path with stable `data-testid` hooks and lock it with contract tests.

- **issue**: War history views lost recovery affordances when list queries failed or filters zeroed results.
  **cause**: history page only handled loading and plain no-results text, without explicit query-error actions or empty-state CTA hooks.
  **fix pattern**: in list-driven pages, keep filter controls visible, add dedicated query-error branch (`error-state` + retry), and add filtered-empty action hooks (`clear_filters`) guarded by active-filter detection.

- **issue**: Dashboard can appear blank when multiple independent summary queries fail at once.
  **cause**: page composed several query-backed sections but had no page-level recovery branch when all data slices were empty due to failures.
  **fix pattern**: in aggregate pages, gate a page-level recoverable error state on `hasAnyQueryError && !hasAnyData`, and wire one retry action to fan out all relevant `refetch` calls.

### Migration and Compatibility
- **issue**: Large import-path codemods can silently corrupt non-ASCII literals or break syntax.
  **cause**: bulk text replacement was performed without strict UTF-8 write guarantees and without immediate syntax verification.
  **fix pattern**: for mass codemods, force UTF-8 writes explicitly, then run a fast syntax gate (`tsc --noEmit` or targeted parse checks) before continuing structural changes.

- **issue**: Workspace-scoped test execution produced widespread `ENOENT` in source-contract tests.
  **cause**: tests resolved files with `resolve(process.cwd(), 'apps/portal/...')`, which duplicates path segments when cwd is already `apps/portal`.
  **fix pattern**: use cwd-agnostic source locators (repo-root detection helper or normalized relative resolver) for file-read contract tests.

- **issue**: Portal typecheck command paths diverged between root and workspace executions.
  **cause**: root gate (`config/typescript/tsconfig.portal.json`) and workspace-local `apps/portal/tsconfig.json` had different include/exclude behavior.
  **fix pattern**: keep portal compile gate on shared config, explicitly include locale JSON in workspace tsconfig, and scope Playwright `*.spec.*` files out of portal compile typecheck when they are runtime-only E2E suites.

- **issue**: Legacy bridge subpath imports can pass typecheck but fail at build time after bulk codemods.
  **cause**: bridge subpath imports depended on alias behavior that was not consistently configured across Vite/Vitest/TypeScript resolution.
  **fix pattern**: keep resolver parity for bridge subpaths across `vite`, `vitest`, root compile tsconfig, and workspace tsconfig; prefer explicit prefix mappings and verify with contract tests + typecheck + build in the same batch.

### Icon and Component Migration
- **issue**: Direct icon migrations from MUI-shaped APIs to `lucide-react` can cause wide churn when existing callsites rely on `sx` props.
  **cause**: page-level icon usage was built around MUI-style icon props (`sx`, class merges), while lucide icons use plain SVG props.
  **fix pattern**: during phased page migration, use a local adapter that maps a minimal `sx` subset (`fontSize`, spacing, color/opacity) to SVG `style`, migrate imports first under contract tests, then remove adapter when full primitive conversion is complete.

- **issue**: Migrated icon files can become harder to read when every icon import is aliased even when no collision exists.
  **cause**: transitional adapter patterns were applied broadly, including callsites where direct names are already unambiguous.
  **fix pattern**: keep aliasing only where adapter/source symbol separation is required; add a cleanup checklist task to normalize direct imports once adapters are removed.

- **issue**: Lucide optimization work can regress later when namespace/default/dynamic imports are reintroduced in feature files.
  **cause**: icon cleanup was enforced by convention only, without a lasting source-contract gate for high-cost import patterns.
  **fix pattern**: add a phase-level contract that audits target files and blocks `import * as`, default imports, and `lucide-react/dynamic` entrypoints.

### Bundle Optimization and Lazy Loading
- **issue**: Lazy-loading UI subcomponents did not reduce initial bundle cost when the lazy component was always mounted with `open={false}`.
  **cause**: `React.lazy` import still resolves on first render if the component is present in the tree, even when dialog visibility is closed.
  **fix pattern**: combine lazy import with conditional mount gate (`isOpen ? <Suspense><LazyDialog open={isOpen} ... /></Suspense> : null`) so code is fetched only when the user opens the surface.

- **issue**: Extracting a dialog for bundle splitting can fail to reduce initial payload if the lazy component remains permanently mounted.
  **cause**: parent render keeps the lazy component in-tree even while closed, triggering eager load during first render.
  **fix pattern**: pair `lazy(() => import(...))` with an explicit open-state conditional mount and `Suspense` wrapper so the chunk is requested only when the dialog opens.

- **issue**: Pages with multiple related confirmation dialogs can retain initial bundle weight even after single-dialog extraction.
  **cause**: each inline confirmation dialog stays in the feature entry chunk when kept directly in the page component.
  **fix pattern**: extract related confirmations into one lazy-loaded dialog group component and gate it with one boolean (`hasAnyDialogOpen`) so none of the confirmation UI is downloaded until first open.

- **issue**: Bundle-splitting tasks can be reported as complete without proving an actual chunk was emitted.
  **cause**: config-only changes (`manualChunks`) were applied without build-output evidence.
  **fix pattern**: pair each chunking config change with a source-contract test and a build verification that names the emitted chunk artifact (e.g., `guild-war-*.js`).

### Image and Media Optimization
- **issue**: Image-heavy pages can keep Lighthouse warnings when responsive visuals lack intrinsic sizing metadata.
  **cause**: `<img>` nodes inside cards/modals/avatars relied on CSS dimensions only, so browser layout reservation and decode scheduling were suboptimal.
  **fix pattern**: add explicit `width`/`height` plus `loading`/`decoding` (and `fetchPriority` for opened hero media), then lock with source-contract tests to prevent regressions.

### QA and Testing
- **issue**: Feature tests with mocked `useTranslation` can fail on unrelated code paths when components read `i18n.language`.
  **cause**: mock returned `t` only, while runtime hook contract includes both translator and i18n instance.
  **fix pattern**: when mocking `useTranslation`, provide minimal `i18n` parity (`{ language: 'en' }`) in addition to `t` to keep tests stable during localization-aware refactors.

- **issue**: Moving inline dialogs to lazy-loaded components can break existing interaction tests that assume synchronous mount.
  **cause**: `React.lazy` resolves asynchronously, so `getBy*` assertions run before the dialog subtree is available.
  **fix pattern**: for lazy dialog migrations, keep source-contract coverage in the parent file and update interaction tests to await mount (`findBy*`) after the open action.

- **issue**: Browser/mobile QA checklist completion drifted when verification was done ad-hoc.
  **cause**: cross-browser and mobile checks lacked one deterministic script producing both visual and runtime evidence.
  **fix pattern**: keep one scripted matrix that runs desktop/mobile screenshot sweeps and runtime console/network audits, then writes JSON/Markdown artifacts under a fixed report path.

## Portable Rules
1. Prefer token-driven styling over hardcoded palette utilities.
2. Keep hooks unconditional and in stable render order.
3. Use phased migrations with explicit verification gates.
4. Keep shared imports package-based instead of deep relative paths.
5. Record prevention patterns, not work logs.
6. Derive next priorities from unchecked plan items first.
