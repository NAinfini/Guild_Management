# YysLS Portal — Global Rules

> This file is the single source of truth for AI agents working on this project.
> Read this before making any changes. Do not deviate from these rules.

## Project Identity

- **Product:** YysLS BaiYe Portal — a guild/organization management portal for the game "Where Winds Meet" (燕云十六声)
- **Repo structure:** Monorepo (portal + worker + shared contract)
- **Branch conventions:** `main` is the primary branch

## Architecture & Platform

### Stack (non-negotiable)

| Layer | Technology |
|-------|-----------|
| Frontend | React SPA (Vite) + MUI (Material UI) + MUI X |
| Routing | TanStack Router |
| Server state | TanStack Query (ETag-friendly caching) |
| Forms | react-hook-form + zod |
| Drag & drop | dnd-kit |
| Animation | motion |
| i18n | i18next + react-i18next |
| Dates | date-fns |
| Sanitization | DOMPurify |
| Global state | zustand (theme, settings, auth session) |
| Backend API | Cloudflare Worker + Hono |
| Database | Cloudflare D1 (SQLite) |
| Object storage | Cloudflare R2 |
| Realtime | Durable Objects (WebSocket push) |
| Validation | zod (shared between portal and worker) |
| IDs | nanoid or ulid |

### Deployment

- Frontend: Cloudflare Pages (static SPA)
- Backend: Cloudflare Worker (one worker per project instance)
- Each project instance has its own D1 database and R2 bucket (data isolation via bindings)
- No cross-project reads/writes

## Vocabulary (do not drift)

Use these terms consistently in UI, API, DB, code, and documentation:

- Classes: 鸣金虹, 鸣金影, 牵丝玉, 牵丝霖, 破竹风, 破竹尘, 破竹鸢, 裂石威, 裂石钧
- Class color groups:
  - Mingjin (鸣金*): blue
  - Qiansi (牵丝*): green
  - Pozhu (破竹*): purple
  - Lieshi (裂石*): dark red
- Power: 造诣

## Roles & Permissions

3 roles only:  `admin` / `moderator` / `member`.

| Rule | Enforcement |
| Admin can manage Member/Moderator roles | Server-side |
| Admin can grant/revoke Admin, moderator| Server-side |
| All destructive actions require confirmation | Client + Server |
| All role/permission changes are auditable | Server-side |
| Admin-only tools are visually gated AND server-enforced | Both |

### External View

- Same UI as Member, but read-only
- No mutations allowed

## Routing (routes vs tabs)

### Sidebar routes (v1)

- `/` Dashboard
- `/events` Events
- `/announcements` Announcements
- `/roster` Roster
- `/guild-war` Guild War (tabs: Active / History / Analytics)
- `/admin` Admin Console (tabs: Member Management / Status-Health)
- `/tools` Tools
- `/wiki` Wiki / Tutorials
- `/gallery` gallery
### top right avatar hover routes

- `/login` Login
- `/profile` My Profile
- `/settings` Settings

### Tabs are NOT separate routes

- Guild War tabs: Active / History / Analytics
- Admin Console tabs: Member Management / Audit sub-tab / Status-Health

## Data Rules

### Timezone

- Store all dates/times in **UTC**
- Render in **local time** for display
- Use locale-aware date/time formatting

### Media

- Images uploaded to R2 MUST be **WebP** (converted client-side before upload)
- Audio uploaded to R2 SHOULD be **Opus** (converted client-side before upload; fall back to original format if browser cannot encode Opus)
- Never use raw user filenames as storage keys
- Media uses **HARD DELETE** only (no soft delete for media)

### Media Quotas

| Area | Images | Audio |video| Max file size |
|------|--------|-------|-----|----------|
| Member Profile | 10 images | 1 audio |10 video urls| 5 MB img / 20 MB audio |

note, image and audio does not support url, just raw updates
10 video urls

### Delete Strategy

| Entity | Delete Type |
|--------|------------|
| Users | Soft delete (`deleted_at` timestamp) |
| Media | Hard delete (immediate CASCADE) |
| Announcements | Soft delete (archived flags) |
| Events | Soft delete (archived flags) |

### IDs

- Use `nanoid` for all entity IDs (including audit log IDs)
- Never use sequential/auto-increment IDs

## Error Handling

### Standard Error Response Shape (always)

```json
{
  "error_code": "string (stable)",
  "message": "string (human readable, safe)",
  "request_id": "string",
  "details": "optional (validation hints, never secrets)"
}
```

### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Field/constraint issues |
| `UNAUTHORIZED` | 401 | Not logged in / invalid session |
| `FORBIDDEN` | 403 | Role/permission denied |
| `NOT_FOUND` | 404 | Entity missing |
| `CONFLICT` | 409 | Optimistic concurrency / capacity reached |
| `RATE_LIMITED` | 429 | Auth or API throttling |
| `SERVER_ERROR` | 500 | Unexpected worker failure |
| `UPSTREAM_ERROR` | 502/503 | D1/R2 unavailable |

### UI Error Behavior

- Validation errors: inline field messages + keep user input
- 401: redirect to `/login` with return-to; show "Session expired"
- 403: show banner "You don't have permission"
- 409: show dialog with server-provided reason + refresh CTA
- Network/offline: show "Connection lost" banner; prevent destructive writes

## Security Rules

- Input sanitization for all user-supplied rich text/HTML (DOMPurify with strict allowlist)
- RBAC enforced on both client AND server
- Upload validation (type/size) before and after upload
- Generic error messages for login ("Invalid credentials") — never reveal if username exists
- Rate limit login by username + IP bucket (Worker-side)
- HttpOnly cookie sessions; client stores no password ever
- Never leak secrets in error responses
- `title_html` allowlist: `span`, `b`, `strong`, `i`, `em`, `u`, `br` tags only
- Style allowlist for `title_html`: `color`, `font-weight`, `font-style`, `text-decoration`

## UI/UX Invariants

### Theming

- No component may hardcode colors or spacing — always use theme tokens
- Centralized ThemeController provides MUI theme + custom tokens
- Theme changes happen at runtime (no reload)
- Themes stored in `localStorage` (no D1 persistence in v1)
- Support `prefers-reduced-motion` and `prefers-color-scheme`
- Tokenized z-index scale

### Localization

- No hardcoded user-facing strings in components — all text goes through `t(key)`
- Use i18next + react-i18next
- Languages: English + Chinese (expandable)
- Language preference stored in `localStorage`

### Navigation

