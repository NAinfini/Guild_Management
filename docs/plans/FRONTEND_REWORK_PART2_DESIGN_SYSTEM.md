# Frontend Rework - Part 2: Design System Structure

**Date**: 2026-02-14
**Status**: COMPLETE (As-Built 2026-02-15)
**Week**: 1 (Days 1-7)

---

## Overview

This document details the new design system architecture that will replace the current 26 fragmented CSS files with a unified, maintainable system.

---

## Current CSS Architecture (Problems)

### File Count: 26 CSS Files

```
apps/portal/src/
鈹溾攢鈹€ index.css
鈹溾攢鈹€ theme/
鈹?  鈹溾攢鈹€ theme.css
鈹?  鈹溾攢鈹€ layout.css
鈹?  鈹溾攢鈹€ effects.css
鈹?  鈹溾攢鈹€ enhancements.css
鈹?  鈹溾攢鈹€ accessibility-enhancements.css
鈹?  鈹溾攢鈹€ colors/
鈹?  鈹?  鈹斺攢鈹€ color-tokens.css
鈹?  鈹溾攢鈹€ presets/
鈹?  鈹?  鈹溾攢鈹€ index.css
鈹?  鈹?  鈹溾攢鈹€ _component-tokens.css
鈹?  鈹?  鈹溾攢鈹€ _global-improvements.css
鈹?  鈹?  鈹溾攢鈹€ _interactions-base.css
鈹?  鈹?  鈹溾攢鈹€ _control-animations.css
鈹?  鈹?  鈹溾攢鈹€ _theme-transitions.css
鈹?  鈹?  鈹溾攢鈹€ _shape-unification.css
鈹?  鈹?  鈹溾攢鈹€ _performance-optimizations.css
鈹?  鈹?  鈹溾攢鈹€ _theme-customization.css
鈹?  鈹?  鈹溾攢鈹€ _context-aware-theming.css
鈹?  鈹?  鈹溾攢鈹€ _theme-enhancements.css
鈹?  鈹?  鈹溾攢鈹€ _member-card-colors.css
鈹?  鈹?  鈹溾攢鈹€ neo-brutalism.css
鈹?  鈹?  鈹溾攢鈹€ cyberpunk.css
鈹?  鈹?  鈹溾攢鈹€ steampunk.css
鈹?  鈹?  鈹溾攢鈹€ royal.css
鈹?  鈹?  鈹溾攢鈹€ chibi.css
鈹?  鈹?  鈹溾攢鈹€ minimalistic.css
鈹?  鈹?  鈹斺攢鈹€ post-apocalyptic.css
```

### Problems

1. **Fragmentation**: 26 files, hard to find what you need
2. **Import Order Issues**: `@import` statements cause build warnings
3. **Duplication**: Color tokens defined in multiple places
4. **Conflicts**: Global selectors override MUI styles
5. **No Scoping**: All CSS is global (except rare CSS modules)
6. **Maintenance Hell**: Changes require editing 3-5 files

---

## New Design System Structure

### File Count: 17 Files (35% Reduction)

```
apps/portal/src/design-system/
鈹溾攢鈹€ index.css                 # Main entry point
鈹?
鈹溾攢鈹€ tokens/                   # Design tokens (6 files)
鈹?  鈹溾攢鈹€ colors.css           # Color system
鈹?  鈹溾攢鈹€ typography.css       # Type scale, weights, line-heights
鈹?  鈹溾攢鈹€ spacing.css          # 8px grid system
鈹?  鈹溾攢鈹€ shadows.css          # Elevation levels
鈹?  鈹溾攢鈹€ motion.css           # Timing, easing, durations
鈹?  鈹斺攢鈹€ shapes.css           # Border radius, border widths
鈹?
鈹溾攢鈹€ primitives/              # Base styles (3 files)
鈹?  鈹溾攢鈹€ reset.css            # Modern CSS reset
鈹?  鈹溾攢鈹€ layout.css           # Grid, flex utilities
鈹?  鈹斺攢鈹€ utilities.css        # Common helpers
鈹?
鈹溾攢鈹€ components/              # CSS Modules (component-specific)
鈹?  鈹溾攢鈹€ Button.module.css
鈹?  鈹溾攢鈹€ Input.module.css
鈹?  鈹溾攢鈹€ Card.module.css
鈹?  鈹斺攢鈹€ ... (scoped per component)
鈹?
鈹斺攢鈹€ themes/                  # 7 theme files
    鈹溾攢鈹€ neo-brutalism.css
    鈹溾攢鈹€ cyberpunk.css
    鈹溾攢鈹€ steampunk.css
    鈹溾攢鈹€ royal.css
    鈹溾攢鈹€ chibi.css
    鈹溾攢鈹€ minimalistic.css
    鈹斺攢鈹€ post-apocalyptic.css
```

