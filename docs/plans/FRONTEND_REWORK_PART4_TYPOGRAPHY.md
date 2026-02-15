# Frontend Rework - Part 4: Typography & Visual Design

**Date**: 2026-02-14
**Status**: COMPLETE (As-Built 2026-02-15)
**Week**: 1-2

---

## Overview

This document solves the "typography hierarchy unclear", "colors/contrast need improvement", and "components look dated/generic" problems.

---

## Current Typography Problems

### Inconsistent Font Weights

**Current usage (scattered across codebase):**
- 400 (normal)
- 600 (semibold)
- 700 (bold)
- 800 (extra bold) 鈿狅笍 Rarely used
- 900 (black)
- 950 (too heavy) 鈿狅笍

**Problems:**
- Too many weights (hard to maintain hierarchy)
- No clear when to use 700 vs 800 vs 900
- Inconsistent across components

### No Clear Hierarchy

**Example from AppShell:**
```tsx
<Typography variant="h6" sx={{ fontWeight: 950, /* ... */ }}>
  {t('common.app_name')}
</Typography>

<Typography variant="subtitle2" sx={{ fontWeight: 800, /* ... */ }}>
  {user?.username}
</Typography>

<Typography variant="body2" sx={{ fontWeight: 700, /* ... */ }}>
  {item.label}
</Typography>
```

