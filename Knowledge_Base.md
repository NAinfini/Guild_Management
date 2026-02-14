# Knowledge Base

## Concrete rules(DO NOT MODIFY)
- Rules in this section must be followed
- DO NOT EDIT THIS SECTION
- Start every response with `主人`
- End every response with `好了喵`
- Use skills and mcp for each task; when a skill is missing, use `find-skills` and install what is needed.
- Update repository-structure.md in docs/engineering folder when making changes to structural of the repo

## Purpose
- Keep this file as reusable engineering guidance, not a changelog.
- Capture durable patterns that prevent regressions.
- Prefer concise rules over historical narration.

## Maintenance Rules
- Record bugfixes as `issue`, `cause`, and `fix pattern`.
- For non-bug work, record only durable implementation patterns.
- Merge overlapping entries into one canonical rule.
- Remove stale process snapshots, completion counts, and status narration.

## Workflow Discipline

### Scope and Discovery
- Pin scope before implementation.
- Ask one targeted scoping question when intent is ambiguous.
- For cross-page issues, inspect shared components/theme/runtime layers first.

### Encoding and Localization Integrity
- Keep instruction and locale files UTF-8 clean.
- Re-read key lines after edits to catch mojibake early.
- Ensure keys exist in both `en` and `zh` for touched UI.
- Replace hardcoded UI strings with `t(...)` keys.
- Add regression tests for high-visibility localized labels.

### Verification Discipline
- Prefer explicit tests for new behavior and regressions.
- Keep assertions behavior-focused with stable mocks.
- Verify with targeted suites first, then a broader regression command when risk is cross-cutting.

## Theme Runtime Principles

### Token and Architecture Rules
- Use runtime token injection as the source of truth for semantic (`--sys-*`) and component (`--cmp-*`) variables.
- Bridge utility token systems to active runtime palette consistently.
- Apply token usage at primitive/component layer first so features inherit consistency.
- Avoid hardcoded palette classes in feature UIs.

### Motion and FX Governance
- Scope motion/effects by component category, not wildcard selectors.
- Keep one transform owner per state to avoid stacking artifacts.
- Use reduced-motion-safe guards for CSS and JS-triggered effects.
- Scale motion amplitude by intensity; do not increase duration with intensity.
- For expensive theme state, preview on `onChange` and commit on `onChangeCommitted`.

### Ambient Rendering and Performance
- Use layered scene composition (`scene shell`, semantic objects, post overlays) instead of monolithic loops.
- Prefer demand-driven invalidation with sparse ambient ticks over continuous RAF loops.
- Track diagnostics (`invalidations/sec`, `avg frame ms`, `max frame ms`) to keep idle cost predictable.

## Theme Identity Patterns
- Minimalistic: restrained depth, low-amplitude drift, subtle grain/vignette only.
- Neo-brutalism: high-contrast print stack, step-based impact, localized clunk feedback.
- Cyberpunk: event-only glitch/chromatic bursts, strict reduced-motion suppression.
- Steampunk: localized mechanical one-shots (lever recoil, gauge vibration), short settle windows.
- Royal: sparse, low-frequency premium motion; keep identity via materials under reduced mode.
- Chibi: playful short one-shots, event-only celebration effects.
- Post-apocalyptic: texture-first grit identity, rare hazard cues, localized friction signatures.

## Reduced Motion and Accessibility
- Treat large drift, shake, flicker, and heavy glitch as Fancy FX and suppress in reduced mode.
- Maintain deterministic reduced-profile markers and static fallback overlays per theme.
- Preserve readability and contrast when motion signatures are disabled.

## Control Animation Discipline
- Use contract-driven adapters with explicit states, one-shots, and settle timeouts.
- Prevent idle/decorative infinite loops with watchdog checks.
- Use theme animation maps and skin/material variants without duplicating control logic.
- issue: Theme-scoped control signature tests can miss expected markers on first interaction.
  cause: controls resolved active theme from document-level selectors during render before the mounted node was available.
  fix pattern: initialize from document theme, then re-resolve in `useLayoutEffect` from mounted element scope via `closest('[data-theme]')`, keeping forwarded refs synchronized.

## Hardening and Testing Patterns
- Map each hardening objective to dedicated, named test artifacts.
- Keep visual baselines centralized and reviewable.
- Validate runtime motion resolution, FX gating, Fancy FX suppression, one-shot settle, and performance budgets.