---

## Design System Entry Point

### `apps/portal/src/design-system/index.css`

```css
/**
 * Guild Management Portal - Design System
 * Single entry point for all styling
 */

/* 1. Reset (first, clean slate) */
@import './primitives/reset.css';

/* 2. Design Tokens (foundation variables) */
@import './tokens/colors.css';
@import './tokens/typography.css';
@import './tokens/spacing.css';
@import './tokens/shadows.css';
@import './tokens/motion.css';
@import './tokens/shapes.css';

/* 3. Base Utilities */
@import './primitives/layout.css';
@import './primitives/utilities.css';

/* 4. Themes (loaded based on data-theme attribute) */
@import './themes/neo-brutalism.css';
@import './themes/cyberpunk.css';
@import './themes/steampunk.css';
@import './themes/royal.css';
@import './themes/chibi.css';
@import './themes/minimalistic.css';
@import './themes/post-apocalyptic.css';

/* Component CSS Modules are imported automatically by their components */
```

**Updated `apps/portal/src/index.css`:**
```css
/* Tailwind base */
@import "tailwindcss" source(".");

/* Design System (replaces 26 files) */
@import './design-system/index.css';

/* That's it! */
```

---

## Token Files (Design Foundation)

### 1. `tokens/colors.css` - Color System

```css
/**
 * Color System
 * Base colors defined here, theme-specific colors in theme files
 */

:root {
  /* Surfaces (backgrounds) */
  --color-bg-base: #0a0a0f;
  --color-bg-elevated: #14141a;
  --color-bg-overlay: #1e1e24;

  /* Text (with opacity for hierarchy) */
  --color-text-primary: rgba(255, 255, 255, 0.95);
  --color-text-secondary: rgba(255, 255, 255, 0.65);
  --color-text-tertiary: rgba(255, 255, 255, 0.45);
  --color-text-disabled: rgba(255, 255, 255, 0.25);

  /* Interactive (theme-specific, set in theme files) */
  --color-accent: #00d9ff;        /* Overridden per theme */
  --color-accent-hover: #00b8d9;
  --color-accent-active: #0097b3;

  /* Borders */
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
  --color-shadow-accent: var(--color-accent);
}
```

---

### 2. `tokens/typography.css` - Type System

```css
/**
 * Typography System
 * Font families, weights, sizes, line heights, letter spacing
 */

:root {
  /* Font Families */
  --font-display: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* Font Weights (restricted set for consistency) */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  /* Type Scale (1.25 ratio - Major Third) */
  --font-size-xs: 0.75rem;    /* 12px - labels, captions */
  --font-size-sm: 0.875rem;   /* 14px - body small */
  --font-size-base: 1rem;     /* 16px - body text */
  --font-size-lg: 1.125rem;   /* 18px - lead text */
  --font-size-xl: 1.25rem;    /* 20px - h4 */
  --font-size-2xl: 1.563rem;  /* 25px - h3 */
  --font-size-3xl: 1.953rem;  /* 31px - h2 */
  --font-size-4xl: 2.441rem;  /* 39px - h1 */
  --font-size-5xl: 3.052rem;  /* 49px - hero */

  /* Line Heights */
  --leading-tight: 1.2;    /* Headings */
  --leading-normal: 1.5;   /* Body text */
  --leading-relaxed: 1.75; /* Long-form content */

  /* Letter Spacing */
  --tracking-tight: -0.02em;  /* Large headings */
  --tracking-normal: 0;       /* Body text */
  --tracking-wide: 0.05em;    /* Uppercase labels */
  --tracking-wider: 0.1em;    /* Nav items */
}

/* Base Typography Styles */
body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-normal);
  color: var(--color-text-primary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

code, pre, kbd {
  font-family: var(--font-mono);
}
```