**Problems:**
- MUI variants mixed with custom weights
- No semantic meaning (what's the difference between h6 + fw:950 and subtitle2 + fw:800?)
- Hard to achieve visual consistency

---

## New Typography System

### Font Families

```css
/* apps/portal/src/design-system/tokens/typography.css */

:root {
  /* Display: Headings, titles, UI labels */
  --font-display: 'Space Grotesk', system-ui, -apple-system, sans-serif;

  /* Body: Paragraph text, descriptions */
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;

  /* Mono: Code, IDs, technical content */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

**Usage Guidelines:**
- **Display**: All headings (h1-h6), button labels, nav items
- **Body**: All body text, form labels, descriptions
- **Mono**: User IDs (usr_123), code snippets, technical values

---

### Font Weights (Restricted Set)

```css
:root {
  --font-weight-normal: 400;    /* Body text */
  --font-weight-medium: 500;    /* Subtle emphasis */
  --font-weight-semibold: 600;  /* Strong emphasis, labels */
  --font-weight-bold: 700;      /* Headings */
  --font-weight-black: 900;     /* Display text, logos */
}
```

**Rules:**
- 鉂?Never use: 100, 200, 300, 800
- 鉁?Only use defined weights above
- 鉁?Enforce via components (can't pass arbitrary weights)

**Weight Usage Matrix:**

| Element | Weight | Example |
|---------|--------|---------|
| **Heading 1** | `bold` (700) | Page titles |
| **Heading 2-4** | `bold` (700) | Section headers |
| **Heading 5-6** | `semibold` (600) | Subsections |
| **Body Text** | `normal` (400) | Paragraphs, descriptions |
| **Lead Text** | `normal` (400) | Intro paragraphs |
| **Labels** | `semibold` (600) | Form labels, nav items |
| **Button Text** | `semibold` (600) | All buttons |
| **Captions** | `medium` (500) | Timestamps, metadata |
| **Display/Logo** | `black` (900) | App name, hero text |

---

### Type Scale (1.25 Ratio - Major Third)

```css
:root {
  --font-size-xs: 0.75rem;    /* 12px - labels, captions */
  --font-size-sm: 0.875rem;   /* 14px - body small */
  --font-size-base: 1rem;     /* 16px - body text */
  --font-size-lg: 1.125rem;   /* 18px - lead text */
  --font-size-xl: 1.25rem;    /* 20px - h4 */
  --font-size-2xl: 1.563rem;  /* 25px - h3 */
  --font-size-3xl: 1.953rem;  /* 31px - h2 */
  --font-size-4xl: 2.441rem;  /* 39px - h1 */
  --font-size-5xl: 3.052rem;  /* 49px - hero */
}
```

**Visual Scale:**
```
Hero (49px)     鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻?
H1 (39px)       鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅
H2 (31px)       鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻?
H3 (25px)       鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻堚枅
H4 (20px)       鈻堚枅鈻堚枅鈻堚枅鈻堚枅鈻?
Lead (18px)     鈻堚枅鈻堚枅鈻堚枅鈻堚枅
Body (16px)     鈻堚枅鈻堚枅鈻堚枅鈻?
Small (14px)    鈻堚枅鈻堚枅鈻堚枅
Caption (12px)  鈻堚枅鈻堚枅鈻?
```

---

### Line Heights

```css
:root {
  --leading-tight: 1.2;    /* Headings (more compact) */
  --leading-normal: 1.5;   /* Body text (readable) */
  --leading-relaxed: 1.75; /* Long-form content (comfortable) */
}
```

**Usage:**
- **Headings (h1-h6)**: `tight` (1.2) - saves vertical space
- **Body text**: `normal` (1.5) - comfortable reading
- **Long articles**: `relaxed` (1.75) - less eye strain

---

### Letter Spacing

```css
:root {
  --tracking-tight: -0.02em;  /* Large headings */
  --tracking-normal: 0;       /* Body text */
  --tracking-wide: 0.05em;    /* Uppercase labels */
  --tracking-wider: 0.1em;    /* Nav items, buttons */
}
```

**Usage:**
- **Large headings (h1-h2)**: `tight` (-0.02em) - tighter kerning looks better at large sizes
- **Body text**: `normal` (0) - default spacing
- **Uppercase text**: `wide` (0.05em) - improves legibility
- **ALL CAPS nav/buttons**: `wider` (0.1em) - much easier to read

---

## Typography Components

### Heading Component

```tsx
// apps/portal/src/components/primitives/Heading/Heading.tsx

import React, { ReactNode } from 'react';
import styles from './Heading.module.css';
import { cn } from '@/lib/utils';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingAlign = 'left' | 'center' | 'right';

interface HeadingProps {
  level: HeadingLevel;
  align?: HeadingAlign;
  children: ReactNode;
  className?: string;
}

export function Heading({ level, align = 'left', children, className }: HeadingProps) {
  const Tag = `h${level}` as const;

  return (
    <Tag
      className={cn(
        styles.heading,
        styles[`level-${level}`],
        styles[`align-${align}`],
        className
      )}
    >
      {children}
    </Tag>
  );
}
```

```css
/* Heading.module.css */

.heading {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  color: var(--color-text-primary);
  margin: 0;
}

.level-1 {
  font-size: var(--font-size-4xl);
  letter-spacing: var(--tracking-tight);
}

.level-2 {
  font-size: var(--font-size-3xl);
  letter-spacing: var(--tracking-tight);
}

.level-3 {
  font-size: var(--font-size-2xl);
}

.level-4 {
  font-size: var(--font-size-xl);
}

.level-5,
.level-6 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.align-left { text-align: left; }
.align-center { text-align: center; }
.align-right { text-align: right; }
```

**Usage:**
```tsx
<Heading level={1}>Dashboard Overview</Heading>
<Heading level={2}>Upcoming Events</Heading>
<Heading level={3} align="center">No Events Found</Heading>
```

---

### Text Component

```tsx
// apps/portal/src/components/primitives/Text/Text.tsx

import React, { ReactNode } from 'react';
import styles from './Text.module.css';
import { cn } from '@/lib/utils';

type TextSize = 'xs' | 'sm' | 'base' | 'lg';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'error' | 'warning';
type TextAlign = 'left' | 'center' | 'right';

interface TextProps {
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  as?: 'p' | 'span' | 'div' | 'label';
  children: ReactNode;
  className?: string;
}

export function Text({
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  as: Tag = 'span',
  children,
  className,
}: TextProps) {
  return (
    <Tag
      className={cn(
        styles.text,
        styles[`size-${size}`],
        styles[`weight-${weight}`],
        styles[`color-${color}`],
        styles[`align-${align}`],
        className
      )}
    >
      {children}
    </Tag>
  );
}
```

```css
/* Text.module.css */

.text {
  font-family: var(--font-body);
  line-height: var(--leading-normal);
  margin: 0;
}

/* Size Variants */
.size-xs {
  font-size: var(--font-size-xs);
}

.size-sm {
  font-size: var(--font-size-sm);
}

.size-base {
  font-size: var(--font-size-base);
}

.size-lg {
  font-size: var(--font-size-lg);
}

/* Weight Variants */
.weight-normal { font-weight: var(--font-weight-normal); }
.weight-medium { font-weight: var(--font-weight-medium); }
.weight-semibold { font-weight: var(--font-weight-semibold); }
.weight-bold { font-weight: var(--font-weight-bold); }

/* Color Variants */
.color-primary { color: var(--color-text-primary); }
.color-secondary { color: var(--color-text-secondary); }
.color-tertiary { color: var(--color-text-tertiary); }
.color-accent { color: var(--color-accent); }
.color-success { color: var(--color-success); }
.color-error { color: var(--color-error); }
.color-warning { color: var(--color-warning); }

/* Align Variants */
.align-left { text-align: left; }
.align-center { text-align: center; }
.align-right { text-align: right; }
```

**Usage:**
```tsx
<Text>Regular paragraph text</Text>
<Text size="sm" color="secondary">Caption or helper text</Text>
<Text size="lg" weight="medium">Lead paragraph</Text>
<Text color="error" weight="semibold">Error message</Text>
```

---

### Label Component

```tsx
// apps/portal/src/components/primitives/Label/Label.tsx

import React, { ReactNode } from 'react';
import styles from './Label.module.css';
import { cn } from '@/lib/utils';

interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Label({ htmlFor, required, children, className }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn(styles.label, className)}>
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
}
```

```css
/* Label.module.css */

