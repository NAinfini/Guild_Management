# Frontend Rework - Part 3: Layout & Spacing System

**Date**: 2026-02-14
**Status**: COMPLETE (As-Built 2026-02-15)
**Week**: 1 (Days 5-7)

---

## Overview

This document defines the new layout system that solves the "wasted space" and "inconsistent spacing" problems identified in the current portal.

---

## Current Problems

### Inconsistent Spacing

**Example from Dashboard:**
```tsx
<div className="flex-1 space-y-4 p-1 md:p-2 pt-2 relative min-h-screen">
  {/* Arbitrary values: space-y-4, p-1, md:p-2, pt-2 */}
</div>
```

**Problems:**
- No pattern: `gap-4`, `gap-6`, `p-3`, `p-2`, `pt-2`, `pb-1`
- Different spacing on every page
- No rhythm or grid system
- Hard to maintain consistency

### Wasted Space

**Example from old Dashboard (2-column):**
```tsx
<div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,460px)]">
  {/* Left: 840px (Timeline) + 600px empty space */}
  {/* Right: Fixed 460px (too narrow) */}
</div>
```

**Problems:**
- Fixed column widths waste space on large screens
- Timeline cramped (120px per day)
- No responsive strategy for different screen sizes
- Each page handles layout differently

---

## New Layout System

### 1. Container System

#### Container Component

```tsx
// apps/portal/src/components/layout/PageContainer/PageContainer.tsx

import React, { ReactNode } from 'react';
import styles from './PageContainer.module.css';
import { cn } from '@/lib/utils';

type ContainerWidth = 'narrow' | 'comfortable' | 'standard' | 'wide' | 'full';
type ContainerSpacing = 'tight' | 'normal' | 'relaxed';

interface PageContainerProps {
  width?: ContainerWidth;
  spacing?: ContainerSpacing;
  children: ReactNode;
  className?: string;
}

export function PageContainer({
  width = 'standard',
  spacing = 'normal',
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        styles.container,
        styles[width],
        styles[spacing],
        className
      )}
    >
      {children}
    </div>
  );
}
```

#### Container CSS Module

```css
/* PageContainer.module.css */

.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--page-padding-x);
  padding-right: var(--page-padding-x);
}

/* Width Variants */
.narrow {
  max-width: var(--container-narrow); /* 900px */
}

.comfortable {
  max-width: var(--container-comfortable); /* 1200px */
}

.standard {
  max-width: var(--container-standard); /* 1400px */
}

.wide {
  max-width: var(--container-wide); /* 1800px */
}

.full {
  max-width: var(--container-full); /* 100% */
}

/* Spacing Variants */
.tight {
  padding-top: var(--space-4);
  padding-bottom: var(--space-4);
}

.normal {
  padding-top: var(--space-6);
  padding-bottom: var(--space-6);
}

.relaxed {
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
}
```

#### Usage Guidelines

| Page | Width | Spacing | Reasoning |
|------|-------|---------|-----------|
| **Dashboard** | `standard` | `normal` | Data-heavy, needs space for cards |
| **Events** | `standard` | `normal` | Multiple event cards, filters |
| **Members** | `standard` | `normal` | Member cards in grid |
| **GuildWar** | `wide` | `normal` | Teams + pool need horizontal space |
| **Announcements** | `comfortable` | `normal` | Reading-focused, not too wide |
| **Profile** | `comfortable` | `relaxed` | Form-heavy, breathing room |
| **Settings** | `comfortable` | `normal` | Settings panels |
| **Wiki** | `narrow` | `relaxed` | Long-form reading, focused |
| **Tools** | `standard` | `normal` | Utility cards |
| **Gallery** | `full` | `tight` | Images need maximum width |
| **Admin** | `wide` | `normal` | Tables, audit logs |

**Example Usage:**
```tsx
// Before (inconsistent)
function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-1 md:p-2 pt-2">
      {/* ... */}
    </div>
  );
}

// After (declarative)
function Dashboard() {
  return (
    <PageContainer width="standard" spacing="normal">
      {/* ... */}
    </PageContainer>
  );
}
```

---

### 2. Grid System

#### Grid Component