- Desktop: sidebar (full icons + labels) + top-right profile dropdown
- Tablet: sidebar collapses to icon-only with tooltips
- Mobile: bottom nav (Home / Events / Guild War / Roster / More)
- Admin pages hidden from non-admin users (don't tease locked pages)

### Forms

- All forms use react-hook-form + zod validation
- Explicit Save/Cancel (no auto-save)
- Dirty-state protection: confirm before closing with unsaved changes
- "Unsaved changes" indicator visible when dirty

### Loading & Empty States

- Skeleton loading for all data-fetching views
- Progressive rendering: layout first, hydrate data as it arrives
- Empty states must be friendly and actionable (Admin/Mod CTAs where applicable)
- Optimistic UI for common actions (join/leave, small edits, toggles)

### Copy UX

- Copy outputs are plain text only (no Markdown) — optimized for Discord + WeChat
- Default format: `@wechat_name` (wechat_name, fallback to `username`)
- One-click copy with tooltip + toast feedback

### Responsive Breakpoints

- 360-400px: small phones
- 768px: tablet portrait
- 1024px: tablet landscape
- 1280px+: desktop
- 1440-1920px: large desktop
- Touch targets >= 48x48 on mobile
- Bottom-sheet modals on phones

### Accessibility

- Full keyboard navigation (Tab/Arrow/Enter/Escape)
- Visible focus rings on all interactive elements
- WCAG AA contrast targets
- Screen reader support (labels, headings, aria attributes)
- Alt text required for images
- Never rely on color alone to convey state

## Freshness & Realtime Strategy

### Push (WebSocket via Durable Object)

- Reconnect with exponential backoff (1s -> 10s -> 30s -> 60s, max 60s)
- If push disconnected, enable temporary polling; disable when push resumes
- only pages that require real time update use push like event page, and guild war assignment page

### Push Message Format

```json
{
  "type": "entity_changed",
  "entity_type": "event|war...",
  "entity_id": "string",
  "updated_at": "UTC string",
  "hint": "refresh_events_list|refresh_war_active|..."
}
```

### Module Freshness Targets

| Module | Freshness | Primary | Safety Poll |
|--------|-----------|---------|-------------|
| Events (event sign ups, guidl war assignment)| < 2s | Push | 60-120s while viewing |
| Announcements | 600s | Poll | Focus revalidate |
| Roster | 600s | Poll | Focus revalidate |
| Media Gallery | 600s | Poll | Manual refresh |
| Analytics/History | Immutable | None | staleTime: Infinity |
| Account/Settings | On demand | None | After save/login/logout |

### Polling Guardrails

- Only poll when tab is visible AND user is on that module
- Add jitter (+-10-20%) to avoid synchronized spikes
- Prefer cheap version/seq check before full refetch
- Back off when idle (2 minutes without interaction)

### ETag Strategy

- ETags are per-endpoint, not global
- Entity: `ETag = entity.updated_at`
- Lists: `ETag = hash(query_params + max(updated_at) + count + ids_sample)`
- Mutations must touch parent `updated_at` so list ETags change
- Use TanStack Query + conditional requests (`If-None-Match`)

## Audit Logging

### What to log

- Create/update/delete for: events, teams, wars, announcements, role changes, profile edits

### What NOT to log

- Login/logout
- Passive reads / "view" events
- Routine session activity

### Audit Entry Fields

- `entity_type`, `action`, `actor_id`, `entity_id`, `detail_text`, `diff_title`

## API Client Rules

- Central API client layer for all Cloudflare Worker calls
- Base URL from environment config
- Central endpoint registry (no scattered string URLs)
- Standardized fetch wrapper: auth cookies, ETag/If-None-Match, JSON parsing + zod validation, error mapping, AbortController
- TanStack Query built on top of API client
- Cache keys must be stable and consistent per entity

## Network Resilience

- If a mutation fails due to network: show toast + keep UI state locally
- for creationg, update, deletion each move is a discrete mutation; if fails, snap back + show toast
- Never queue writes offline
- On 401 during submit: preserve form state, redirect to login (return-to), allow re-submit after re-login

## Rate Limiting

- Login: rate limit by username + IP; show "Too many attempts, try again in X seconds"
- API: soft 429 limits for rapid repetitive mutations
- Uploads: file size limits enforced client-side and server-side + burst protection

## Documentation Conventions

### Search Tokens (for grep/search)

- `@INVARIANT:` global rules
- `@ROLE:` External / Member / Moderator / Admin
- `@FEATURE:` feature identifiers
- `@DATA:` D1 tables & relationships
- `@API:` endpoint groups
- `@REALTIME:` push/poll rules
- `@AUDIT:` audit rules
- `@UI:` UI patterns

## External View

**Disabled Content:**
- Login page (not needed)
- My Profile (personal)
- Admin Console (admin-only)
- signup buttons

**Member Visibility:**
- ✅ Show: username, power, primary class
- ❌ Hide: wechat_name (privacy), contact info, notes


## Notifications

### Storage Strategy

**localStorage-based:**
- `last_seen_announcements_at`: ISO timestamp
- `last_seen_events_at`: ISO timestamp
- `last_seen_members_at`: ISO timestamp

**Lazy Sync:**
- Background sync every 60 seconds

### UI Implementation

**Dashboard Card:**
```
Notifications:
  - 3 new announcements (NEW dot)
  - 2 new events (NEW dot)
  - 1 new member update (NEW dot)

[Mark All as Read]
```

**Per-Feature Behavior:**
- Clicking notification: navigate + mark as read
- "Mark All" button: mark all features as read
- New dot appears when entity updated after last_seen_at


---

## Username Change


### Process

1. User submits new username in My Profile
2. Validation:
   - Current password must be correct
   - New username must be unique
   - New username length: 3-50 characters

3. On success:
   - Update username in DB
   - Invalidate ALL sessions for this user
   - Audit log: "Username changed from X to Y"
   - Redirect to login page
   - Show message: "Username changed. Please log in with new username."

4. On failure:
   - Password incorrect → "Current password is incorrect"
   - Username taken → "Username already in use"

### Database Changes

```sql
-- Already exists, no changes needed
-- Just ensure password verification works
```

**Implementation:** 2-3 days

---

## Availability Timezone

**Selected:** UTC Storage + Local Display (No Multi-Timezone Sync)

### Storage

**Database:**
- Store all times in UTC (HH:MM format)
- Example: `14:00` = 14:00 UTC

### Display

**Client-side conversion:**
- Detect user's browser timezone
- Display UTC times in user's local timezone
- Automatic DST handling (JavaScript Date handles this)

**Example:**
```
Stored in DB: 14:00-16:00 (UTC)

User in Shanghai (UTC+8): displays as 22:00-00:00
User in New York (UTC-5): displays as 09:00-11:00
User in Tokyo (UTC+9): displays as 23:00-01:00
```

**Overlap Merging:**
- Automatically merge overlapping blocks
- Example: 08:00-10:00 + 09:00-11:00 = 08:00-11:00

### Availability UI

**Microsoft Teams-style editor:**
- Grid by day (Monday-Sunday)
- Click to add time block
- Drag edges to resize
- Multiple blocks per day allowed
- Clear day button

**Display reminder:**
- "Times are in UTC. Your browser shows local time conversion."

---

### Agent Work Rules

1. Read this file + the relevant feature documentation before making changes
2. Make changes only inside scoped files listed in the task
3. If a new rule is discovered, add it to the correct section
4. Do not expand scope — if unsure, add a `TODO` block instead of inventing behavior
5. Use MUST / SHOULD / MUST NOT for requirements
6. Prefer small bullets over long paragraphs

