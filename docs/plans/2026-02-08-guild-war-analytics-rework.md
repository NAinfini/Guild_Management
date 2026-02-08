# Guild War Analytics Rework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework Guild War Analytics into a stable, fully-localized, high-performance experience for **cross-war + cross-member analysis** with three production modes: `Compare`, `Rankings`, and `Teams`.

**Architecture:** Keep `AnalyticsContext` + mode panels, but remove legacy Player mode and treat Compare as adaptive (`0 selected` empty, `1 selected` timeline, `2+ selected` multi-line). Add first-class Team mode powered by explicit team snapshots. Move heavy aggregation/filtering to backend queries and return pre-shaped datasets so frontend charts render quickly even with large history windows.

**Tech Stack:** React 19, MUI, Recharts, TanStack Query v5, i18next, Cloudflare Worker + D1, shared API contracts, Vitest + Testing Library.

---

### Task 1: Baseline safety rails for all 3 modes

**Files:**
- Create: `apps/portal/tests/features/GuildWar/WarAnalytics.main.test.tsx`
- Create: `apps/portal/tests/features/GuildWar/WarAnalytics.filters.test.tsx`
- Create: `apps/portal/tests/features/GuildWar/WarAnalytics.teams-mode.test.tsx`
- Create: `apps/portal/tests/features/GuildWar/WarAnalytics.localization.test.tsx`

**Step 1: Write failing tests for current regressions**
- Assert mode strip shows only `Compare`, `Rankings`, `Teams`.
- Assert Compare mode adaptive behavior (0/1/2+ selected).
- Assert Team mode renders selector + chart shell.
- Assert no hardcoded English text in analytics controls.

**Step 2: Run tests to confirm failures**
- Run: `npx vitest --config config/vitest/vitest.portal.config.ts apps/portal/tests/features/GuildWar/WarAnalytics.main.test.tsx apps/portal/tests/features/GuildWar/WarAnalytics.filters.test.tsx apps/portal/tests/features/GuildWar/WarAnalytics.teams-mode.test.tsx apps/portal/tests/features/GuildWar/WarAnalytics.localization.test.tsx`

**Step 3: Commit baseline test scaffolding**
- Commit message: `test(guild-war): add analytics mode and regression coverage`

---

### Task 2: Finalize mode model (Compare, Rankings, Teams)

**Files:**
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/types.ts`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/AnalyticsContext.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/ModeStrip.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/WarAnalyticsMain.tsx`
- Create: `apps/portal/src/features/GuildWar/components/WarAnalytics/SubjectSelector.tsx`
- Optional remove/merge: `apps/portal/src/features/GuildWar/components/WarAnalytics/PlayerSelector.tsx`
- Optional remove/merge: `apps/portal/src/features/GuildWar/components/WarAnalytics/CompareSelector.tsx`

**Step 1: Remove legacy Player mode from state model**
- Replace mode union with `compare | rankings | teams`.
- Remove `playerMode` state from context.

**Step 2: Unify subject selection UI**
- Build one selector for Compare/Teams with tabs or segmented control inside left panel.
- Compare selection remains user-based with hard/soft caps.
- Team selection supports single/multi teams and quick presets (current roster teams).

**Step 3: Adaptive Compare chart behavior**
- `0 selected`: empty prompt.
- `1 selected`: render timeline-style chart.
- `2+ selected`: render compare trend chart.

**Step 4: Run targeted tests and commit**
- Commit message: `refactor(guild-war): standardize analytics modes and selectors`

---

### Task 3: Implement production Team mode UI + metrics

**Files:**
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/WarAnalyticsMain.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/MetricsPanel.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/utils.ts`
- Create: `apps/portal/src/features/GuildWar/components/WarAnalytics/TeamSelector.tsx`
- Create: `apps/portal/src/features/GuildWar/components/WarAnalytics/TeamTrendChart.tsx`
- Create: `apps/portal/src/features/GuildWar/components/WarAnalytics/TeamSummaryCards.tsx`

**Step 1: Replace Team placeholders**
- Remove “coming soon” alerts.
- Render Team selector in left panel and Team chart in center.

**Step 2: Team chart design**
- Use grouped/stacked trend by selected metric across wars.
- Add normalize toggle: `total` vs `per-member` values.
- Include participation denominator and missing-data badges per team.

**Step 3: Team metrics panel**
- Show top team, consistency score (std dev), average per war, participation depth.

**Step 4: Run tests and commit**
- Commit message: `feat(guild-war): add full team analytics mode`

---

### Task 4: Scale data handling for cross-war/cross-member workloads

**Files:**
- Modify: `apps/worker/src/api/wars/analytics.ts`
- Modify: `packages/shared-api/src/contracts.ts`
- Modify: `apps/portal/src/lib/api/wars.ts`
- Modify: `apps/portal/src/features/GuildWar/hooks/useWars.ts`
- Modify: `apps/portal/src/lib/queryKeys.ts`

**Step 1: Expand analytics query contract**
- Add explicit query params: `warIds[]`, `userIds[]`, `teamIds[]`, `mode`, `metric`, `aggregation`, `limit`, `cursor`, `includePerWar`.
- Return typed pagination metadata: `nextCursor`, `hasMore`, `totalWars`, `totalRows`, `samplingApplied`.

**Step 2: Push filtering/aggregation to backend**
- Build SQL with constrained WHERE/IN clauses for selected wars/users/teams.
- Return pre-aggregated ranking/team datasets instead of frontend recomputing large arrays.

**Step 3: Control payload size**
- Add hard limit for per-war points per series (e.g. last 200 wars by default).
- Add server downsampling for long ranges and expose `samplingApplied` in response.

**Step 4: Add/verify DB indexes for analytics scans**
- Ensure efficient indexes on `(war_id, user_id)`, `(user_id, war_id)`, and `war_history(war_date)`.

**Step 5: Run worker + portal tests and commit**
- Commit message: `perf(guild-war): move analytics aggregation server-side with pagination`

---

### Task 5: Graph performance + readability for huge datasets

**Files:**
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/CompareTrendChart.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/PlayerTimelineChart.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/RankingsBarChart.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/TeamTrendChart.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/utils.ts`