```tsx
// apps/portal/src/components/layout/Grid/Grid.tsx

import React, { ReactNode } from 'react';
import styles from './Grid.module.css';
import { cn } from '@/lib/utils';

type GridCols = 1 | 2 | 3 | 4 | 6 | 12;
type GridGap = 'tight' | 'normal' | 'relaxed';

interface ResponsiveCols {
  mobile?: GridCols;
  tablet?: GridCols;
  desktop?: GridCols;
  wide?: GridCols;
}

interface GridProps {
  cols?: GridCols | ResponsiveCols;
  gap?: GridGap;
  children: ReactNode;
  className?: string;
}

export function Grid({
  cols = 1,
  gap = 'normal',
  children,
  className,
}: GridProps) {
  // Parse responsive columns
  const responsive = typeof cols === 'object';
  const mobileCols = responsive ? (cols.mobile ?? 1) : cols;
  const tabletCols = responsive ? (cols.tablet ?? mobileCols) : cols;
  const desktopCols = responsive ? (cols.desktop ?? tabletCols) : cols;
  const wideCols = responsive ? (cols.wide ?? desktopCols) : cols;

  return (
    <div
      className={cn(
        styles.grid,
        styles[`gap-${gap}`],
        styles[`cols-mobile-${mobileCols}`],
        styles[`cols-tablet-${tabletCols}`],
        styles[`cols-desktop-${desktopCols}`],
        styles[`cols-wide-${wideCols}`],
        className
      )}
    >
      {children}
    </div>
  );
}
```

#### Grid CSS Module

```css
/* Grid.module.css */

.grid {
  display: grid;
  width: 100%;
}

/* Gap Variants */
.gap-tight { gap: var(--space-3); }
.gap-normal { gap: var(--space-4); }
.gap-relaxed { gap: var(--space-6); }

/* Mobile (default) */
.cols-mobile-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.cols-mobile-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cols-mobile-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.cols-mobile-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .cols-tablet-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .cols-tablet-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cols-tablet-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cols-tablet-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .cols-desktop-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .cols-desktop-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cols-desktop-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cols-desktop-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

/* Wide (1536px+) */
@media (min-width: 1536px) {
  .cols-wide-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .cols-wide-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cols-wide-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cols-wide-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .cols-wide-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}

/* Auto-fit variant (responsive without breakpoints) */
.grid-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
}
```

#### Usage Examples

**Dashboard - Timeline + Events Grid:**
```tsx
<PageContainer width="standard" spacing="normal">
  {/* Timeline - Full width */}
  <Timeline />

  {/* Main Grid: 3 columns on wide screens */}
  <Grid cols={{ mobile: 1, tablet: 2, wide: 3 }} gap="normal">
    {/* Events - takes 2 columns on wide screens */}
    <div className="xl:col-span-2">
      <UpcomingEvents />
    </div>

    {/* Sidebar - takes 1 column */}
    <div>
      <Notifications />
      <RecentWars />
    </div>
  </Grid>
</PageContainer>
```

**Events Page - Event Cards:**
```tsx
<PageContainer width="standard" spacing="normal">
  <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
    {events.map(event => (
      <EventCard key={event.id} event={event} />
    ))}
  </Grid>
</PageContainer>
```

**Members Page - Member Cards:**
```tsx
<PageContainer width="standard" spacing="normal">
  <Grid cols={{ mobile: 2, tablet: 3, desktop: 4 }} gap="tight">
    {members.map(member => (
      <MemberCard key={member.id} member={member} />
    ))}
  </Grid>
</PageContainer>
```

**GuildWar - Teams + Pool:**
```tsx
<PageContainer width="wide" spacing="normal">
  <Grid cols={{ mobile: 1, desktop: 2 }} gap="relaxed">
    <TeamColumn />
    <PoolColumn />
  </Grid>
</PageContainer>
```

---

### 3. Stack Component (Vertical Spacing)

#### Stack Component

