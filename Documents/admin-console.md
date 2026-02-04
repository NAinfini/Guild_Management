# Admin Console (`/admin`)

@FEATURE: ADMIN_CONSOLE
@ROLE: Moderator, Admin only (External and Member: no access)

## Summary

Centralized Admin/Moderator operations: member management, audit logs, and system health. 3 tabs: Member Management  Audit sub-tab and Status/Health.

## Access

- External: no access
- Member: no access
- Moderator: event/guild-war moderation
- Admin: full member + role management 

## Layout

- Uses global app shell: left sidebar + top-right profile dropdown
- 3 tabs:
  1. Member Management 
  2. Audit Log
  3. Status / Health

---

## Tab 1: Member Management

### Goals

- Manage members and permissions safely
- Fast search/filter, minimal clicks, strong audit visibility

### Desktop UI

- Top controls: search (username / wechat_name), filter chips
- Main area: MUI X Data Grid (dense)
  - Columns: username, wechat_name, role, class(es), power,notes,
  - Row selection: multi-select
  - Row click selects; double click opens details modal
    detial modal(should be its individual control as it is used elsewhere):

### Mobile/Tablet UI

- DataGrid becomes card list: username, role, active chip, class summary
- Tap opens full-screen details sheet (same tabs)
- Filters use bottom sheet modal

### Member Details modal

Tabs:
1. **Overview** — username, wechatname,role, class,power,note,vacation,active time ranges, progression.(ability level in 3 big categorys each with own icon and name)
2. **Profile** — title_html preview + safe rendering, bio edit
3. **Media** — image/video url gallery, audio, upload/replace
4. **Admin actions** — role change, deactivate/reactivate, reset password

MUST enforce:
- Admin/Mod can edit everything EXCEPT `username` and `password`

### Role Change Guardrails

- Promoting/demoting Admin and moderator: explicit confirmation dialog required

### Permissions Matrix

| Action | Moderator | Admin |
|--------|-----------|-------|
| Edit member profiles | Yes | Yes | 
| Edit media | Yes | Yes | 
| Change role to Member | No | Yes |
| Change role to Moderator | No | Yes | 
| Change role to Admin | No | Yes |
| Deactivate member | No | Yes |
| Reset password | No | Yes |


### Edit Ergonomics

- All edits: react-hook-form + explicit Save/Cancel
- "Unsaved changes" indicator in modal
- Validate with zod; sanitize title_html with DOMPurify

---

## Sub-tab: Audit Log

@FEATURE: AUDIT_LOG

### Access

Admin/Moderator only.

### UI

- Sub-tab inside Member Management (Members | Audit)
- Filters: entity type, actor (user), date range, search in detail_text
- Each entry: readable card line "Actor did Action on Entity (time)"
- Expand to see detail_text

### Audit Diff View

- Show human-readable diff header (before/after summary) above detail_text
- Examples: `title_html changed`, `vacation range changed`, `role changed`
- Keep detail_text for debugging, never rely on raw JSON only

## Audit Log Pagination

### Pagination Strategy

**Default Filter (Required):**
- Date range: **30 days** (last 30 days by default)
- Cannot query without date range (prevents full-table scans)
- Max range: 365 days

**Pagination:**
- Cursor-based (not offset)
- Page size: 50 entries per page
- Opaque cursor: next button provides cursor for next page

**API Endpoint:**
```typescript
GET /api/admin/audit-logs
{
  limit: 50,
  cursor?: string,
  filters: {
    date_range: {
      start_at: '2026-01-01',  // REQUIRED
      end_at: '2026-01-30'     // REQUIRED
    },
    entity_type?: string,
    actor_id?: string,
    search?: string
  }
}

Response:
{
  entries: [...],
  has_next: boolean,
  cursor: string,
  total_in_range: number,
  range_start: string,
  range_end: string
}
```

### Retention Policy

**Active Data**
- Keep in `audit_log` table: **30 days**
- Indexed and fast queries
- After 30 days: delete from table
**Cleanup Job:**
- Runs daily at 2 AM UTC
- delete entries older than 30 days


---

### Rules

- Log meaningful changes only: profile edits, role changes, war history edits, announcement edits, event edits
- Do NOT log sign-in/out or passive reads
- This list will be very long in the future, dig into cloudflare D1 price calculation to improve efficiency for this part, only query by index, and query only visible row by batch.
---

## Tab 2: Status / Health

@FEATURE: STATUS_HEALTH

### Goal

Simple "is everything connected?" page for multi-endpoint setups.

### Environment Awareness

- Show which environment/bindings are active:
  - Project name
  - Worker API base URL
  - D1 binding name / database name
  - R2 bucket binding / bucket name
- "Copy config summary" (one click) for debugging

### UI

- Cards per backend target: Worker API, D1, R2
- Each card: last check time, status (ok/degraded/down), basic latency bucket, "Retry" button
- Optional small log panel (local-only recent check results)

### Health Checks

- Worker: GET `/health` only
- D1: `SELECT 1`
- R2: HEAD on a known tiny object
- Manual only (no polling loop)

## Data

### Member Notes

- Purpose: private officer/admin notes (not visible to Members/External)
- Where shown: Admin Console -> Member Management -> Member detail modal ONLY
- Note edits must write audit log entry

## Freshness

- Poll: 60s, on-demand refresh for heavy tables
- Prefer virtualization when large
