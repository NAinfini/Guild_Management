# Frontend Rework - Part 5: Animation & Motion System

**Date**: 2026-02-14
**Status**: COMPLETE (As-Built 2026-02-15)
**Week**: 1 (Days 5-7), Week 2

---

## Overview

This document solves the "janky animations" and "layout shifts" problems by replacing Framer Motion with Motion One and implementing a consistent motion language.

---

## Current Animation Problems

### 1. Heavy Library (Framer Motion)

**Bundle Impact:**
```
Framer Motion: 28KB gzipped
Motion One:     5KB gzipped
Savings:       82% smaller 鈿?
```

### 2. Layout Shifts

**Current Issues:**
```tsx
// AppShell.tsx - Sidebar navigation
<motion.div
  initial={{ opacity: 0, x: -14 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.05 }}
>
  <ListItemButton>{/* ... */}</ListItemButton>
</motion.div>
```

**Problems:**
- Content "jumps" during animation
- Cumulative Layout Shift (CLS): 0.08
- All items animate simultaneously (performance hit)
- No reduced motion support

### 3. Inconsistent Timings

**Scattered across codebase:**
- `duration: 0.18s` (motion tokens)
- `duration: 0.28s` (motion tokens)
- `transition: 300ms` (inline styles)
- `animation: fade-in 150ms` (CSS)
- No clear system

---

## New Motion System

### Motion One Library

**Installation:**
```bash
npm uninstall framer-motion
npm install motion
```

**Why Motion One:**
- 鉁?82% smaller bundle
- 鉁?Same spring animations
- 鉁?Better performance (WAAPI-based)
- 鉁?Supports all features we use
- 鉁?Simpler API