---

### 3. `tokens/spacing.css` - 8px Grid System

```css
/**
 * Spacing System
 * 8px base grid for consistent rhythm
 */

:root {
  /* Base Scale (8px grid) */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px  - icon gaps */
  --space-2: 0.5rem;   /* 8px  - tight spacing */
  --space-3: 0.75rem;  /* 12px - compact */
  --space-4: 1rem;     /* 16px - default gap */
  --space-6: 1.5rem;   /* 24px - section spacing */
  --space-8: 2rem;     /* 32px - page padding */
  --space-12: 3rem;    /* 48px - major sections */
  --space-16: 4rem;    /* 64px - hero spacing */
  --space-20: 5rem;    /* 80px - extra large gaps */

  /* Semantic Tokens (responsive) */
  --page-padding-x: clamp(1rem, 3vw, 2.5rem);
  --page-padding-y: var(--space-6);
  --section-gap: var(--space-8);
  --card-gap: var(--space-4);
  --inline-gap: var(--space-2);

  /* Container Widths */
  --container-narrow: 900px;      /* Wiki, Settings */
  --container-comfortable: 1200px; /* Dashboard, Profile */
  --container-standard: 1400px;   /* Events, Members */
  --container-wide: 1800px;       /* Guild War */
  --container-full: 100%;         /* Gallery */
}
```

---

### 4. `tokens/shadows.css` - Elevation System

```css
/**
 * Shadow System
 * Material Design-inspired elevation
 */

:root {
  /* Elevation Levels */
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

  --shadow-2xl:
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 12px 24px rgba(0, 0, 0, 0.08);

  /* Focus Rings */
  --shadow-focus: 0 0 0 3px color-mix(in srgb, var(--color-accent) 30%, transparent);
  --shadow-focus-error: 0 0 0 3px color-mix(in srgb, var(--color-error) 30%, transparent);

  /* Accent Shadows (theme-aware glows) */
  --shadow-accent-sm: 0 4px 12px color-mix(in srgb, var(--color-accent) 20%, transparent);
  --shadow-accent-md: 0 8px 20px color-mix(in srgb, var(--color-accent) 25%, transparent);
  --shadow-accent-lg: 0 12px 28px color-mix(in srgb, var(--color-accent) 30%, transparent);
}
```

---

### 5. `tokens/motion.css` - Animation System

```css
/**
 * Motion System
 * Timing, easing, durations for consistent animations
 */

:root {
  /* Durations */
  --duration-instant: 100ms;  /* Tooltips */
  --duration-fast: 150ms;     /* Hover states */
  --duration-normal: 250ms;   /* Transitions */
  --duration-slow: 350ms;     /* Page transitions */
  --duration-slower: 500ms;   /* Complex animations */

  /* Easings */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Preset Transitions */
  --transition-fast: var(--duration-fast) var(--ease-out);
  --transition-normal: var(--duration-normal) var(--ease-in-out);
  --transition-slow: var(--duration-slow) var(--ease-out);

  /* Common Properties */
  --transition-all: all var(--transition-normal);
  --transition-colors:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
  --transition-transform: transform var(--transition-normal);
  --transition-opacity: opacity var(--transition-fast);
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
    --duration-slower: 0ms;
  }

  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 6. `tokens/shapes.css` - Border System

```css
/**
 * Shape System
 * Border radius, border widths
 */

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

---

## Primitive Files (Base Styles)

### 1. `primitives/reset.css` - Modern CSS Reset

