# Announcements (`/announcements`)

@FEATURE: ANNOUNCEMENTS
@ROLE: External (read-only), Member, Moderator, Admin
@REALTIME: POLL_ONLY (no push)

## Summary

Structured, readable announcements feed. Cards in a vertical list (newest first). Click card to open detail modal. No push required.

## Features

### Announcement List

- Cards in vertical list, newest first
- Clicking card body opens Announcement Detail modal
- External view = same UI, read-only
- Admin / Moderator only create announcement button
### Pinned Announcements

- Admin/Mod can pin announcements (recommend 1-3 max)
- Pinned cards appear at top with pin icon + subtle "featured" styling

### Filters

- Default: non-archived announcements only
- Filter chips: All / Pinned / Archived
- Archived is NOT loaded by default; fetches from server only when user clicks Archived
- Search: title + body

### Local "NEW" Indicators

- Track local `last_seen_announcements_at` in localStorage
- Cards created/updated since last seen show a NEW dot

### Announcement Card (List)

Each card shows:
- Title (1 line)
- Created time (local display; stored UTC)
- "NEW" dot (local-only)
- Pin icon (if pinned)
- Admin/Mod only: kebab menu (edit / dupe / archive / delete)

Interactions:
- Click card body -> open detail modal

### Announcement Detail (Modal)

Content:
- Header: title + timestamp (+ author if desired)
- Body (sanitized HTML)
- Image/media gallery: from `announcement_media` (concept: ANNOUNCEMENT_MEDIA; ordered by `sort_order`)

### Announcement Editor (Admin/Mod)

Modal on mobile, modal on desktop.

Fields:
- Title
- Body (plain text or limited formatting; always sanitized on render)
- Media attachments (images): upload/select + drag reorder + remove

Publishing controls:
- Save (immediate)
- Cancel

### Image Handling

- Editor: image strip with reorder + remove
- Detail modal: responsive grid/gallery; tap to open full-screen viewer
- Performance: lazy-load images in card list (thumbnails only); full media on detail modal open

## Loading & Empty States

- Skeleton loading for list fetch
- Empty: "No announcements yet" + Admin/Mod CTA "Create announcement"

## Permissions

| Action | External | Member | Moderator | Admin |
|--------|----------|--------|-----------|-------|
| View announcements | Yes (read-only) | Yes | Yes | Yes |
| Create/Edit | No | No | Yes | Yes |
| Archive/Unarchive | No | No | Yes | Yes |
| Delete | No | No | Yes | Yes |
| Pin/Unpin | No | No | Yes | Yes |

## Data

### Media

- Images: max 10 per announcement, each <= 5 MB, converted to WebP
- R2 key: `{instance}/announcement/{announcementId}/{ordinal}_{shortHash}.webp`

## Audit

- Create/edit/archive/delete writes to AUDIT_LOG
- entity_type = `announcement`
- Actions: `create`, `update`, `archive`, `delete`
- detail_text: short summary of changed fields

## Freshness

- Poll only (600s); focus revalidate on return
- No push channel for announcements
- ETag on list + detail endpoints

## Security

- Sanitize any formatted text before render (DOMPurify)
- External is read-only; no mutations
