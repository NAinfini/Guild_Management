# Theme and Data Reliability Phase Plan

> Checklist format: each item is one sentence and can be executed independently.

## Phase 0: Stop Breaking Pagination

- [x] Harden shared pagination parsing so non-numeric `limit` values always fall back to a safe default instead of producing `NaN` SQL limits.
- [x] Replace endpoint-local pagination parsing in list handlers with the shared cursor and limit helpers so all endpoints behave consistently.
- [x] Add unit tests for pagination edge cases covering invalid limits, missing cursors, and malformed cursor payloads.
- [x] Add a contract test that verifies list endpoints always produce stable ordering fields required for cursor pagination.

## Phase 1: Normalize Backend Query Safety and Performance

- [x] Create a query audit checklist and apply it to list endpoints to enforce parameter binding, deterministic sort order, and cursor-safe filters.
- [x] Migrate simple list and CRUD queries from inline SQL strings to shared Drizzle or query-builder patterns to reduce per-endpoint logic drift.
- [x] Add missing indexes for high-frequency list paths on `users` timestamp and status columns used by filters and sort order.
- [x] Add relation indexes for membership joins on `member_media(user_id)` and `member_classes(user_id)` to reduce roster and profile query cost.
- [x] Add `war_history` indexes on date and active filter keys used by history pages and analytics queries.
- [ ] Run query-plan checks before and after index changes and store a short benchmark note in engineering docs.

## Phase 2: Make Theme Effects Cheap by Default

- [x] Route pointer and scroll effect signals through refs and CSS variables instead of React state to avoid high-frequency rerenders.
- [x] Pause theme animation loops when the document is hidden and resume on visibility restore to cut background CPU usage.
- [x] Enforce reduced-motion behavior globally so ambient and mascot effects degrade to low-motion or static behavior automatically.
- [x] Expand the theme preset contract to include token CSS, MUI theme options, ambient pack config, and optional mascot metadata.
- [x] Make ThemeController apply preset behavior from capability metadata instead of mode-specific conditionals so new themes are data-driven.
- [x] Add a `ThemeMascot` mount point that lazy-loads Rive only when motion is enabled and the active theme declares mascot support.

## Phase 3: Product and Test Polish

- [x] Persist theme and motion preferences per user profile and hydrate them on login to keep cross-device consistency.
- [x] Add skeleton and optimistic UI states to the heaviest list pages to improve perceived performance during network latency.
- [x] Add a list-endpoint integration test using a D1 fixture or mocked DB adapter to validate cursor flow end-to-end.
- [x] Add a regression test matrix for pagination and cursor stability so future endpoint changes cannot reintroduce edge-case breakage.