**Step 1: Reduce render cost**
- Memoize transformed series by hashable input keys.
- Replace repeated `.find()` in loops with map lookups.
- Keep legend and tooltip data minimal.

**Step 2: Downsample + windowing on client**
- Add viewport window (recent N wars default, pan for older).
- Use data point decimation for long series and indicate sampled state.

**Step 3: Improve chart UX for dense data**
- Cleaner axes, hover crosshair, pinned subject/team, and controlled legend toggles.
- Keep null gaps explicit and visually distinct from zeros.

**Step 4: Add transform/behavior tests and commit**
- Commit message: `perf(guild-war): optimize chart transforms and dense-series rendering`

---

### Task 6: Deterministic filter pipeline (no drift)

**Files:**
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/FilterBar.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/WarAnalyticsMain.tsx`
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/AnalyticsContext.tsx`

**Step 1: Define filter precedence**
- Date range -> war selection -> mode-specific subjects -> participation toggle.

**Step 2: Fix empty/partial states**
- Distinguish: no wars in range, no selected wars, no matching members/teams, no stats returned.

**Step 3: Keep filters URL-shareable (optional)**
- Encode core analytics state in query params for reproducible views.

**Step 4: Run tests and commit**
- Commit message: `fix(guild-war): make analytics filters deterministic and reproducible`

---

### Task 7: Localization completion + copy normalization

**Files:**
- Modify: `apps/portal/src/features/GuildWar/components/WarAnalytics/*.tsx`
- Modify: `apps/portal/src/i18n/locales/en.json`
- Modify: `apps/portal/src/i18n/locales/zh.json`

**Step 1: Remove remaining inline/default copy in analytics**
- All labels/tooltips/empty states/mode text must use explicit keys.

**Step 2: Add Team mode locale coverage**
- Team selector labels, chart tips, metrics, sampling/pagination notices.

**Step 3: Ensure locale files stay human-readable UTF-8**
- No escaped unicode blocks unless required.

**Step 4: Run i18n tests and commit**
- Commit message: `i18n(guild-war): complete compare-rankings-teams localization`

---

### Task 8: Verification + rollout notes

**Files:**
- Modify: `docs/product/todo.md`
- Optional create: `docs/plans/2026-02-08-guild-war-analytics-rework-notes.md`

**Step 1: Full verification**
- `npm run -s test:portal`
- `npm run -s typecheck:portal`
- `npm run -s test:worker`
- `npm run -s typecheck:worker`
- `npm run -s build:portal`

**Step 2: Manual QA checklist**
- Compare mode: 0/1/2+ selected behavior.
- Rankings mode: topN, class filter, min participation.
- Teams mode: team selection, total/per-member toggle, missing-data indicators.
- Large range performance: 100+ wars and multi-subject selections remain responsive.
- EN/ZH parity and no hardcoded analytics strings.

**Step 3: Document limitations and follow-ups**
- Note any deferred advanced analytics (forecasting, role-aware baselines).

**Step 4: Commit**
- Commit message: `chore(guild-war): complete analytics rework verification and notes`

---

## Recommended execution order
1. Task 1 (tests first)
2. Task 2 + Task 3 (mode and Team UI)
3. Task 4 + Task 6 (data pipeline + deterministic filters)
4. Task 5 (chart performance/readability)
5. Task 7 (localization pass)
6. Task 8 (verification and docs)

## Current feature baseline (from code)
- Compare mode with multi-member trend chart and legend focus/hide interactions.
- Rankings mode with Top-N chart and filter panel.
- Team mode state/types exist but UI/chart are placeholders.
- Analytics endpoint returns `memberStats` + `perWarStats`, but with broad `any` typing and no pagination/sampling metadata.

## High-impact improvements this plan targets
- Turn Team mode into a real production surface.
- Move expensive transformations off client and reduce payload size.
- Keep charts smooth under large cross-war datasets.
- Eliminate filter/data drift and lingering localization gaps.