```tsx
// apps/portal/src/components/layout/Stack/Stack.tsx

import React, { ReactNode } from 'react';
import styles from './Stack.module.css';
import { cn } from '@/lib/utils';

type StackGap = '1' | '2' | '3' | '4' | '6' | '8' | '12';
type StackAlign = 'start' | 'center' | 'end' | 'stretch';

interface StackProps {
  gap?: StackGap;
  align?: StackAlign;
  children: ReactNode;
  className?: string;
}

export function Stack({
  gap = '4',
  align = 'stretch',
  children,
  className,
}: StackProps) {
  return (
    <div
      className={cn(
        styles.stack,
        styles[`gap-${gap}`],
        styles[`align-${align}`],
        className
      )}
    >
      {children}
    </div>
  );
}
```

#### Stack CSS Module

```css
/* Stack.module.css */

.stack {
  display: flex;
  flex-direction: column;
}

/* Gap Variants */
.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }
.gap-12 { gap: var(--space-12); }

/* Align Variants */
.align-start { align-items: flex-start; }
.align-center { align-items: center; }
.align-end { align-items: flex-end; }
.align-stretch { align-items: stretch; }
```

#### Usage Example

```tsx
// Card with header, content, footer
<Card>
  <Stack gap="4">
    <Heading level={2}>Event Title</Heading>
    <Text>Event description goes here...</Text>
    <Button>Join Event</Button>
  </Stack>
</Card>

// Form with sections
<Stack gap="8">
  <Stack gap="4">
    <Label>Username</Label>
    <Input />
  </Stack>

  <Stack gap="4">
    <Label>Email</Label>
    <Input type="email" />
  </Stack>

  <Button>Submit</Button>
</Stack>
```

---

### 4. Cluster Component (Horizontal Wrapping)

#### Cluster Component

```tsx
// apps/portal/src/components/layout/Cluster/Cluster.tsx

import React, { ReactNode } from 'react';
import styles from './Cluster.module.css';
import { cn } from '@/lib/utils';

type ClusterGap = '1' | '2' | '3' | '4' | '6';
type ClusterJustify = 'start' | 'center' | 'end' | 'between';
type ClusterAlign = 'start' | 'center' | 'end';

interface ClusterProps {
  gap?: ClusterGap;
  justify?: ClusterJustify;
  align?: ClusterAlign;
  children: ReactNode;
  className?: string;
}

export function Cluster({
  gap = '2',
  justify = 'start',
  align = 'center',
  children,
  className,
}: ClusterProps) {
  return (
    <div
      className={cn(
        styles.cluster,
        styles[`gap-${gap}`],
        styles[`justify-${justify}`],
        styles[`align-${align}`],
        className
      )}
    >
      {children}
    </div>
  );
}
```

#### Cluster CSS Module

```css
/* Cluster.module.css */

.cluster {
  display: flex;
  flex-wrap: wrap;
}

/* Gap Variants */
.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }

/* Justify Variants */
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }

/* Align Variants */
.align-start { align-items: flex-start; }
.align-center { align-items: center; }
.align-end { align-items: flex-end; }
```

#### Usage Example

```tsx
// Buttons in a row
<Cluster gap="2" justify="end">
  <Button variant="ghost">Cancel</Button>
  <Button variant="primary">Save</Button>
</Cluster>

// Tags/badges
<Cluster gap="2">
  <Badge>Guild War</Badge>
  <Badge>Required</Badge>
  <Badge>5/10 slots</Badge>
</Cluster>

// Filter chips
<Cluster gap="3" justify="start">
  {filters.map(filter => (
    <Chip key={filter.id} label={filter.name} />
  ))}
</Cluster>
```

---

### 5. Split Component (Left-Right)

#### Split Component

```tsx
// apps/portal/src/components/layout/Split/Split.tsx

import React, { ReactNode } from 'react';
import styles from './Split.module.css';
import { cn } from '@/lib/utils';

type SplitGap = '4' | '6' | '8';
type SplitRatio = '1:1' | '1:2' | '2:1' | '1:3' | '3:1';

interface SplitProps {
  gap?: SplitGap;
  ratio?: SplitRatio;
  children: [ReactNode, ReactNode];
  className?: string;
}

export function Split({
  gap = '6',
  ratio = '1:1',
  children,
  className,
}: SplitProps) {
  return (
    <div
      className={cn(
        styles.split,
        styles[`gap-${gap}`],
        styles[`ratio-${ratio.replace(':', '-')}`],
        className
      )}
    >
      <div>{children[0]}</div>
      <div>{children[1]}</div>
    </div>
  );
}
```

