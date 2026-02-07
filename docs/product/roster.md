# Roster (`/roster`)

@FEATURE: ROSTER
@ROLE: External (read-only), Member, Moderator, Admin
@REALTIME: POLL (60-120s, focus revalidate)

## Summary

Member directory with fancy, readable cards and a profile modal overlay. External view sees same UI, read-only. Notes are NOT shown anywhere in Roster (notes belong in Admin Console).

## Features

### Roster Card Grid

- Responsive card grid/list (not a table)
- Clicking a card opens Profile Modal (overlay)

#### Roster Card Fields

Each card shows:
- Icon/avatar (from profile media or default)
- Username (primary)
- Title (`title_html` — 1 line clamp)
- Status chip (single source of truth):
  - Active now: within active time window
  - Inactive: outside active windows
  - Unknown: no active time filled
  - Vacation: currently on vacation (overrides active window)
- Media count badges: image count, video count, audio available (yes/no)

#### Card Animation

- Subtle lift, wave + glow on hover (desktop)
- Pressed state on mobile
- Theme token for glow color (neutral accent)
- Fast, smooth transitions (no heavy box-shadows causing repaint)

### Audio Behavior

Two playback modes:
1. Hover playback on roster card (desktop only) — plays full clip, stops on mouse leave
2. Full playback inside Profile Modal
3. do not restart playing when clicked into modal, stop audio after exiting modal


Audio rules:
- Only one hover audio at a time (new hover stops previous)
- Debounce hover ~100ms (no spam)
- Stop immediately on mouse leave
- Respect browser autoplay policies
- Cache/load audio lazily (never fetch all audio on initial roster load)

### Roster Page Controls

- Filter bar (sticky)
- Audio controls (top-right): mute toggle, volume slider (0-100)
- All audio settings per-user in localStorage,
- Lazy-load members on scroll/pagination

### Filters & Sorting

- Search: username + wechat_name
- Sort (client-side): Power desc (default), Username A-Z, Class
- Saved views: per-user localStorage (no DB persistence)

### Profile Modal (Overlay)

**1. Header**
- Avatar/icon, Username
- Active chips
- Class chips (multiple; display as chips)
- Actions: Copy mention (wechat_name default), Close (X), Edit Profile (self or Admin/Mod)
- Title(html styled so member can change color or styles of their own title)
- Full bio (text)


**3. Media**
- Gallery viewer: images + videos(no raw video uploads only url) in single gallery UI
  - Swipe on mobile, arrow keys on desktop, show counts
- **Read-only display** - media is viewed here but NOT edited

Examples:
  - my-guild/members/usr_123/images/avatar_abc123.webp
  - my-guild/members/usr_123/audio/intro_def456.opus
  - my-guild/events/evt_456/attachments/doc_ghi789.pdf
  - my-guild/announcements/ann_789/images/banner_jkl012.webp
```

**Size Constraints (Only):**
- Images: max 5 MB per file, 10 files per member
- Audio: max 20 MB per file, 1 file per member
- Video URLs: 10 links (links only, no upload)
- Event attachments: 10 MB per file, 5 files per event
- Announcements: 5 MB per image, 10 images per announcement

**Conversion (Client-side, before upload in `/profile` page):**
- Images → WebP (Canvas API)
- Audio → Opus/OGG, 48kbps, 16kHz, mono (Web Audio + MediaRecorder; fallback to original if unsupported)
- Video URLs → stored as-is (no conversion)
- Show conversion / upload progress to user, like conversion 10, 20%, upload 1-%, 20%

**Video URL Whitelist:**
```javascript
const ALLOWED_HOSTS = ['youtube.com', 'youtu.be', 'bilibili.com', 'vimeo.com'];
// Validation: regex match + domain check (client + server)
```

**Cleanup Strategy:**
- Delete old file immediately when replaced (optimistic delete)
- If delete fails: log error, continue (file becomes orphan)
- No soft-delete for media
- No version history/rollback

---

### title_html Rules

- Stored as `member_profiles.title_html`
- Rendered with DOMPurify strict allowlist: `span`, `b`, `strong`, `i`, `em`, `u`, `br`
- Tooltip: "Titles support limited HTML styling" + example
- Click copies raw title_html string; toast "Title copied"
- Editor: text input + live preview + "Copy example" button

## Loading & Empty States

- Skeleton loading for roster fetch
- Virtualize card list if roster is large
- Empty: "No members found" + "Reset filters"


## Permissions

| Action | External | Member | Moderator | Admin |
|--------|----------|--------|-----------|-------|
| View roster | Yes  | Yes | Yes | Yes |
| Open profile modal | Yes  | Yes | Yes | Yes |
| Edit own profile | no profile | Yes | Yes | Yes |
| Edit other profiles | No | No | Yes | Yes |
| Play audio | Yes | Yes | Yes | Yes |

## Data

### Media

- Images: max 10, each <= 5 MB, converted to WebP
- Audio: max 1, <= 20 MB after conversion to Opus
- Video URLs: max 10 (links only, no upload)

## Performance

- Roster list fetch is lightweight (no heavy media payloads)
- Lazy media fetch: audio URL only on hover debounce or modal open; gallery only on modal open
- Hover throttle: 200ms debounce (configurable)
- Cache media lookups in-memory during session
- Virtualize if roster is large

## Audit

- Profile edits (title_html, bio, availability, vacation, media) are audited
- No audit for passive reads

## Freshness

- Poll: 600s, focus revalidate
- ETag on roster endpoints
