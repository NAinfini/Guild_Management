# Theming Guidelines

Date: 2026-02-11

## Purpose

This guide defines the required styling contract for feature code.

Goals:
- Keep visual consistency across themes.
- Allow component-specific effects without hardcoded palette utilities.
- Preserve accessibility (WCAG AA) and maintainability.

## Required Token Layers

1. Semantic tokens (`--sys-*`)
- Use for layout/surface/text intent.
- Examples: `--sys-surface-panel`, `--sys-text-primary`, `--sys-border-default`.

2. Component tokens (`--cmp-*`)
- Use for component shells and states.
- Examples: `--cmp-card-bg`, `--cmp-button-bg`, `--cmp-input-border`.

3. Status/accent foreground tokens
- Use readable foreground on tinted or accent backgrounds.
- Examples: `--color-status-success-fg`, `--color-status-error-fg`, `--color-accent-primary-fg`.

## Mandatory Rules

1. Do not use hardcoded Tailwind palette utility classes in feature UI.
- Forbidden examples: `text-red-500`, `bg-black/60`, `border-blue-500`.

2. Do not hardcode status text color to status stroke color when text sits on a status background.
- Use `--color-status-*-fg` for text on `--color-status-*-bg` surfaces.

3. Use `theme.custom` mappings for semantic status domains.
- Use `theme.custom.eventTypes`, `theme.custom.chips`, `theme.custom.result`, `theme.custom.warRoles`.

4. Keep interaction states explicit.
- Provide hover/active/focus-visible/disabled states using token values.

5. Prefer primitive components that already carry token hooks.
- Use shared primitives with `data-ui`/`ui-*` anchors (`Button`, `Card`, `Input`, `Badge`, `Table`, `Dialog`).

## Component Usage Patterns

### Card-like panels
```tsx
<Card className="border border-[color:var(--cmp-card-border)] bg-[color:var(--cmp-card-bg)]" />
```

### Status pill
```tsx
<span
  style={{
    backgroundColor: 'var(--color-status-success-bg)',
    color: 'var(--color-status-success-fg)',
    borderColor: 'color-mix(in srgb, var(--color-status-success) 50%, transparent)',
  }}
/>
```

### Interactive button shell
```tsx
<Button
  sx={{
    backgroundColor: 'var(--cmp-button-bg)',
    color: 'var(--cmp-button-text)',
    '&:hover': { backgroundColor: 'var(--cmp-button-hover-bg)' },
    '&:active': { backgroundColor: 'var(--cmp-button-active-bg)' },
  }}
/>
```

## Guardrails

Automated checks:
- `npm run -s lint:theme-guardrails`
- `npm run -s audit:theme-contrast`

Scope of `lint:theme-guardrails`:
Strict (must stay zero):
- `apps/portal/src/features/Dashboard`
- `apps/portal/src/features/Events`
- `apps/portal/src/features/Announcements`
- `apps/portal/src/features/Settings`
- `apps/portal/src/features/Tools`
- `apps/portal/src/features/Members`
- `apps/portal/src/features/Profile`
- `apps/portal/src/features/Wiki`
- `apps/portal/src/features/GuildWar`

Baseline file:
- `scripts/theme-token-guardrail-baseline.json`
- Refresh command (only when intentionally accepting current debt snapshot): `node scripts/enforce-theme-token-usage.mjs --write-baseline`

## Review Checklist (PR)

- No hardcoded palette utility classes introduced in guarded feature folders.
- Status text on status backgrounds uses `*-fg` tokens.
- New component visuals use `--cmp-*`/`--sys-*` tokens.
- Contrast audit passes for changed token values.