```css
/**
 * Modern CSS Reset
 * Based on Josh Comeau's reset + additions
 */

/* Box sizing */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Remove default margins */
* {
  margin: 0;
}

/* Improve text rendering */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Improve media defaults */
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Remove built-in form typography */
input, button, textarea, select {
  font: inherit;
}

/* Avoid text overflows */
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

/* Remove list styles (add back where needed) */
ol, ul {
  list-style: none;
  padding: 0;
}

/* Remove button styles */
button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

/* Links */
a {
  color: inherit;
  text-decoration: none;
}

/* Focus visible (modern browsers) */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Scrollbar styles (webkit) */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-base);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}
```

---

### 2. `primitives/layout.css` - Layout Utilities

```css
/**
 * Layout Utilities
 * Grid, flex, container helpers
 */

/* Container Utilities */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--page-padding-x);
  padding-right: var(--page-padding-x);
}

.container-narrow { max-width: var(--container-narrow); }
.container-comfortable { max-width: var(--container-comfortable); }
.container-standard { max-width: var(--container-standard); }
.container-wide { max-width: var(--container-wide); }
.container-full { max-width: var(--container-full); }

/* Flex Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }

/* Grid Utilities */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* Gap Utilities */
.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }

/* Responsive Breakpoints */
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 1536px) {
  .xl\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .xl\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
```

---

### 3. `primitives/utilities.css` - Common Helpers

```css
/**
 * Common Utility Classes
 */

/* Visibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Truncate Text */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Line Clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* GPU Acceleration */
.gpu-accelerate {
  will-change: transform;
  transform: translateZ(0);
}

/* Contain Layout */
.contain-layout {
  contain: layout style paint;
}

/* Interactive States */
.interactive {
  transition: var(--transition-transform);
  cursor: pointer;
}

.interactive:hover:not(:disabled) {
  transform: scale(1.02);
}

.interactive:active:not(:disabled) {
  transform: scale(0.98);
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes skeleton-wave {
  0%, 100% { background-position: 200% 0; }
  50% { background-position: -200% 0; }
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.fade-in {
  animation: fade-in var(--duration-normal) var(--ease-out);
}

.fade-in-up {
  animation: fade-in-up var(--duration-normal) var(--ease-out);
}
```

---

## Component CSS Modules

### Why CSS Modules?

1. **Scoped**: No global conflicts
2. **Type-safe**: Can generate TypeScript types
3. **Tree-shakeable**: Unused styles removed
4. **Co-located**: Styles next to component

### Example: `Button.module.css`

```css
/* Button.module.css */

.button {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  /* Typography */
  font-family: var(--font-body);
  font-weight: var(--font-weight-semibold);

  /* Spacing */
  padding: var(--space-3) var(--space-4);

  /* Shape */
  border-radius: var(--radius-md);
  border: var(--border-width-default) solid transparent;

  /* Interaction */
  cursor: pointer;
  transition: var(--transition-all);

  /* States */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

/* Size Variants */
.sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.md {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
}

.lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--font-size-lg);
}

/* Style Variants */
.primary {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    background: var(--color-accent-active);
    transform: translateY(0);
  }
}

.secondary {
  background: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border-default);

  &:hover:not(:disabled) {
    background: var(--color-bg-elevated);
    border-color: var(--color-border-strong);
  }
}

.ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;

  &:hover:not(:disabled) {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }
}

/* Loading State */
.loading {
  position: relative;
  color: transparent;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    margin: auto;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Usage in Component:**
```tsx
import styles from './Button.module.css';
import { cn } from '@/lib/utils';

<button
  className={cn(
    styles.button,
    styles[size],
    styles[variant],
    isLoading && styles.loading,
    className
  )}
>
  {children}
</button>
```

---

## Theme Files (7 Themes)

Each theme file overrides specific tokens to create unique visual identity.

### Example: `themes/cyberpunk.css`

```css
/**
 * Cyberpunk Theme
 * Neon colors, dark backgrounds, high contrast
 */

