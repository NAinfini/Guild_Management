# Frontend Rework - Part 1: Architecture Foundation

**Date**: 2026-02-14
**Status**: COMPLETE (As-Built 2026-02-15)
**Author**: Frontend Rework Design Team

---

## Overview

This document outlines the architectural foundation for the complete frontend rework of the Guild Management Portal. The goal is to address critical performance, code quality, and design issues through an aggressive 3-week refactor.

---

## Current State Analysis

### Problems Identified

#### **1. Performance Issues**
- **Bundle Size**: 450KB total, 450KB initial load (no code splitting)
- **Layout Shifts**: CLS of 0.08 (janky page transitions)
- **Re-renders**: 50+ components with useState/useEffect causing cascade re-renders
- **Animation Jank**: Heavy Framer Motion library (28KB gzipped)
- **Load Times**:
  - First Contentful Paint: ~1.2s
  - Time to Interactive: ~2.5s
  - Lighthouse Score: 78

#### **2. Code Quality Issues**
- **26 CSS Files**: Fragmented styling across theme system
- **Component Duplication**: ~140 components with overlap
- **Mixed Component Libraries**: MUI + custom causing conflicts
- **Hard to Navigate**: No clear component organization
- **State Management Confusion**: Complex Zustand patterns

#### **3. Visual/Design Issues**
- **Inconsistent Spacing**: Arbitrary gaps (gap-4, gap-6, p-3, random values)
- **Wasted Space**: Poor space utilization on large screens
- **Themes Unpolished**: 7 themes feel inconsistent
- **Typography Unclear**: No clear hierarchy, mixed font weights
- **Colors/Contrast**: Inconsistent contrast ratios across themes

---

## What's Working Well 鉁?

Before we tear everything down, let's acknowledge what's already good:

1. **TanStack Query**: Already migrated for server state 鉁?
2. **Zustand**: Clean separation of UI/Auth state 鉁?
3. **TanStack Router**: Type-safe routing 鉁?
4. **7 Unique Themes**: Keep the concept, refine execution 鉁?
5. **Component Wrapper Pattern**: No direct MUI imports 鉁?
6. **API Architecture**: Solid endpoint/registry pattern 鉁?

---

## New Architecture Overview

### Core Principles

1. **Single Source of Truth** for styling
2. **Performance-first** component patterns
3. **Layout-driven** design system
4. **Consistent motion language**
5. **Zero MUI dependency** (migrate to lighter alternatives)

---

## Tech Stack Changes

### Dependencies: Before vs After

| Current | New | Why | Size Impact |
|---------|-----|-----|-------------|
| **MUI Components** | Radix UI Primitives + Custom | 80% smaller, better a11y, more control | -150KB |
| **26 CSS files** | 1 design system + 7 theme files | Easier maintenance, less conflicts | -35% files |
| **Mixed Tailwind + CSS** | CSS Modules + Tailwind utilities | Type-safe, better DX, tree-shakeable | 卤0KB |
| **Framer Motion** | Motion One | 5x smaller, same features | -23KB |
| **Manual performance opts** | React Compiler (experimental) | Automatic memoization | -0KB (build) |

### Package Changes

**Remove (Complete Deletion):**
```bash
npm uninstall @mui/material @mui/icons-material
npm uninstall @emotion/react @emotion/styled
npm uninstall framer-motion
```

**Add:**
```bash
npm install @radix-ui/react-* motion lucide-react
npm install react-window react-virtualized-auto-sizer
npm install -D @types/react@19 @types/react-dom@19
npm install -D babel-plugin-react-compiler
```

---

## Architecture Layers

### Layer 1: Design System Foundation

```
apps/portal/src/design-system/
鈹溾攢鈹€ index.css                 # Main entry (replaces 26 files)
鈹溾攢鈹€ tokens/                   # Design tokens
鈹?  鈹溾攢鈹€ colors.css           # Color system (all themes)
鈹?  鈹溾攢鈹€ typography.css       # Font scales, weights, line-heights
鈹?  鈹溾攢鈹€ spacing.css          # 8px grid system
鈹?  鈹溾攢鈹€ shadows.css          # Elevation levels
鈹?  鈹溾攢鈹€ motion.css           # Timing, easing, durations
鈹?  鈹斺攢鈹€ shapes.css           # Border radius, borders
鈹溾攢鈹€ primitives/              # Base styles
鈹?  鈹溾攢鈹€ reset.css            # Modern CSS reset
鈹?  鈹溾攢鈹€ layout.css           # Grid, flex utilities
鈹?  鈹斺攢鈹€ utilities.css        # Common helpers
鈹溾攢鈹€ components/              # Component-specific CSS Modules
鈹?  鈹斺攢鈹€ [component].module.css
鈹斺攢鈹€ themes/                  # 7 unique themes
    鈹溾攢鈹€ neo-brutalism.css
    鈹溾攢鈹€ cyberpunk.css
    鈹溾攢鈹€ steampunk.css
    鈹溾攢鈹€ royal.css
    鈹溾攢鈹€ chibi.css
    鈹溾攢鈹€ minimalistic.css
    鈹斺攢鈹€ post-apocalyptic.css
```

