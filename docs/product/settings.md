# Settings (`/settings`)

@FEATURE: SETTINGS
@ROLE: External (theme/locale only), Member, Moderator, Admin

## Summary

Centralized place for user preferences. The only place for Theme and Localization controls (plus future toggles). All settings are client-side only.

## Access

- External: limited (theme/locale only, if external view enabled)
- Members: full
- Admin/Mod: same as members, plus any admin-only toggles added later

## Layout

### Desktop

- 2 columns: Left = settings categories, Right = selected panel

### Mobile

- Category list becomes top segmented control or list with drill-in

## Categories (v1)

### 1. Appearance

- Theme selector (dropdown or cards):
  - Shows theme name + preview swatch + glow preview
- Theme toggle (light/dark variants per theme, if applicable)
- "Fancy effects" toggle:
  - Glows on/off
  - Reduced motion toggle (respect OS `prefers-reduced-motion`)

### 2. Language

- Localization selector (dropdown): English / Chinese (expandable later)
- All date/time displays use local time (data stored UTC)
- String keys MUST be centralized (no hardcoded UI strings)


## Theme Controller Requirements

- Centralized ThemeController:
  - Provides MUI theme + custom tokens (glows, class tints, animations)
  - Supports adding new themes without refactoring pages
  - ThemeRegistry maps `themeKey -> MUI theme`
  - Persistence: localStorage
  - Runtime switching (no reload)
- Components MUST NOT hardcode colors; always use theme tokens
- Theme changes update all MUI components consistently


## Localization Controller Requirements

- Central I18nController:
  - Current locale (e.g., `en`, `zh`)
  - String lookup by key
  - Locale-aware formatting helpers (date/time/number)
  - Persistence: localStorage
- No hardcoded user-facing strings
- Dates stored UTC, localized for display only


## Permissions

| Action | External | Member | Moderator | Admin |
|--------|----------|--------|-----------|-------|
| Change theme | Yes | Yes | Yes | Yes |
| Change language | Yes | Yes | Yes | Yes |
| All settings | Limited | Yes | Yes | Yes |

