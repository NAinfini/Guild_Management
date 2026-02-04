# Wiki / Tutorials (`/wiki`)

@FEATURE: WIKI_V1
@ROLE: External (read-only, optional), Member, Moderator, Admin

## Summary

Knowledge base for the guild: how-to guides, builds, rules, onboarding. Wiki content is HARD-CODED in the portal application.

## Implementation

- Wiki pages are static reference material (tutorials, guides)
- Served directly from the portal codebase for performance

## Content Model (v1)

### Article Fields

- Title
- Category
- Body (Markdown allowed — rendered safely with sanitization)
- Optional attachments
- updated_at + updated_by

## Initial WIKI Set

### 1. wiki is up
    quick wiki is here prompt


## Permissions

| Action | External | Member | Moderator | Admin |
|--------|----------|--------|-----------|-------|
| View articles | Yes | Yes | Yes | Yes |
| Search wiki | Yes | Yes | Yes | Yes |

