# Knowledge Base

## Must Follow Rules
- Start every response with `\u4E3B\u4EBA`.
- End every response with `\u597D\u4E86\u55B5`.
- If a task is completed in one loop, record what worked about the implementation.
- If a task is a bug fix (or had issues), record `issue`, `cause`, and `fix`; do not log routine work.
- Merge overlapping knowledge and remove smaller duplicates.
- Use relevant skills; if a needed skill is missing, use `Find Skills` and install it (and MCP tools when available).

## Core Lessons Learned

### Knowledge Base Hygiene
**Learning:** Keep this file as reusable engineering guidance, not a changelog.

**Fix Pattern:**
1. Keep durable principles and prevention patterns only.
2. Remove progress snapshots, completion counts, and status narration.
3. Merge similar entries into one canonical rule.

### Rule Activation and Encoding Integrity
**Learning:** When asked to follow Knowledge Base rules, apply them immediately and keep files UTF-8 clean.

**Issue Pattern:** Response format drift or mojibake in instruction/localization files.

**Fix Pattern:**
1. Re-read `Knowledge_Base.md` before responding when rule compliance is requested.
2. Apply response format in the same turn.
3. Save locale/knowledge files as UTF-8 and verify by re-reading key lines.
4. If terminal encoding corrupts non-ASCII literals, patch via UTF-8-safe writer (or Unicode escapes) and verify output.

### Scope and Discovery Discipline
**Learning:** UI work quality improves when scope is pinned before implementation.

**Fix Pattern:**
1. Ask one targeted scoping question when intent is ambiguous.
2. When user selects an option, confirm briefly and proceed without re-asking.
3. For audits/reviews, confirm exact file/feature scope first.
4. When an issue spans multiple pages, trace shared components/theme overrides first.

### Localization Reliability
**Issue:** Chinese mode showing English labels or mixed-language UI.

**Cause:** Missing locale keys, fallback to `defaultValue`, and hardcoded strings in components.

**Fix Pattern:**
1. Ensure required keys exist in both `en` and `zh` for target surfaces.
2. Replace hardcoded UI strings with `t(...)` keys.
3. For shared settings/theme primitives, never render preset `opt.label` directly; resolve `theme_menu.*` keys with `defaultValue` fallback.
4. Localize status labels/chips too (for example `settings.active`).
5. Add regression tests for high-visibility localized labels and key coverage.
6. Include feature-specific filter labels in audits (for example history/archived filters).

### Theme System and Token Architecture
**Learning:** Runtime token-driven theming is required for consistency and fast switching.

**Fix Pattern:**
1. Keep palette and visual specs in a single source of truth.
2. Inject semantic (`--sys-*`) and component (`--cmp-*`) tokens at runtime.
3. Bridge utility token systems (`--foreground`, `--primary`, etc.) to the active runtime palette.
4. Apply token usage at primitive/component layer first so features inherit consistency.
5. Avoid hardcoded palette classes in feature UIs.

### Theme Effects and Motion Control
**Learning:** Theme personality must be scoped and composable, not global/noisy.

**Issue Pattern:** Cross-component hover bleed, double transforms, scrollbar artifacts, laggy motion.

**Fix Pattern:**
1. Scope motion/effects to component categories (`button`, `chip`, `card`, `input`, `nav`, `table`), not wildcard selectors.
2. Keep one transform owner per state (avoid base + theme hover transform stacking).
3. Use a shared ambient scene scaffold with per-theme render helpers.
4. Keep effects overflow-safe (`contain: paint`, `overflow: clip/hidden`) and reduced-motion safe.
5. Scale motion amplitude by intensity; do not increase duration with intensity.
6. For sliders controlling expensive theme state, preview locally on `onChange` and commit on `onChangeCommitted`.
7. Keep motif count/size data-driven for fast tuning.
8. For cinematic quality, build per-theme scenes as layered composition (`scene shell + grid/HUD + semantic objects + noise/vignette`) rather than single-icon loops.
9. For high-end ambient backgrounds, use a dedicated canvas layer with per-theme rendering schemes and keep DOM overlays (cursor rings, click bursts, labels) as a separate layer for clarity and maintainability.

### Theme UX Semantics and Contrast
**Learning:** Visual semantics must map clearly to meaning and preserve readability.

**Fix Pattern:**
1. Use semantic color mappings consistently (for example damage/tank/heal/status outcomes).
2. Use high-contrast foreground tokens for status surfaces.
3. Ensure selected/active controls have explicit readable foreground/background tokens.
4. For charts, use valid concrete token formats (no mismatched wrappers like `hsl(var(--token))` when tokens are not HSL channels).

### Account Menu and Settings Discoverability
**Issue:** Missing Theme/Color/Language controls in some account menu branches.

**Cause:** Inconsistent menu rendering between desktop/mobile/guest states.

**Fix Pattern:**
1. Keep Theme/Color/Language/Settings consistent across all account menu branches.
2. Keep `Login` as additional guest action.
3. Use submenu placement that avoids viewport-edge overlap.
4. Add regression tests for desktop and mobile account-menu paths.

### Component API and Layout Boundaries
**Learning:** Shared UI primitives need API parity and clear ownership boundaries.

**Fix Pattern:**
1. Keep reusable blocks under shared `components` ownership.
2. Extract shared components when reuse is stable and frequent.
3. Preserve wrapper API behavior (`className` is data, not callable).
4. Remove deprecated/unsupported props when upstream UI library APIs change.
5. Add opt-out hooks in shared primitives (for example hide default close button) for screen-specific layout needs.
6. Prefer token-based radius/surface styling over hardcoded values in composite containers.
7. For tool workspaces, place global selectors (theme/color) in compact header dropdowns and keep content in a responsive 2-column grid to avoid half-empty canvases.

### Data and Contract Reliability
**Learning:** Frontend/backend alignment and parsing formats are common hidden failure points.

**Fix Pattern:**
1. Audit worker routes, shared contracts, and frontend usage together.
2. Normalize date/time formats at API mapping boundaries before UI parsing.
3. Gate privileged actions by permission at render level (not only icon/state level).

### Quality Gates and Delivery Discipline
**Learning:** Quality should be enforced incrementally with explicit gates.

**Fix Pattern:**
1. Use phased guardrails: strict-zero in migrated areas, baseline-capped in legacy areas.
2. Promote baseline-managed folders to strict once they reach zero.
3. Run accessibility contrast checks for default/hover/active/disabled states.
4. Prefer existing dependencies before adding new ones.
5. Keep null safety and explicit typing at data boundaries.
6. Write behavior-focused tests with stable mocks and focused assertions.
7. Apply mobile-first defaults and verify narrow viewports.
8. Migrate currently rendered routes first for fastest user-visible impact.

## Portable Rules
1. Prefer token-driven styling over hardcoded palette utilities.
2. Keep hooks unconditional and in stable render order.
3. Use phased migrations with verification gates.
4. Keep shared imports package-based instead of deep relative paths.
5. Record principles and prevention patterns, not work logs.
6. Derive next priorities from unchecked plan items first.