**Key Changes:**
- 鉂?**DELETE**: All 26 current CSS files
- 鉁?**CREATE**: 17 files total (7 themes + 10 foundation)
- 鉁?**CSS Modules**: Component styles scoped, no conflicts
- 鉁?**CSS Custom Properties**: Theming via variables

---

### Layer 2: Component Architecture

```
apps/portal/src/components/
鈹溾攢鈹€ primitives/              # Radix UI wrappers (headless)
鈹?  鈹溾攢鈹€ Button/
鈹?  鈹?  鈹溾攢鈹€ Button.tsx
鈹?  鈹?  鈹溾攢鈹€ Button.module.css
鈹?  鈹?  鈹溾攢鈹€ Button.test.tsx
鈹?  鈹?  鈹斺攢鈹€ index.ts
鈹?  鈹溾攢鈹€ Input/
鈹?  鈹溾攢鈹€ Card/
鈹?  鈹溾攢鈹€ Dialog/
鈹?  鈹斺攢鈹€ ... (10 core primitives)
鈹溾攢鈹€ composed/                # Business logic components
鈹?  鈹溾攢鈹€ EventCard/
鈹?  鈹溾攢鈹€ MemberCard/
鈹?  鈹溾攢鈹€ WarHistoryChart/
鈹?  鈹斺攢鈹€ ...
鈹溾攢鈹€ layout/                  # Layout components
鈹?  鈹溾攢鈹€ AppShell/
鈹?  鈹溾攢鈹€ PageContainer/
鈹?  鈹溾攢鈹€ Grid/
鈹?  鈹溾攢鈹€ Stack/
鈹?  鈹斺攢鈹€ ...
鈹斺攢鈹€ index.ts                 # Single barrel export
```

**Organization Principles:**
- **Primitives**: Generic, reusable, zero business logic
- **Composed**: Combine primitives with domain logic
- **Layout**: Structure, spacing, responsive behavior
- **Single Export**: `import { Button, Card } from '@/components'`

---

### Layer 3: Performance Patterns

#### **Memoization Strategy**

**Rules (Applied Everywhere):**
1. **Leaf components** 鈫?Always `memo()`
2. **List items** 鈫?Always `memo()` with custom comparison
3. **Event handlers** 鈫?Always `useCallback()`
4. **Computed values** 鈫?Always `useMemo()`
5. **Context values** 鈫?Always `useMemo()`

**Example:**
```tsx
// 鉂?OLD: Unnecessary re-renders
function EventCard({ event, onJoin }) {
  const user = useAuthStore(state => state.user); // Re-renders on ANY user change
  return <Card>{/* ... */}</Card>;
}

// 鉁?NEW: Optimized
const EventCard = memo(
  function EventCard({ event, onJoin }) {
    const userId = useAuthStore(state => state.user?.id); // Only ID
    return <Card>{/* ... */}</Card>;
  },
  (prev, next) => {
    return prev.event.id === next.event.id &&
           prev.event.updated_at === next.event.updated_at;
  }
);
```

#### **TanStack Query Optimization**

```tsx
// Configure less aggressive refetching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 min before stale
      gcTime: 1000 * 60 * 30,          // 30 min garbage collection
      refetchOnWindowFocus: false,     // Don't refetch on tab switch
      refetchOnMount: false,           // Use cache if available
      notifyOnChangeProps: 'tracked',  // Only re-render if used data changed 鈿?
    },
  },
});
```

#### **Virtual Scrolling**

Use `react-window` for long lists:
- Members list (100+ members)
- Event history (50+ events)
- War history
- Audit logs (1000+ entries)

**Don't use for:**
- Dashboard (< 20 items)
- Navigation (< 10 items)
- Small lists (< 30 items)

#### **Code Splitting**

Route-based lazy loading:
```tsx
const Dashboard = lazy(() => import('@/features/Dashboard'));
const Events = lazy(() => import('@/features/Events'));
const GuildWar = lazy(() => import('@/features/GuildWar'));

// Expected results:
// Main bundle: 450KB 鈫?120KB (73% reduction)
// Per-route chunks: 50-90KB each
```

---

## Migration Strategy

### Approach: Aggressive Refactor

**Timeline**: 3 weeks (21 days)
**Risk**: Medium (planned, mitigated)
**Impact**: High (addresses all issues)

### Weekly Breakdown

**Week 1: Foundation**
- Days 1-2: Dependencies + Design System Structure
- Days 3-4: Core Primitives (10 components)
- Days 5-7: Layout System + Motion

**Week 2: Component Migration**
- Days 8-9: Dashboard (pilot page with feature flag)
- Days 10-11: Events page
- Days 12-13: Members/Roster page
- Day 14: AppShell & Navigation