## Rollout and Operations
- Treat rollout policy as runtime data, not compile-time assumptions.
- Centralize rollout controls for theme allow-list, FX quality cap, and baseline-only fallback.
- Expose runtime monitoring metadata on ambient/FX layers for QA and operations.
- Keep an emergency baseline-only switch available throughout rollout.

## UI Semantics and Component Integrity
- Use semantic color mappings consistently for outcomes/status.
- Ensure selected and active controls have explicit readable foreground/background tokens.
- Keep disabled button readability by tuning disabled foreground/background tokens instead of relying on global opacity fades.
- Keep shared primitives API-consistent and remove deprecated upstream props.
- Add opt-out hooks in shared primitives for screen-specific layout needs.
- Render theme-mode options with shared semantic icons (single resolver) instead of per-screen color blocks to keep selector affordances consistent across settings, studio, and navigation menus.
- For shared accessibility CSS, avoid broad `[class*="..."]` selectors on primitives; scope to explicit hooks like `data-ui` or `.ui-*` to prevent styling nested framework internals.

## Data and Contract Reliability
- Audit backend routes, shared contracts, and frontend usage together.
- For endpoint changes, update shared `ENDPOINTS` and worker `ROUTE_MAP` in the same change set to prevent contract/route drift.
- Normalize date/time at mapping boundaries before rendering/parsing.
- Gate privileged actions by permission at render level, not icon/state only.
- issue: theme preferences sync logs repeated 404 errors and keeps retrying persistence.
  cause: frontend expects `/auth/preferences`, but deployed backend can lag route availability.
  fix pattern: treat 404 as capability absence for optional endpoints, disable remote sync for that session, and continue local-state behavior without warning spam.
- issue: editor image upload handler exists but users still get URL prompt flow.
  cause: upload callback was not wired into the editor toolbar interaction path.
  fix pattern: expose explicit `onImageUpload` on shared editor primitives, prefer upload flow when provided, keep prompt fallback only when callback is absent, and add focused tests for both paths.

## Portable Rules
1. Prefer token-driven styling over hardcoded palette utilities.
2. Keep hooks unconditional and in stable render order.
3. Use phased migrations with explicit verification gates.
4. Keep shared imports package-based instead of deep relative paths.
5. Record principles and prevention patterns, not work logs.
6. Derive next priorities from unchecked plan items first.

## Event and Dashboard UI Patterns
- Participant cards: keep fixed internal hierarchy (`name -> class/power pills -> action`), reserve right-side action space up front, and anchor icon-only actions at the top-right with consistent hit area.
- Participant cards in dense grids: isolate destructive/action icons from metadata rows (separate row/column owner) so class/power pills cannot overlap with actions at narrow widths.
- Participant card visuals: combine class-derived accent gradients with semantic surface/border tokens; avoid raw white/black text assumptions and derive readable text from event/theme tokens.
- Dense stat panels (recent war): prioritize information compression with reduced typography scale, tabular numerals for metrics, and tighter spacing before introducing new visual effects.
- Grid behavior for roster-style cards: prefer responsive stepped columns (`1/2/3/4/5`) and uniform card min-height to prevent jumpy layout across breakpoints.
- Timeline markers: place `00:00` labels on the same baseline as the day timeline rail and avoid extra adjacent marker lines unless they encode additional meaning.

## Member Card Theme Colors (2026-02-13)
- Issue: Member cards used hardcoded colors (`GAME_CLASS_COLORS`) that didn't adapt to theme aesthetics, creating visual inconsistency (e.g., Cyberpunk had neon buttons but normal-colored cards).
- Cause: `getClassBaseColor()` always returned static hex values regardless of active theme.
- Fix pattern: Created CSS variable system (`_member-card-colors.css`) with 28 unique palettes (4 classes × 7 themes). Updated `getClassBaseColor()` to read `--member-card-{classType}` CSS variables with fallback to hardcoded colors. Zero component changes needed - colors update automatically via CSS cascade.
- Architecture: Each theme defines 4 variables per class (main, bg, border, text) matching theme identity (e.g., Cyberpunk uses neon colors, Minimalistic uses muted tones, Chibi uses pastels).
- Implementation: Single CSS import in `presets/index.css`, utility function reads CSS variables at runtime, WCAG AA compliant, zero performance cost.
- Testing: Playwright test suite validates all 28 color combinations, CSS variable existence, fallback behavior, contrast ratios, and theme switching.
- Documentation: `docs/MEMBER_CARD_THEME_COLORS.md` (technical guide), `docs/MEMBER_CARD_COLOR_REFERENCE.md` (quick reference), `docs/MEMBER_CARD_COLOR_IMPLEMENTATION_SUMMARY.md` (summary).
