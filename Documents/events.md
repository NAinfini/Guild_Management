# Events (`/events`)

@FEATURE: EVENTS_UNIFIED
@ROLE: External (read-only), Member, Moderator, Admin
@REALTIME: PUSH_ENABLED (< 2s for signups)
@SCHEDULING: TIMEZONE_AWARE + CONFLICT_DETECTION

## Summary

Unified events system for weekly missions, guild wars, and other events. Each event has one signup list (no teams on Events page). Card-based list sorted by start time.

## Event Types

- `weekly_mission`
- `guild_war`
- `other`
- (Future: `social`, `patch_day`, `tournament`, )

## Core Fields (v1)

- type, title, description
- start time (store UTC, display local)
- optional end time
- capacity (max participants; optional)
- pinned/featured (Admin/Mod)
- signup locked (Admin/Mod)
- attachments (optional; shown in detail, not on card)

## Features

### Events Card List

- Default sort: start time ascending (soonest first)
- Each card shows:
  - Header: type chip + start time + status + small icon actions
  - Title + short description (2-3 line clamp)
  - Participants: `MemberGrid2x5` (10 slots) — username + class + power(card background color follow class color)
  - `+N` chip opens full participant list

### Card Actions (Icon Buttons)

- Join/Leave: single toggle icon (state-based, with tooltip)
- Copy All Members: `@wechat_name` default, fallback `@username`
- Admin/Mod only: Edit, Duplicate, Pin toggle, lock toggle, archive.

### Signup Rules

- Join = add user to signup list
- Leave = remove user from signup list
- If signup locked: members cannot Join/Leave; Admin/Mod can still edit participants
- Capacity: show `current/max` if set; Join disabled when full (Admin/Mod can override)

### Soft Conflict Warning

- If joining overlaps with another joined event: show warning "Conflicts with: <Event>"
- Still allow Join (non-blocking)

### Copy Formats

- Copy All Members: comma-separated `wechat_name` (fallback `username`)
- With label: `<event_name>: @wechat1, @wechat2, ...`

### Archived Events

- Main view fetches only non-archived events
- Archived button triggers server fetch

### Event Editor (Admin/Mod)

modal (desktop) / full-screen modal (mobile).
(type/title/desc/link)
(start/end)
(max participants)
add/remove members
delete dupe archive

### Smart Scheduling

- Every event stores in UTC
- Conflict detection on signup: check overlap with other joined events

### Local "NEW/UPDATED" Indicators

- localStorage `last_seen_events_at` timestamps
- Show NEW/UPDATED chips when `updated_at` is newer
- "Mark all as read" button

### Event Conflic

- if member has conflict event at same time, soft warn user about the conflicting event, but allow sign up afterwards.


## Loading & Empty States

- Skeleton loading for card list
- No upcoming events: "No upcoming events" + Admin/Mod CTA "Create event"
- Filtered empty: "No events match your filters" + "Reset filters"
- Archived empty: "No archived events yet"


## Permissions

| Action | External | Member | Moderator | Admin |
|--------|----------|--------|-----------|-------|
| View events | Yes (read-only) | Yes | Yes | Yes |
| Join/Leave | No | Yes | Yes | Yes |
| Copy members | No | Yes | Yes | Yes |
| Create/Edit event | No | No | Yes | Yes |
| Archive/Delete | No | No | Yes | Yes |
| Pin/Feature | No | No | Yes | Yes |
| Lock signup | No | No | Yes | Yes |
| Manage participants | No | No | Yes | Yes |

## Data

## Audit

- Create/edit/archive/delete events writes to AUDIT_LOG
- entity_type = `event`
- Participant changes (force-join/leave) are audited

## Freshness

- Push-enabled: < 2s for signup changes
- Safety poll: 60s while viewing
- ETag on all endpoints

## Security

- Sanitize description text
- Server-side capacity enforcement
- Server-side signup lock enforcement