**Week 3: Completion**
- Days 15-16: Remaining pages (8 pages)
- Day 17: Performance audit + optimization
- Day 18: Accessibility + visual polish
- Days 19-20: Delete old code + QA testing
- Day 21: Documentation + deployment

### Feature Flag Strategy

```tsx
// Week 2: Keep old code working
const isDashboardNew = searchParams.get('new') === 'true';

return isDashboardNew ? <DashboardNew /> : <DashboardOld />;

// Week 3 Day 19: Remove flag, delete old code
return <Dashboard />; // New is default
```

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Timeline slips | High | Medium | Buffer days 22-23 for overflow |
| Breaking changes | Medium | High | Feature flag + parallel implementation |
| Performance worse | Low | High | Daily Lighthouse checks, rollback if <90 |
| Accessibility regressions | Medium | High | Audit on Day 18, fix before merge |
| Theme inconsistencies | Medium | Medium | Test all themes daily |
| Missing MUI features | Low | Medium | Build custom or use Radix alternatives |

### Rollback Plan

- Keep old code until Week 3 Day 19
- Feature flag allows instant rollback
- Git branch: `feat/frontend-rework` (don't merge until tested)
- Tag before merge: `backup/pre-rework`

---

## Expected Outcomes

### Performance Metrics

```
Before 鈫?After

Bundle size:      450KB 鈫?180KB (60% reduction)
Initial load:     450KB 鈫?120KB (73% reduction)
FCP:             1.2s 鈫?0.7s (42% faster)
TTI:             2.5s 鈫?1.3s (48% faster)
Lighthouse:      78 鈫?96 (23% improvement)
Layout shift:    0.08 鈫?0 (100% eliminated)
Re-renders:      Baseline 鈫?-40% (with React Compiler)
```

### Code Quality Metrics

```
Before 鈫?After

CSS files:       26 鈫?17 (35% reduction)
Components:      ~140 鈫?~80 (43% reduction, more reusable)
LOC (AppShell):  786 鈫?~400 (49% reduction)
Type safety:     Partial 鈫?Full (CSS Modules + strict TS)
Test coverage:   ~60% 鈫?80%+ (all new components tested)
```

### Visual Quality

- 鉁?Consistent 8px spacing grid across all pages
- 鉁?Clear typography hierarchy (5 levels, 4 weights)
- 鉁?WCAG AA contrast compliance (all themes)
- 鉁?Smooth animations (150ms-350ms, respects reduced-motion)
- 鉁?Zero layout shift (skeleton screens match content)
- 鉁?Polished themes (all 7 feel cohesive)

---

## Success Criteria

### Must Have (Week 3 Day 21)

- [ ] All pages migrated to new components
- [ ] Lighthouse score 95+ on all pages
- [ ] Bundle size reduced by 50%+
- [ ] Zero layout shift (CLS = 0)
- [ ] All tests passing (100%)
- [ ] WCAG AA accessible
- [ ] All 7 themes working
- [ ] Old code deleted
- [ ] Documentation complete

### Nice to Have

- [ ] React Compiler stable and enabled
- [ ] Visual regression tests with Playwright
- [ ] Storybook for component documentation
- [ ] Performance monitoring dashboard

---

## Next Steps

1. **Review this document** with team
2. **Get approval** from stakeholders
3. **Create feature branch**: `git checkout -b feat/frontend-rework`
4. **Begin Week 1 Day 1**: Dependencies installation
5. **Daily standups**: Track progress, blockers

---

## References

- [Part 2: Design System Structure](./FRONTEND_REWORK_PART2_DESIGN_SYSTEM.md)
- [Part 3: Layout & Spacing](./FRONTEND_REWORK_PART3_LAYOUT.md)
- [Part 4: Typography & Visual Design](./FRONTEND_REWORK_PART4_TYPOGRAPHY.md)
- [Part 5: Animation & Motion](./FRONTEND_REWORK_PART5_MOTION.md)
- [Part 6: State Management & Performance](./FRONTEND_REWORK_PART6_PERFORMANCE.md)
- [Part 7: Migration Plan](./FRONTEND_REWORK_PART7_MIGRATION.md)
- [Part 8: Implementation Checklist](./FRONTEND_REWORK_PART8_CHECKLIST.md)

---

**Status**: COMPLETE (As-Built 2026-02-15)
**Next Action**: Team review & stakeholder sign-off
**Estimated Start**: Upon approval
**Estimated Completion**: 3 weeks from start

---

## As-Built Addendum (2026-02-15)

- Architecture migration is implemented across all portal routes.
- Direct legacy MUI-path imports are retired from app source surfaces.
- Verification artifacts live under `docs/reports/qa/day20/` and `docs/reports/lighthouse/day20/`.

### Documented Deviations

- React Compiler was not enabled in production rollout.
- Validation used route-level runtime and artifact sweeps as the primary completion gate.