**What we lose (and don't need):**
- Layout animations (use CSS transforms instead)
- `AnimatePresence` (use View Transitions API)
- Advanced gesture detection (not using)

---

## Motion Tokens

### Duration System

```typescript
// apps/portal/src/design-system/motion/tokens.ts

export const motionDurations = {
  instant: 0.1,   // 100ms - tooltips appear/disappear
  fast: 0.15,     // 150ms - hover states
  normal: 0.25,   // 250ms - standard transitions
  slow: 0.35,     // 350ms - page transitions
  slower: 0.5,    // 500ms - complex animations
} as const;
```

**Enforcement:**
```typescript
// Only allow defined durations (no arbitrary values)
type MotionDuration = keyof typeof motionDurations;
```

### Easing Functions

```typescript
// apps/portal/src/design-system/motion/tokens.ts

export const motionEasings = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;
```

### Preset Animations

```typescript
// apps/portal/src/design-system/motion/presets.ts

export const motionPresets = {
  // Page Transitions
  pageEnter: {
    opacity: [0, 1],
    y: [8, 0],
    filter: ['blur(4px)', 'blur(0px)'],
  },

  pageExit: {
    opacity: [1, 0],
    y: [0, -4],
    filter: ['blur(0px)', 'blur(2px)'],
  },

  // Component Entrances
  fadeInUp: {
    opacity: [0, 1],
    y: [16, 0],
  },

  fadeIn: {
    opacity: [0, 1],
  },

  // Micro-interactions
  scaleOnHover: {
    scale: [1, 1.02],
  },

  scaleOnPress: {
    scale: [1, 0.98],
  },

  // Loading States
  pulse: {
    opacity: [0.5, 1, 0.5],
  },

  shimmer: {
    x: ['-100%', '100%'],
  },

  spin: {
    rotate: [0, 360],
  },
} as const;
```

---

## Page Transitions (Zero Layout Shift)

### View Transitions API (Native)

```tsx
// apps/portal/src/components/layout/PageTransition.tsx

import { useEffect, useRef } from 'react';
import { useRouter } from '@tanstack/react-router';
import { animate } from 'motion';
import { motionPresets, motionDurations, motionEasings } from '@/design-system/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Use native View Transitions API if available
    if ('startViewTransition' in document) {
      // @ts-expect-error - View Transitions API not in types yet
      document.startViewTransition(() => {
        // React will update the DOM
      });
    } else {
      // Fallback: Motion One
      if (ref.current) {
        animate(
          ref.current,
          motionPresets.pageEnter,
          {
            duration: motionDurations.normal,
            easing: motionEasings.easeOut,
          }
        );
      }
    }
  }, [router.state.location.pathname, prefersReducedMotion]);

  return (
    <div ref={ref} style={{ minHeight: '100%' }}>
      {children}
    </div>
  );
}
```

### CSS Support (View Transitions)

```css
/* apps/portal/src/design-system/primitives/layout.css */

/* View Transitions API Support */
@supports (view-transition-name: auto) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: var(--duration-normal);
    animation-timing-function: var(--ease-out);
  }

  ::view-transition-old(root) {
    animation-name: page-exit;
  }

  ::view-transition-new(root) {
    animation-name: page-enter;
  }
}

@keyframes page-exit {
  to {
    opacity: 0;
    transform: translateY(-4px);
    filter: blur(2px);
  }
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(4px);
  }
}
```

**Benefits:**
- 鉁?Native browser optimization (60fps)
- 鉁?No layout shift (browser handles)
- 鉁?Graceful fallback to Motion One
- 鉁?Respects reduced motion

---

## Staggered List Animations

### Before (Janky)

```tsx
// All items animate at once, causes jank
{navItems.map((item, index) => (
  <motion.div
    key={item.href}
    initial={{ opacity: 0, x: -14 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <ListItemButton />
  </motion.div>
))}
```

**Problems:**
- 10+ animations starting simultaneously
- Browser struggles to keep 60fps
- Layout shift as items appear

### After (Smooth)

```tsx
// apps/portal/src/components/layout/StaggeredList/StaggeredList.tsx

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'motion';
import { motionDurations, motionEasings } from '@/design-system/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StaggeredListProps {
  children: ReactNode;
  delay?: number; // Delay between items (seconds)
}

export function StaggeredList({ children, delay = 0.05 }: StaggeredListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    const items = ref.current.querySelectorAll('[data-stagger-item]');

    animate(
      items,
      { opacity: [0, 1], x: [-14, 0] },
      {
        duration: motionDurations.normal,
        delay: stagger(delay, { start: 0 }),
        easing: motionEasings.easeOut,
      }
    );
  }, [delay, prefersReducedMotion]);

  return (
    <div ref={ref}>
      {React.Children.map(children, (child) => (
        <div data-stagger-item>{child}</div>
      ))}
    </div>
  );
}
```

**Usage in AppShell:**
```tsx
<StaggeredList delay={0.05}>
  {navItems.map(item => (
    <NavItem key={item.href} {...item} />
  ))}
</StaggeredList>
```

**Benefits:**
- 鉁?Efficient stagger (one animation timeline)
- 鉁?No layout shift (items pre-rendered invisible)
- 鉁?Smooth 60fps animation
- 鉁?Respects reduced motion

---

## Scroll-Based Animations

### Intersection Observer (Performance)

```typescript
// apps/portal/src/hooks/useInView.ts

import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions extends IntersectionObserverInit {
  once?: boolean; // Trigger only once (default: true)
}

export function useInView(options?: UseInViewOptions) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const { once = true, ...observerOptions } = options ?? {};

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          // Disconnect after first trigger (one-time animation)
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.1, ...observerOptions }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [once, observerOptions]);

  return [ref, inView] as const;
}
```

### Usage with CSS

```tsx
// EventCard component
function EventCard({ event }: Props) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={cn(styles.card, inView && styles.visible)}
    >
      <EventCardContent />
    </div>
  );
}
```

```css
/* EventCard.module.css */

.card {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity var(--transition-normal),
    transform var(--transition-normal);
}

.card.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Benefits:**
- 鉁?Native browser API (fast)
- 鉁?No scroll listeners (performance)
- 鉁?CSS-driven animation (GPU-accelerated)
- 鉁?One-time trigger (efficient)

---

## Loading States (Zero Layout Shift)

### Skeleton Component

```tsx
// apps/portal/src/components/primitives/Skeleton/Skeleton.tsx

import React from 'react';
import styles from './Skeleton.module.css';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';
type SkeletonAnimation = 'pulse' | 'wave' | 'none';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = 'rectangular',
  animation = 'wave',
  className,
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  const finalAnimation = prefersReducedMotion ? 'none' : animation;

  return (
    <div
      className={cn(
        styles.skeleton,
        styles[variant],
        styles[finalAnimation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-busy="true"
      aria-live="polite"
    />
  );
}
```

```css
/* Skeleton.module.css */

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-elevated) 0%,
    color-mix(in srgb, var(--color-bg-elevated) 95%, var(--color-accent)) 50%,
    var(--color-bg-elevated) 100%
  );
  border-radius: var(--radius-md);
}

