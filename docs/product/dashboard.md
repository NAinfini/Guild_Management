# Dashboard (`/`)

@FEATURE: DASHBOARD
@ROLE: External (read-only), Member, Moderator, Admin
@REALTIME: MIXED (push for events, poll for announcements/roster)

## Summary

Quick "what's happening" overview on load. Two-column desktop layout; single-column stacked on mobile.

## Layout

### Desktop

Upcoming Event (next 6 days)
self registered events
Notifications
Last Guild Warstats and mvp|
active/total member

## Features

### Upcoming Events Card

- **Window:** next 7 days
- **Count:** latest 3 upcoming items across all event types
- **Pinned/Featured strip:** if any event is pinned (Admin/Mod controlled), show a slim "Featured" strip above the 3 cards

#### Each Event Card Shows

- Header row: type chip + start time (local) + status chip
- Small icon actions: Join/Leave toggle, Copy signup, 
- Title (1 line) + short description (2-3 line clamp)
- Participants preview: MemberGrid2x5 (10 slots) showing username + class + power(background color differ by class)
- `+N` chip opens full participant list (popover desktop / modal mobile)

#### Card Hint Icons

- Capacity: `current/max` (e.g., `12/20`) if capacity exists
- Locked: lock icon if signup is locked
- Conflict: small conflict indicator if event overlaps another joined event (non-blocking)
- "Starts soon": badge + relative time if start is within 6 hours

#### Join/Leave Semantics

- Join = add user to event signup list
- Leave = remove user from signup list (and any assignment elsewhere)
- One toggle icon button with tooltip ("Join" / "Leave")

#### Copy Actions

- Copy signup: `<team_name>: @wechat1, @wechat2, ...` (or just names if no label). Uses `wechat_name` default, fallback `username`

### My Signups

- same as upcoming event, but smaller, show only event name for 7 days
- 8 day calender like style, including yesterday, list event in that calender day

### Notifications Card

- Shows "new changes since last seen" for: Events, Announcements, Members
- Grouped by type; each row: title + "new" dot + relative time
- Clicking navigates to relevant page (focus newest/most recently updated item)
- Backed by local-only `last_seen_*` timestamps in localStorage

### Last Guild War Card

- Top row: wins/loss +  kills(both sides)
- Secondary row: total credits / towers / base HP / distance (both sides)
- Highlights: overall top KDA + MVPs (damage / tank / healing)
- "View history" link navigates to Guild War History with latest war preselected

## Loading & Empty States

- Skeleton loading for all cards while fetching
- No upcoming events: "No upcoming events" + Admin/Mod CTA "Create event"
- No war history: "No wars recorded yet"
- No notifications: "No new updates"

## Permissions

| Action | External | Member | Moderator | Admin |
|--------|----------|--------|-----------|-------|
| View dashboard | Yes (read-only) | Yes | Yes | Yes |
| Join/Leave events | No | Yes | Yes | Yes |
| Copy signup | No | Yes | Yes | Yes |

## Data & Freshness

- Events: push-enabled (< 2s), safety poll 60s
- Announcements: poll only, focus revalidate
- Roster/Active Now: poll 600s, focus revalidate
- Guild War history: immutable, ETag + staleTime: Infinity