.label {
  display: inline-block;
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin-bottom: var(--space-2);
}

.required {
  color: var(--color-error);
  margin-left: var(--space-1);
}
```

---

### Code Component

```tsx
// apps/portal/src/components/primitives/Code/Code.tsx

import React, { ReactNode } from 'react';
import styles from './Code.module.css';
import { cn } from '@/lib/utils';

interface CodeProps {
  children: ReactNode;
  className?: string;
}

export function Code({ children, className }: CodeProps) {
  return <code className={cn(styles.code, className)}>{children}</code>;
}
```

```css
/* Code.module.css */

.code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-default);
}
```

**Usage:**
```tsx
<Text>Your user ID is <Code>usr_abc123def</Code></Text>
<Text>Run <Code>npm install</Code> to install dependencies</Text>
```

---

## Color System Overhaul

### Problem: Too Many Color Variables

**Current:**
- `--sys-*` (system colors)
- `--cmp-*` (component colors)
- `--theme-*` (theme colors)
- Hard to know which to use when

### Solution: Simplified Color System

```css
/* apps/portal/src/design-system/tokens/colors.css */

:root {
  /* Surfaces (backgrounds) - 3 levels */
  --color-bg-base: #0a0a0f;
  --color-bg-elevated: #14141a;
  --color-bg-overlay: #1e1e24;

  /* Text (with opacity for hierarchy) - 4 levels */
  --color-text-primary: rgba(255, 255, 255, 0.95);
  --color-text-secondary: rgba(255, 255, 255, 0.65);
  --color-text-tertiary: rgba(255, 255, 255, 0.45);
  --color-text-disabled: rgba(255, 255, 255, 0.25);

  /* Interactive (theme-specific) */
  --color-accent: #00d9ff;        /* Overridden per theme */
  --color-accent-hover: #00b8d9;
  --color-accent-active: #0097b3;
  --color-accent-subtle: rgba(0, 217, 255, 0.1);

  /* Borders (subtle to strong) - 3 levels */
  --color-border-subtle: rgba(255, 255, 255, 0.08);
  --color-border-default: rgba(255, 255, 255, 0.12);
  --color-border-strong: rgba(255, 255, 255, 0.18);

  /* Semantic (consistent across themes) */
  --color-success: #10b981;
  --color-success-bg: rgba(16, 185, 129, 0.1);
  --color-warning: #f59e0b;
  --color-warning-bg: rgba(245, 158, 11, 0.1);
  --color-error: #ef4444;
  --color-error-bg: rgba(239, 68, 68, 0.1);
  --color-info: #3b82f6;
  --color-info-bg: rgba(59, 130, 246, 0.1);

  /* Shadows */
  --color-shadow: rgba(0, 0, 0, 0.25);
}
```

### Color Usage Guidelines

| Use Case | Color Variable | Example |
|----------|---------------|---------|
| **Page background** | `--color-bg-base` | Body, app shell |
| **Card background** | `--color-bg-elevated` | Cards, panels |
| **Modal background** | `--color-bg-overlay` | Dialogs, popovers |
| **Primary text** | `--color-text-primary` | Headings, body text |
| **Secondary text** | `--color-text-secondary` | Captions, descriptions |
| **Disabled text** | `--color-text-disabled` | Disabled inputs |
| **Buttons, links** | `--color-accent` | Primary actions |
| **Subtle borders** | `--color-border-subtle` | Card separators |
| **Strong borders** | `--color-border-strong` | Focus states |
| **Success state** | `--color-success` | Success badges, checkmarks |
| **Error state** | `--color-error` | Error messages, validation |

---

## Contrast Compliance (WCAG AA)

### Color Contrast Requirements

**WCAG AA Standards:**
- **Normal text**: 4.5:1 minimum
- **Large text (18px+)**: 3:1 minimum
- **Interactive elements**: 3:1 minimum

### Testing All Themes

**Automated check:**
```bash
# Install contrast checker
npm install -D pa11y-ci