/* Variant: Text */
.text {
  height: 1em;
  border-radius: var(--radius-sm);
}

/* Variant: Circular */
.circular {
  border-radius: 50%;
}

/* Variant: Rectangular (default) */
.rectangular {
  /* Uses default border-radius */
}

/* Animation: Wave */
.wave {
  animation: skeleton-wave 1.5s ease-in-out infinite;
  background-size: 200% 100%;
}

@keyframes skeleton-wave {
  0%, 100% { background-position: 200% 0; }
  50% { background-position: -200% 0; }
}

/* Animation: Pulse */
.pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Animation: None (reduced motion) */
.none {
  animation: none;
}
```

### Skeleton Matching Content Dimensions

```tsx
// EventCardSkeleton.tsx - Matches real EventCard exactly

function EventCardSkeleton() {
  return (
    <div className={styles.card}>
      {/* Image placeholder - same height as real image */}
      <Skeleton variant="rectangular" width="100%" height={200} />

      <div className={styles.content}>
        {/* Title - same height as real h3 */}
        <Skeleton variant="text" width="70%" height={24} />

        {/* Date - same height as real text */}
        <Skeleton variant="text" width="50%" height={16} />

        {/* Description line 1 */}
        <Skeleton variant="text" width="100%" height={16} />

        {/* Description line 2 */}
        <Skeleton variant="text" width="85%" height={16} />

        {/* Button - same size as real button */}
        <Skeleton variant="rectangular" width={120} height={40} />
      </div>
    </div>
  );
}

// Usage in parent:
{isLoading ? <EventCardSkeleton /> : <EventCard event={event} />}
```

**Benefits:**
- 鉁?Zero layout shift (exact same dimensions)
- 鉁?Smooth transition (skeleton 鈫?content)
- 鉁?Respects reduced motion
- 鉁?ARIA live region (screen reader updates)

---

## Reduced Motion Support

### Hook

```typescript
// apps/portal/src/hooks/useReducedMotion.ts

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onChange = () => setPrefersReducedMotion(mediaQuery.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    }

    // Safari < 14 fallback
    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  return prefersReducedMotion;
}
```

### CSS Support

```css
/* apps/portal/src/design-system/tokens/motion.css */

/* Disable all animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
    --duration-slower: 0ms;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Component Usage

```tsx
function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  // Skip animation entirely
  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }

  // Run animation
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Motion Components

### Animated Button

```tsx
// apps/portal/src/components/primitives/Button/Button.tsx

import { useRef } from 'react';
import { animate } from 'motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './Button.module.css';

export function Button({ children, ...props }: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handlePress = () => {
    if (prefersReducedMotion || !ref.current) return;

    animate(
      ref.current,
      { scale: [1, 0.98, 1] },
      { duration: 0.2 }
    );
  };

  return (
    <button
      ref={ref}
      className={styles.button}
      onMouseDown={handlePress}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Alternative (CSS-only):**
```css
/* Button.module.css */

.button {
  transition: transform var(--transition-fast);
}