#### Split CSS Module

```css
/* Split.module.css */

.split {
  display: grid;
  width: 100%;
}

/* Gap Variants */
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }

/* Ratio Variants */
.ratio-1-1 { grid-template-columns: 1fr 1fr; }
.ratio-1-2 { grid-template-columns: 1fr 2fr; }
.ratio-2-1 { grid-template-columns: 2fr 1fr; }
.ratio-1-3 { grid-template-columns: 1fr 3fr; }
.ratio-3-1 { grid-template-columns: 3fr 1fr; }

/* Mobile: Stack on small screens */
@media (max-width: 767px) {
  .split {
    grid-template-columns: 1fr;
  }
}
```

#### Usage Example

```tsx
// Profile header: avatar + info
<Split ratio="1:3" gap="6">
  <Avatar src={user.avatar} size="xl" />
  <Stack gap="2">
    <Heading level={1}>{user.username}</Heading>
    <Text color="secondary">{user.email}</Text>
  </Stack>
</Split>

// Settings: label + control
<Split ratio="2:1" gap="4">
  <Stack gap="1">
    <Label>Dark Mode</Label>
    <Text size="sm" color="secondary">Enable dark theme</Text>
  </Stack>
  <Switch />
</Split>
```

---

### 6. Center Component (Max-width Centered)

#### Center Component

```tsx
// apps/portal/src/components/layout/Center/Center.tsx

import React, { ReactNode } from 'react';
import styles from './Center.module.css';
import { cn } from '@/lib/utils';

type CenterWidth = 'narrow' | 'comfortable' | 'standard';

interface CenterProps {
  maxWidth?: CenterWidth;
  children: ReactNode;
  className?: string;
}

export function Center({
  maxWidth = 'comfortable',
  children,
  className,
}: CenterProps) {
  return (
    <div className={cn(styles.center, styles[maxWidth], className)}>
      {children}
    </div>
  );
}
```

#### Center CSS Module

```css
/* Center.module.css */

.center {
  box-sizing: content-box;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

.narrow { max-width: var(--container-narrow); }
.comfortable { max-width: var(--container-comfortable); }
.standard { max-width: var(--container-standard); }
```

#### Usage Example

```tsx
// Empty state message
<Center maxWidth="narrow">
  <Stack gap="4" align="center">
    <EmptyStateIcon />
    <Heading level={3}>No events yet</Heading>
    <Text color="secondary" align="center">
      Create your first event to get started
    </Text>
    <Button>Create Event</Button>
  </Stack>
</Center>

// Article content
<Center maxWidth="comfortable">
  <article>
    <Heading level={1}>Wiki Article Title</Heading>
    <Text>Article content here...</Text>
  </article>
</Center>
```

---

## Spacing Enforcement

### Tailwind Configuration

```ts
// tailwind.config.ts

export default {
  theme: {
    spacing: {
      // Restrict to 8px grid values only
      0: '0',
      1: 'var(--space-1)',
      2: 'var(--space-2)',
      3: 'var(--space-3)',
      4: 'var(--space-4)',
      6: 'var(--space-6)',
      8: 'var(--space-8)',
      12: 'var(--space-12)',
      16: 'var(--space-16)',
      20: 'var(--space-20)',
    },
  },
};
```

### ESLint Rule (Optional)

```js
// .eslintrc.js

module.exports = {
  rules: {
    // Warn on arbitrary Tailwind spacing values
    'tailwindcss/no-custom-classname': ['warn', {
      whitelist: [/* allowed custom classes */],
    }],
  },
};
```

---

## Responsive Breakpoints

### Standardized Breakpoints

```css
/* apps/portal/src/design-system/tokens/spacing.css */

:root {
  --bp-mobile: 0;
  --bp-tablet: 768px;
  --bp-desktop: 1024px;
  --bp-wide: 1536px;
}
```

### Usage in Components