# Run accessibility audit
npx pa11y-ci --threshold 10 http://localhost:5173
```

**Manual verification (per theme):**
```
[鉁揮 Neo-Brutalism:     All contrasts 4.5:1+
[鉁揮 Cyberpunk:         All contrasts 4.5:1+
[鉁揮 Steampunk:         All contrasts 4.5:1+
[鉁揮 Royal:             All contrasts 4.5:1+
[鉁揮 Chibi:             All contrasts 4.5:1+
[鉁揮 Minimalistic:      All contrasts 4.5:1+
[鉁揮 Post-Apocalyptic:  All contrasts 4.5:1+
```

**Fixes if failing:**
1. Increase text opacity
2. Darken/lighten background
3. Choose higher contrast accent color
4. Add text shadow for legibility

---

## Visual Polish

### Shadow System (Elevation)

```css
/* apps/portal/src/design-system/tokens/shadows.css */

:root {
  /* Elevation Levels (Material Design inspired) */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);

  --shadow-sm:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);

  --shadow-md:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.06);

  --shadow-lg:
    0 10px 15px rgba(0, 0, 0, 0.1),
    0 4px 6px rgba(0, 0, 0, 0.05);

  --shadow-xl:
    0 20px 25px rgba(0, 0, 0, 0.1),
    0 10px 10px rgba(0, 0, 0, 0.04);

  /* Focus Rings */
  --shadow-focus: 0 0 0 3px color-mix(in srgb, var(--color-accent) 30%, transparent);

  /* Accent Glows (theme-aware) */
  --shadow-accent-sm: 0 4px 12px color-mix(in srgb, var(--color-accent) 20%, transparent);
  --shadow-accent-md: 0 8px 20px color-mix(in srgb, var(--color-accent) 25%, transparent);
  --shadow-accent-lg: 0 12px 28px color-mix(in srgb, var(--color-accent) 30%, transparent);
}
```

**Shadow Usage:**

| Element | Shadow | Purpose |
|---------|--------|---------|
| **Buttons (default)** | `sm` | Subtle depth |
| **Buttons (hover)** | `md` | Lift effect |
| **Cards** | `md` | Elevated from page |
| **Cards (hover)** | `lg` | Interactive feedback |
| **Dialogs** | `xl` | Floats above everything |
| **Tooltips** | `sm` | Light overlay |
| **Dropdowns** | `lg` | Prominent menu |

---

### Shape System (Border Radius)

```css
/* apps/portal/src/design-system/tokens/shapes.css */

:root {
  /* Border Radius */
  --radius-sm: 6px;    /* Checkboxes, badges */
  --radius-md: 8px;    /* Buttons, inputs */
  --radius-lg: 12px;   /* Cards */
  --radius-xl: 16px;   /* Dialogs, large cards */
  --radius-2xl: 20px;  /* Hero sections */
  --radius-full: 9999px; /* Pills, avatars */

  /* Border Widths */
  --border-width-thin: 1px;
  --border-width-default: 1.5px;
  --border-width-thick: 2px;
  --border-width-heavy: 3px;
}
```

**Updated from current:**
- Cards: 14px 鈫?16px (+2px, more modern)
- Dialogs: 16px 鈫?20px (+4px, premium feel)
- Checkboxes: 4px 鈫?6px (+2px, better visibility)

---

## Migration Examples

### Before: Mixed Typography

```tsx
// Old (MUI + arbitrary weights)
<Typography variant="h6" sx={{ fontWeight: 950 }}>
  {t('common.app_name')}
</Typography>

<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
  {user?.username}
</Typography>

<Typography variant="body2" sx={{ fontWeight: 700 }}>
  {item.label}
</Typography>

<Typography variant="caption" sx={{ color: 'text.secondary' }}>
  {timestamp}
</Typography>
```

### After: Semantic Components

```tsx
// New (semantic, consistent)
<Display weight="black">
  {t('common.app_name')}
</Display>

<Heading level={3}>
  {user?.username}
</Heading>

<Label>
  {item.label}
</Label>

<Text size="sm" color="secondary">
  {timestamp}
</Text>
```

---

## Benefits

### Consistency
- 鉁?5 font weights (vs scattered 400-950)
- 鉁?Clear type scale (1.25 ratio)
- 鉁?Semantic components (Heading, Text, Label, Code)
- 鉁?WCAG AA contrast (all themes)

### Maintainability
- 鉁?Can't use arbitrary weights (enforced by components)
- 鉁?Easy to change globally (modify tokens)
- 鉁?Clear guidelines (when to use what)

### Performance
- 鉁?Fewer font weights = faster font loading
- 鉁?CSS variables = instant theme switching
- 鉁?No runtime calculations

---

## Next Steps

1. Create typography components (Week 1 Days 3-4)
2. Test contrast across all themes (Week 1 Day 7)
3. Migrate pages to new components (Week 2)
4. Remove MUI Typography (Week 3 Day 19)

---

## References

- [Part 1: Architecture](./FRONTEND_REWORK_PART1_ARCHITECTURE.md)
- [Part 2: Design System](./FRONTEND_REWORK_PART2_DESIGN_SYSTEM.md)
- [Part 3: Layout](./FRONTEND_REWORK_PART3_LAYOUT.md)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Type Scale Calculator](https://typescale.com/)

---

**Status**: COMPLETE (As-Built 2026-02-15)
**Timeline**: Week 1 Days 3-4 (components), Week 2 (migration)
**Dependencies**: Design system tokens (Part 2)

---

## As-Built Addendum (2026-02-15)

- Typography hierarchy and tokenized text styles are applied through primitive/component layers.
- Theme contrast and readability were validated in Day 20 Lighthouse and route sweep artifacts.

### Documented Deviations

- Existing locale and component copy structure was preserved while typography primitives were integrated incrementally.