[data-theme='cyberpunk'] {
  /* Accent Colors */
  --color-accent: #00d9ff;          /* Cyan neon */
  --color-accent-hover: #00b8d9;
  --color-accent-active: #0097b3;

  /* Backgrounds */
  --color-bg-base: #0a0a0f;
  --color-bg-elevated: #14141a;
  --color-bg-overlay: #1e1e24;

  /* Additional Theme Colors */
  --color-theme-pink: #ff00ff;      /* Magenta neon */
  --color-theme-purple: #9d00ff;    /* Purple glow */
  --color-theme-yellow: #ffff00;    /* Electric yellow */

  /* Glow Effects */
  --shadow-accent-sm: 0 4px 12px rgba(0, 217, 255, 0.4);
  --shadow-accent-md: 0 8px 20px rgba(0, 217, 255, 0.5);
  --shadow-accent-lg: 0 12px 28px rgba(0, 217, 255, 0.6);

  /* Typography Adjustments */
  --font-display: 'Space Grotesk', 'Orbitron', monospace;
  --tracking-wide: 0.08em;  /* Slightly wider for tech feel */
}

/* Cyberpunk-specific effects */
[data-theme='cyberpunk'] .card {
  border: 1px solid var(--color-accent);
  box-shadow: var(--shadow-md), var(--shadow-accent-sm);
}

[data-theme='cyberpunk'] .button-primary {
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
}

[data-theme='cyberpunk'] .button-primary:hover {
  box-shadow: 0 0 30px rgba(0, 217, 255, 0.5);
}
```

**Other themes follow same pattern:**
- `neo-brutalism.css` - Sharp edges, bold borders, high contrast
- `steampunk.css` - Warm browns, gold accents, vintage textures
- `royal.css` - Deep purples, gold trim, elegant
- `chibi.css` - Pastel colors, rounded shapes, playful
- `minimalistic.css` - Grays, lots of whitespace, clean
- `post-apocalyptic.css` - Desaturated, gritty, weathered

---

## Migration from Old CSS

### Step-by-Step Migration

**Week 1 Day 1-2:**

1. **Create new structure** (don't delete old yet)
2. **Extract tokens** from old files
3. **Create new files** with extracted values
4. **Test build** with both old and new imported
5. **Verify themes** still work

**Week 1 Day 3-4:**

6. **Build components** with CSS modules
7. **Test scoping** (no global conflicts)

**Week 3 Day 19:**

8. **Delete old CSS files** (26 files)
9. **Remove old imports** from index.css
10. **Verify build** still works

---

## Benefits of New System

### Maintainability
- **1 entry point** vs scattered imports
- **Clear structure** (tokens 鈫?primitives 鈫?components 鈫?themes)
- **Easy to find** what you need

### Performance
- **Tree-shakeable** (CSS modules remove unused)
- **Smaller bundle** (no duplication)
- **Faster builds** (fewer files to process)

### Developer Experience
- **Type-safe** (CSS modules can generate types)
- **Scoped** (no naming conflicts)
- **Predictable** (token-based system)

### Design Consistency
- **Single source of truth** for tokens
- **Enforced standards** (only use defined tokens)
- **Theme-aware** (all components respect themes)

---

## Next Steps

1. Create `design-system/` folder structure
2. Migrate tokens from old CSS files
3. Build primitive styles
4. Test with one component (Button)
5. Gradually migrate all components
6. Delete old CSS (Week 3 Day 19)

---

## References

- [Part 1: Architecture Foundation](./FRONTEND_REWORK_PART1_ARCHITECTURE.md)
- [Part 3: Layout & Spacing](./FRONTEND_REWORK_PART3_LAYOUT.md)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)

---

**Status**: COMPLETE (As-Built 2026-02-15)
**Timeline**: Week 1 Days 1-2
**Dependencies**: None (can start immediately)

---

## As-Built Addendum (2026-02-15)

- Token and primitive-driven styling is implemented in active portal surfaces.
- Legacy style layers were consolidated with current theme/runtime files and component primitives.
- Theme behavior is validated through Day 20 route and theme sweeps.

### Documented Deviations

- The final structure preserved selected existing theme/runtime files while applying tokenized primitives, instead of a strict 17-file target.

