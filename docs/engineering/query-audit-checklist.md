# Query Audit Checklist

Use this checklist before merging list endpoint or SQL changes.

- [ ] The query uses bound parameters for all user-controlled values and never string-concatenates raw input.
- [ ] The query has deterministic ordering with a stable tie-breaker column (for example timestamp DESC plus id DESC).
- [ ] Cursor pagination logic matches sort order and uses the same columns in both `ORDER BY` and cursor `WHERE` clauses.
- [ ] Default pagination values are safe, finite, and clamped with explicit minimum and maximum bounds.
- [ ] Invalid cursor and pagination parameters return a controlled application error instead of producing malformed SQL.
- [ ] Filters on high-cardinality fields map to existing indexes or include a follow-up index migration.
- [ ] SELECT projections only include columns needed by the endpoint response contract.
- [ ] Expensive joins and aggregates are reviewed with `EXPLAIN QUERY PLAN` for table scans on large paths.
- [ ] Query behavior for deleted/archived flags is explicit and covered by tests.
- [ ] At least one endpoint-level test verifies pagination stability and next-cursor correctness.
