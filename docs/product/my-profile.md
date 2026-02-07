# My Profile (`/profile`)

@FEATURE: MY_PROFILE
@ROLE: External (view-only via roster modal), Member, Moderator, Admin

## Summary

Member self-service editing for profile, availability, progression, and account settings. Admin/Mod can also open any member in edit mode via Admin Console.

## Layout

### Desktop

- Left column: Profile preview + quick actions
- Right column: Tabbed editor

### Mobile

- Stacked sections with tabs in top bar

## Left Column: Profile Preview

- Card with subtle gradient + glow on hover (consistent with portal style)
- Skeleton loading while fetching
- Empty states for missing media/availability

Shows how user appears on Roster:
- Avatar (if applicable)
- Username
- Active status chip
- title_html rendered (sanitized)
- Image/video counts

### Quick Actions

- "Edit my display (Title/Bio/Media)" -> opens member modal in Roster in edit mode
- Profile completion chip (local-only): highlights missing pieces (no bio / no availability / no audio)
- Open Analytics (focus me) — members only;

## Right Column: Tabs

### Tab 1: Profile

Editable fields (member self-service):
- **username** (login name) — MUST be UNIQUE; if changed, require re-login after save
- **power** (造诣) — total power value
- **classes** (multiple, ordered):
  - Ordered list; first item = Primary Class (show "Primary" badge)
  - Drag/drop reorder + "Set as primary" action
  - Prevent duplicates
  - Classes:鸣金虹,鸣金影,牵丝玉,牵丝霖,破竹风,破竹尘,破竹鸢,裂石威,裂石钧
    mingjin classes: blue
    qiansi classes: green
    pozhu classes:purple
    lieshi classes:dark red
- **title_html** - HTML styled title with tooltip explaining styling, copy example button
- **bio** - Plain text biography
- **media** (upload and manage):
  - **Images**: max 10 images, 5 MB each
    - Client-side conversion to WebP before upload
    - Drag/drop reorder
    - Delete option
    - Preview grid
  - **Audio**: max 1 audio file, 20 MB
    - Client-side conversion to Opus/OGG (48kbps, 16kHz, mono) before upload
    - Fallback to original format if browser doesn't support Opus encoding
    - Upload/replace/remove
    - Playback preview
  - **Video URLs**: max 10 video links (no raw uploads)
    - Whitelist: youtube.com, youtu.be, bilibili.com, vimeo.com
    - Add/remove/reorder URLs
    - Validation on client and server
  - **Upload progress**: Show conversion progress (10%, 20%...) and upload progress separately

Rules:
- react-hook-form + Save/Cancel

### Tab 2: Availability

- Weekly windows editor (Microsoft Teams-style):
  - Grid by day with addable time blocks
  - Click to create, drag edges to resize
  - Multiple blocks per day (e.g., 08:00-10:00 + 17:00-18:00)
  - clear day
- Vacation range: start/end date
- "Active now (estimated)" derived from windows (client calc)

### Tab 3: Progression

Purpose: track member progression levels for multiple categories.

3 top categories:
1. **qishu** (奇术) — 23 items
2. **wuxue** (武学) — 30 items
3. **xinfa** (心法) — 52 items

Each sub-item has: icon (required), label, integer level (stepper input)

UI:
- Left: category selector
- Right: grid list (5 columns desktop, 2 column mobile)
- Each row: [icon] Name [level -/+]
- Sticky jump bar: `qishu` | `wuxue` | `xinfa` (scroll to section + highlight)

Data rules:
- Levels: integers, min 0, max 20 (configurable)
- Naming: snake_case pinyin keys (no tones) for D1 columns and asset filenames


DB: one row per user per category (wide tables; integer level columns)

### Tab 4: Account

- Change password: current password, new password, confirm
- Logout button (also in top-right dropdown)

## Saving & Audit

- Each tab has own Save/Cancel (no global auto-save)
- "Unsaved changes" indicator per tab
- Confirm before leaving with unsaved changes
- After save: "Saved" toast + last_saved_at timestamp
- Audited changes: title_html, bio, availability, vacation, media
- No audit spam for "opened page"


## Permissions

| Action | External | Member | Moderator | Admin |
|--------|----------|--------|-----------|-------|
| View own profile | No | Yes | Yes | Yes |
| Edit own profile | No | Yes | Yes | Yes |
| Edit other profiles | No | No | Yes | Yes |
| Edit progression | No | Own only | Any member | Any member |
| Change password | No | Own only | Own only | Reset only |

## Data


## Freshness
- On-demand only; refresh after save/login/logout
- No background polling for profile page
