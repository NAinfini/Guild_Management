# Query Plan Benchmark Notes

## Change Set

- Added `idx_users_created` on `users(created_at_utc DESC)`.
- Added `idx_users_is_active` on `users(is_active)` for active-member list filtering.
- Added `idx_member_classes_user` and `idx_member_media_user` for roster/profile join paths.
- Added `idx_war_history_result_date` on `war_history(result, war_date DESC)` for history filtering with stable sort.

## Benchmark Protocol

1. Capture baseline with `EXPLAIN QUERY PLAN` for the target list query.
2. Apply schema/index update.
3. Re-run `EXPLAIN QUERY PLAN` with the same bind values.
4. Record whether scans became indexed lookups and whether sort spills were removed.

## Target Queries

- Members list with active-only filter and cursor ordering.
- Members list with role filter and cursor ordering.
- Any admin/member list path that sorts by `created_at_utc DESC`.

## Notes

- Keep this file updated with concrete plan outputs when running against staging or production-like data volumes.