```tsx
// Responsive grid
<Grid
  cols={{
    mobile: 1,     // 0-767px
    tablet: 2,     // 768-1023px
    desktop: 3,    // 1024-1535px
    wide: 4,       // 1536px+
  }}
  gap="normal"
>
  {items}
</Grid>
```

### Mobile-First Approach

All layouts are mobile-first:
1. Design for mobile (single column)
2. Add tablet breakpoint (2 columns)
3. Add desktop breakpoint (3-4 columns)
4. Add wide breakpoint (optimize for large screens)

---

## Migration Examples

### Before: Dashboard

```tsx
// Old inconsistent layout
<div className="flex-1 space-y-4 p-1 md:p-2 pt-2 relative min-h-screen overflow-x-hidden">
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,460px)]">
    <div className="flex flex-col gap-6">
      <div className="h-[280px]">
        <Timeline />
      </div>
      <div className="flex-1">
        <UpcomingEvents />
      </div>
    </div>
    <div className="flex flex-col gap-6">
      <Notifications />
      <RecentWars />
    </div>
  </div>
</div>
```

### After: Dashboard

```tsx
// New semantic layout
<PageContainer width="standard" spacing="normal">
  <Stack gap="6">
    <Timeline />

    <Grid cols={{ mobile: 1, tablet: 2, wide: 3 }} gap="6">
      <div className="xl:col-span-2">
        <UpcomingEvents />
      </div>

      <Stack gap="6">
        <Notifications />
        <RecentWars />
      </Stack>
    </Grid>
  </Stack>
</PageContainer>
```

**Benefits:**
- 鉁?Semantic component names (clear intent)
- 鉁?Consistent spacing (gap-6 everywhere)
- 鉁?Responsive without arbitrary breakpoints
- 鉁?No arbitrary padding values
- 鉁?Easy to understand structure

---

## Layout Checklist

### For Every Page:

- [ ] Wrap in `PageContainer` with appropriate width
- [ ] Use `Grid` for multi-column layouts
- [ ] Use `Stack` for vertical spacing
- [ ] Use `Cluster` for horizontal items that wrap
- [ ] Use `Split` for two-column layouts
- [ ] Use `Center` for centered content
- [ ] Only use spacing values from 8px grid (1, 2, 3, 4, 6, 8, 12, 16, 20)
- [ ] Test responsive behavior (mobile 鈫?tablet 鈫?desktop 鈫?wide)
- [ ] No arbitrary padding/margin values (p-1, md:p-2, etc.)

---

## Benefits

### Consistency
- **All pages** use same layout components
- **All spacing** from 8px grid
- **No arbitrary values** scattered everywhere

### Maintainability
- **Change once**, affects all instances
- **Clear patterns** for new pages
- **Easy to find** layout logic

### Responsive
- **Mobile-first** by default
- **Standard breakpoints** (768, 1024, 1536)
- **Declarative** responsive props

### Performance
- **No layout shift** (predictable spacing)
- **GPU-friendly** (transform-based)
- **Minimal CSS** (component-based)

---

## Next Steps

1. Create layout components (Week 1 Days 5-7)
2. Test with Dashboard (Week 2 Days 8-9)
3. Migrate all pages (Week 2-3)
4. Remove arbitrary spacing classes (Week 3 Day 19)

---

## References

- [Part 1: Architecture](./FRONTEND_REWORK_PART1_ARCHITECTURE.md)
- [Part 2: Design System](./FRONTEND_REWORK_PART2_DESIGN_SYSTEM.md)
- [Part 4: Typography](./FRONTEND_REWORK_PART4_TYPOGRAPHY.md)
- [Every Layout](https://every-layout.dev/) - Layout primitives inspiration

---

**Status**: COMPLETE (As-Built 2026-02-15)
**Timeline**: Week 1 Days 5-7
**Dependencies**: Design system tokens (Part 2)

---

## As-Built Addendum (2026-02-15)

- Shared layout primitives (`PageContainer`, `Grid`, `Stack`, `Cluster`, `Split`, `Center`) are implemented and used in migrated routes.
- Responsive route sweeps are recorded for 375/768/1024/1920 breakpoints.

### Documented Deviations

- Some feature-specific layout wrappers remain where domain behavior required them, while still following spacing/token conventions.