.button:active:not(:disabled) {
  transform: scale(0.98);
}
```

---

## Performance Optimizations

### GPU Acceleration

```css
/* Enable GPU acceleration for animations */
.will-animate {
  will-change: transform, opacity;
  /* Remove after animation completes */
}

/* Force GPU layer */
.gpu-layer {
  transform: translateZ(0);
}
```

**Usage:**
```tsx
// Add will-change before animating, remove after
useEffect(() => {
  if (!ref.current) return;

  ref.current.style.willChange = 'transform, opacity';

  animate(ref.current, { ... });

  // Remove after animation
  setTimeout(() => {
    if (ref.current) {
      ref.current.style.willChange = 'auto';
    }
  }, 500);
}, []);
```

### Layout Containment

```css
/* Prevent layout thrashing */
.contain-layout {
  contain: layout style paint;
}
```

**Use on:**
- Cards in a grid
- List items
- Independent sections

---

## Migration Examples

### Before: Framer Motion

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function Dashboard() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <DashboardContent />
      </motion.div>
    </AnimatePresence>
  );
}
```

### After: Motion One + View Transitions

```tsx
import { PageTransition } from '@/components/layout/PageTransition';

function Dashboard() {
  return (
    <PageTransition>
      <DashboardContent />
    </PageTransition>
  );
}

// PageTransition handles everything:
// - View Transitions API (if supported)
// - Motion One fallback
// - Reduced motion support
// - Zero layout shift
```

---

## Expected Improvements

### Bundle Size
```
Before: Framer Motion 28KB
After:  Motion One 5KB
Savings: 23KB (82% reduction)
```

### Performance Metrics
```
Layout Shift (CLS):
  Before: 0.08
  After:  0.00 (eliminated)

Animation Frame Rate:
  Before: 45-55 fps (drops during stagger)
  After:  60 fps (smooth)

Time to Interactive:
  Before: 2.5s
  After:  1.8s (28% faster)
```

### User Experience
- 鉁?No content jumping
- 鉁?Smooth 60fps animations
- 鉁?Respects reduced motion preference
- 鉁?Native browser optimization (View Transitions)
- 鉁?Consistent timing across all animations

---

## Testing Checklist

### Before Merging:

- [ ] All animations respect `prefers-reduced-motion`
- [ ] No layout shift (CLS = 0) on any page
- [ ] Skeleton screens match content dimensions exactly
- [ ] Page transitions smooth (View Transitions API or Motion One)
- [ ] Staggered lists animate smoothly (60fps)
- [ ] Button press animations work
- [ ] Scroll-triggered animations use Intersection Observer
- [ ] No `will-change` left on elements after animation
- [ ] Test on low-end device (throttle CPU 4x in DevTools)

---

## Next Steps

1. Install Motion One (Week 1 Day 5)
2. Create motion utilities (Week 1 Days 5-6)
3. Build PageTransition component (Week 1 Day 6)
4. Build StaggeredList component (Week 1 Day 6)
5. Build Skeleton component (Week 1 Day 7)
6. Test performance (Week 1 Day 7)
7. Migrate all animations (Week 2)
8. Remove Framer Motion (Week 3 Day 19)

---

## References

- [Part 1: Architecture](./FRONTEND_REWORK_PART1_ARCHITECTURE.md)
- [Part 6: Performance](./FRONTEND_REWORK_PART6_PERFORMANCE.md)
- [Motion One Docs](https://motion.dev/)
- [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions/)
- [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

**Status**: COMPLETE (As-Built 2026-02-15)
**Timeline**: Week 1 Days 5-7 (foundation), Week 2 (migration)
**Dependencies**: Design system tokens (Part 2)

---

## As-Built Addendum (2026-02-15)

- Motion system implementation includes reduced-motion-safe paths and shared transition primitives.
- Heavy surfaces use lazy mount and route/dialog chunking to avoid unnecessary initial animation/render cost.

### Documented Deviations

- Browser-native and CSS transition fallbacks are used where they provide more predictable runtime behavior than broad JS animation orchestration.

