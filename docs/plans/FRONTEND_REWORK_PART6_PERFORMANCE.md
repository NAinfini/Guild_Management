# Frontend Rework - Part 6: State Management & Performance

**Date**: 2026-02-14
**Status**: COMPLETE (As-Built 2026-02-15)
**Week**: Throughout migration

---

## Overview

This document solves the "re-renders causing performance issues" problem through aggressive optimization patterns.

---

## Current Re-render Problems

### Problem 1: Zustand Over-subscription

```tsx
// 鉂?BAD: Re-renders on ANY user property change
function Header() {
  const user = useAuthStore(state => state.user);
  // Re-renders when: email, avatar, role, status, created_at, etc. change
  return <div>Welcome, {user?.username}</div>;
}
```

**Impact:**
- Header re-renders when user avatar updates
- Header re-renders when user role changes
- Header re-renders when unrelated user fields change
- Cascades to child components

### Problem 2: Prop Drilling Re-renders

```tsx
// Parent
function EventList() {
  const [filter, setFilter] = useState('');

  return (
    <div>
      <FilterBar onFilterChange={setFilter} />
      {events.map(event => (
        <EventCard event={event} filter={filter} />
        // Every EventCard re-renders when filter changes
      ))}
    </div>
  );
}
```

**Impact:**
- Filter change 鈫?all 50 EventCards re-render
- Typing in search 鈫?re-render on every keystroke
- Expensive for long lists

### Problem 3: TanStack Query Over-fetching

```tsx
// Current config (too aggressive)
useQuery({
  queryKey: ['members'],
  queryFn: getMemberss,
  refetchInterval: 60000,        // Every 60s even if data unchanged
  refetchOnWindowFocus: true,    // Every tab switch
  refetchOnReconnect: true,      // Every reconnect
});
```

**Impact:**
- Unnecessary network requests
- Database load for unchanged data
- Re-renders even when data identical

---

## Solution 1: Zustand Selectors

### Atomic Selectors

```typescript
// apps/portal/src/store/index.ts

// 鉂?OLD: Subscribe to entire user object
export const useUser = () => useAuthStore(state => state.user);

// 鉁?NEW: Selector hooks for specific fields
export const useCurrentUserId = () =>
  useAuthStore(state => state.user?.id);

export const useCurrentUsername = () =>
  useAuthStore(state => state.user?.username);

export const useCurrentUserAvatar = () =>
  useAuthStore(state => state.user?.avatar_url);

export const useCurrentUserRole = () =>
  useAuthStore(state => state.user?.role);

export const useIsAuthenticated = () =>
  useAuthStore(state => !!state.user);

export const useIsAdmin = () =>
  useAuthStore(state => state.user?.role === 'admin');
```

### Shallow Comparison

```typescript
import { shallow } from 'zustand/shallow';

// Subscribe to multiple fields with shallow comparison
export const useUserProfile = () =>
  useAuthStore(
    state => ({
      username: state.user?.username,
      avatar: state.user?.avatar_url,
      role: state.user?.role,
    }),
    shallow // Only re-render if username, avatar, OR role changes
  );
```

### Usage Examples

```tsx
// 鉂?BEFORE: Over-subscription
function Header() {
  const user = useAuthStore(state => state.user);
  return <div>Welcome, {user?.username}</div>;
}

// 鉁?AFTER: Precise subscription
function Header() {
  const username = useCurrentUsername();
  return <div>Welcome, {username}</div>;
}

// 鉁?Multiple fields with shallow
function UserMenu() {
  const { username, avatar, role } = useUserProfile();

  return (
    <Menu>
      <Avatar src={avatar} />
      <Text>{username}</Text>
      <Badge>{role}</Badge>
    </Menu>
  );
}
```

---

## Solution 2: Component Memoization

### Memoization Strategy

**Rules (Applied Everywhere):**

1. **Leaf components** 鈫?Always `memo()`
2. **List items** 鈫?Always `memo()` with custom comparison
3. **Event handlers** 鈫?Always `useCallback()`
4. **Computed values** 鈫?Always `useMemo()`
5. **Context values** 鈫?Always `useMemo()`

### Leaf Component Pattern

```tsx
// apps/portal/src/components/composed/EventCard/EventCard.tsx

import { memo } from 'react';

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
}

// 鉁?Always memo() leaf components
export const EventCard = memo(
  function EventCard({ event, onJoin, onLeave }: EventCardProps) {
    // Component implementation
    const userId = useCurrentUserId(); // Precise selector

    return (
      <Card>
        <Heading level={3}>{event.title}</Heading>
        <Text>{event.description}</Text>
        {onJoin && <Button onClick={() => onJoin(event.id)}>Join</Button>}
      </Card>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    // Only re-render if event data or callbacks actually changed
    return (
      prevProps.event.id === nextProps.event.id &&
      prevProps.event.updated_at === nextProps.event.updated_at &&
      prevProps.onJoin === nextProps.onJoin &&
      prevProps.onLeave === nextProps.onLeave
    );
  }
);
```

### Parent Component Pattern

```tsx
// apps/portal/src/features/Events/EventList.tsx

import { useCallback, useMemo } from 'react';
import { useEvents, useJoinEvent, useLeaveEvent } from '@/hooks/useServerState';

function EventList() {
  const { data: events = [] } = useEvents();
  const { mutate: joinEvent } = useJoinEvent();
  const { mutate: leaveEvent } = useLeaveEvent();

  // 鉁?Memoize callbacks (prevent recreation on every render)
  const handleJoin = useCallback((eventId: string) => {
    joinEvent({ eventId });
  }, [joinEvent]);

  const handleLeave = useCallback((eventId: string) => {
    leaveEvent({ eventId });
  }, [leaveEvent]);

  // 鉁?Memoize filtered list
  const filteredEvents = useMemo(() => {
    return events.filter(event => !event.is_cancelled);
  }, [events]);

  return (
    <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
      {filteredEvents.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />
      ))}
    </Grid>
  );
}
```

**Why this works:**
- `handleJoin` reference stays stable 鈫?EventCard doesn't re-render
- `filteredEvents` only recalculates when `events` changes
- EventCard's custom comparison prevents unnecessary re-renders

---

## Solution 3: TanStack Query Optimization

### Global Configuration

```typescript
// apps/portal/src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache Configuration
      gcTime: 1000 * 60 * 30,      // 30 min garbage collection (was cacheTime)
      staleTime: 1000 * 60 * 5,    // 5 min before considered stale

      // Refetch Strategy (less aggressive)
      refetchOnWindowFocus: false, // 鉂?Don't refetch on tab switch
      refetchOnReconnect: true,    // 鉁?Do refetch on reconnect
      refetchOnMount: false,       // 鉂?Use cache if available

      // 鈿?CRITICAL OPTIMIZATION: Only re-render if used data changed
      notifyOnChangeProps: 'tracked',

      // Retry Strategy (smarter)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2; // Max 2 retries for 5xx
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false, // Never retry mutations (could cause duplicates)
    },
  },
});
```

**Key Optimization:**
```typescript
notifyOnChangeProps: 'tracked'
```
This is **CRITICAL**. It means:
- Component only re-renders if it actually **uses** the changed data
- Example: If component uses `data.title`, it won't re-render when `data.description` changes

### Per-Query Optimization

```typescript
// apps/portal/src/hooks/useServerState.ts

// Members: Rarely change, cache aggressively
export function useMembers() {
  return useQuery({
    queryKey: queryKeys.members.all,
    queryFn: () => membersAPI.getAll(),
    staleTime: 1000 * 60 * 10,   // 10 min stale time
    gcTime: 1000 * 60 * 60,      // 1 hour cache
    refetchInterval: false,       // No polling (WebSocket updates instead)
  });
}

// Events: Change frequently, but only refetch when needed
export function useEvents() {
  const pushConnected = useUIStore(state => state.pushConnected);

  return useQuery({
    queryKey: queryKeys.events.all,
    queryFn: () => eventsAPI.getAll(),
    staleTime: 1000 * 60 * 2,    // 2 min stale time
    gcTime: 1000 * 60 * 10,      // 10 min cache
    refetchInterval: pushConnected ? false : 90000, // Only poll if no WebSocket
  });
}

// Announcements: Fresh data important
export function useAnnouncements() {
  return useQuery({
    queryKey: queryKeys.announcements.all,
    queryFn: () => announcementsAPI.getAll(),
    staleTime: 1000 * 30,        // 30s stale time
    gcTime: 1000 * 60 * 5,       // 5 min cache
    refetchInterval: false,       // WebSocket updates
  });
}

// Single Event: Cache per-event
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventsAPI.getById(eventId),
    staleTime: 1000 * 60,        // 1 min
    enabled: !!eventId,          // Only run if ID exists
  });
}
```

### Prefetching on Hover

```typescript
// Prefetch event details when user hovers over card
export function useEventPrefetch() {
  const queryClient = useQueryClient();

  return useCallback((eventId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.events.detail(eventId),
      queryFn: () => eventsAPI.getById(eventId),
      staleTime: 1000 * 60 * 5, // Cache for 5 min
    });
  }, [queryClient]);
}

// Usage in EventCard:
function EventCard({ event }: Props) {
  const prefetchEvent = useEventPrefetch();

  return (
    <Card
      onMouseEnter={() => prefetchEvent(event.id)}
      onClick={() => navigate({ to: `/events/${event.id}` })}
    >
      {/* ... */}
    </Card>
  );
}
```

---

## Solution 4: Virtual Scrolling

### When to Use Virtual Scrolling

**Use for:**
- 鉁?Members list (100+ members)
- 鉁?Event history (50+ events)
- 鉁?War history (many wars)
- 鉁?Audit logs (1000+ entries)

**Don't use for:**
- 鉂?Dashboard (< 20 items visible)
- 鉂?Navigation (< 10 items)
- 鉂?Small lists (< 30 items)

### React Window Implementation

```tsx
// apps/portal/src/components/composed/MemberList/MemberList.tsx

import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { memo, useCallback } from 'react';

interface MemberListProps {
  members: Member[];
}

export function MemberList({ members }: MemberListProps) {
  // Memoize row renderer
  const Row = useCallback(
    ({ index, style }: { index: number; style: CSSProperties }) => {
      const member = members[index];
      return (
        <div style={style}>
          <MemberCard member={member} />
        </div>
      );
    },
    [members]
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          itemCount={members.length}
          itemSize={120}             // Height of each MemberCard
          overscanCount={5}          // Render 5 extra items for smooth scrolling
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}
```

**Performance Impact:**
```
Without virtual scrolling (200 members):
  - 200 DOM nodes rendered
  - ~80ms render time
  - Laggy scroll

With virtual scrolling (200 members):
  - ~20 DOM nodes rendered (only visible + overscan)
  - ~15ms render time (5x faster)
  - Smooth 60fps scroll
```

---

## Solution 5: Code Splitting

### Route-Based Lazy Loading

```tsx
// apps/portal/src/App.tsx

import { lazy, Suspense } from 'react';
import { PageSkeleton } from '@/components/primitives/Skeleton';

// Heavy pages: Lazy load
const Dashboard = lazy(() => import('@/features/Dashboard'));
const Events = lazy(() => import('@/features/Events'));
const GuildWar = lazy(() => import('@/features/GuildWar'));
const Members = lazy(() => import('@/features/Members'));
const Admin = lazy(() => import('@/features/Admin'));

// Light pages: Keep in main bundle
import { Login } from '@/features/Auth/Login';
import { Profile } from '@/features/Profile';
import { Settings } from '@/features/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Immediate load */}
        <Route path="/login" component={Login} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />

        {/* Lazy load with suspense */}
        <Route
          path="/"
          component={() => (
            <Suspense fallback={<PageSkeleton />}>
              <Dashboard />
            </Suspense>
          )}
        />
        <Route
          path="/events"
          component={() => (
            <Suspense fallback={<PageSkeleton />}>
              <Events />
            </Suspense>
          )}
        />
        {/* ... other routes */}
      </Routes>
    </Router>
  );
}
```

### Expected Bundle Improvement

```
Before (no code splitting):
  Main bundle: 450KB (all features)

After (route-based splitting):
  Main bundle:      120KB (shell + auth)
  Dashboard chunk:   80KB (lazy)
  Events chunk:      60KB (lazy)
  GuildWar chunk:    90KB (lazy)
  Members chunk:     50KB (lazy)
  Admin chunk:       70KB (lazy)

Total: 470KB (same), but initial load: 120KB (73% reduction) 鈿?
```

### Component-Level Lazy Loading

```tsx
// Lazy load heavy dialogs (only when opened)
const CreateEventDialog = lazy(() =>
  import('@/components/dialogs/CreateEventDialog')
);

function EventsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setDialogOpen(true)}>Create Event</Button>

      {dialogOpen && (
        <Suspense fallback={<DialogSkeleton />}>
          <CreateEventDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
```

---

## Solution 6: React Compiler (Experimental)

### Auto-Memoization

**Installation:**
```bash
npm install -D babel-plugin-react-compiler@19.0.0
```

**Vite Configuration:**
```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {
            // Auto-memoize components in these directories
            sources: (filename) => {
              return filename.includes('src/components') ||
                     filename.includes('src/features');
            },
          }],
        ],
      },
    }),
  ],
});
```

**What it does:**
- Automatically adds `memo()` to components
- Automatically adds `useMemo()` for computations
- Automatically adds `useCallback()` for functions
- Reduces re-renders by ~40% without manual optimization

**Status:**
- 鈿狅笍 Experimental (React 19)
- 鉁?Can be disabled per-component
- 鉁?Fallback: Manual memoization works fine

---

## Performance Monitoring

### React DevTools Profiler

```tsx
// Wrap app with Profiler in development
if (import.meta.env.DEV) {
  import { Profiler } from 'react';

  function onRender(
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) {
    console.log(`${id} (${phase}):`, {
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    });
  }

  <Profiler id="App" onRender={onRender}>
    <App />
  </Profiler>
}
```

### Why Did You Render

```bash
# Install in development only
npm install -D @welldone-software/why-did-you-render
```

```typescript
// apps/portal/src/main.tsx

if (import.meta.env.DEV) {
  const whyDidYouRender = await import('@welldone-software/why-did-you-render');
  whyDidYouRender.default(React, {
    trackAllPureComponents: true,
    logOnDifferentValues: true,
  });
}
```

**Output:**
```
EventCard re-rendered because:
  鈥?event.updated_at changed: '2024-01-01' 鈫?'2024-01-02'
  鉁?This is expected

Header re-rendered because:
  鈥?user.avatar_url changed: 'old.jpg' 鈫?'new.jpg'
  鉁?Component doesn't use avatar_url! (Over-subscription)
```

---

## Performance Budgets

### Target Metrics

```typescript
// Performance budgets to enforce
const PERFORMANCE_BUDGETS = {
  // Bundle sizes
  mainBundleSize: 150 * 1024,        // 150KB (currently 450KB)
  chunkSize: 100 * 1024,             // 100KB per chunk

  // Load times
  firstContentfulPaint: 800,         // 0.8s (currently 1.2s)
  timeToInteractive: 1500,           // 1.5s (currently 2.5s)
  largestContentfulPaint: 1200,      // 1.2s

  // Runtime performance
  layoutShift: 0,                    // Zero CLS (currently 0.08)
  totalBlockingTime: 200,            // <200ms TBT

  // Component performance
  maxRenderTime: 16,                 // <16ms (60fps)
  maxReRenders: 3,                   // <3 re-renders per interaction
};
```

### Automated Checks

```typescript
// vite.config.ts - Bundle size check

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunking
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 100, // Warn if chunk >100KB
  },
  plugins: [
    // Bundle size plugin
    {
      name: 'bundle-size-check',
      closeBundle() {
        // Check bundle sizes and fail build if over budget
      },
    },
  ],
});
```

---

## Migration Checklist

### For Every Component:

- [ ] Wrap in `memo()` if leaf component
- [ ] Add custom comparison if list item
- [ ] Use Zustand selectors (not entire object)
- [ ] Memoize event handlers with `useCallback()`
- [ ] Memoize computed values with `useMemo()`
- [ ] Use virtual scrolling if list >30 items
- [ ] Lazy load if heavy component (>50KB)
- [ ] Test with React DevTools Profiler
- [ ] Verify no unnecessary re-renders

### For Every Query:

- [ ] Set appropriate `staleTime`
- [ ] Set appropriate `gcTime`
- [ ] Disable `refetchOnWindowFocus` unless needed
- [ ] Use `enabled` flag for conditional queries
- [ ] Prefetch on hover for detail pages
- [ ] Use WebSocket updates instead of polling

---

## Expected Performance Gains

### Re-render Reduction

```
Before:
  EventList filter change 鈫?50 EventCards re-render
  User avatar change 鈫?Header + Sidebar + UserMenu re-render
  Query refetch 鈫?All consuming components re-render

After:
  EventList filter change 鈫?0 EventCards re-render (memoized)
  User avatar change 鈫?Only UserMenu re-renders (selector)
  Query refetch 鈫?Only components using changed fields re-render (tracked)

Reduction: ~60% fewer re-renders
```

### Query Optimization

```
Before:
  Members refetch: Every 60s (even if unchanged)
  Events refetch: On every tab switch
  Total requests: ~200/hour

After:
  Members refetch: Only via WebSocket updates
  Events refetch: Only on reconnect or manual refresh
  Total requests: ~20/hour (90% reduction)
```

### Bundle Size

```
Before: 450KB initial load
After:  120KB initial load (73% reduction)
```

### Load Times

```
Before 鈫?After

FCP:  1.2s 鈫?0.7s (42% faster)
TTI:  2.5s 鈫?1.3s (48% faster)
LCP:  1.8s 鈫?1.0s (44% faster)
```

---

## Next Steps

1. Configure TanStack Query (Week 1 Day 2)
2. Create selector hooks (Week 1 Day 2)
3. Memoize all components (Week 2-3)
4. Add virtual scrolling (Week 2 Day 13)
5. Implement code splitting (Week 2 Day 14)
6. Test with React Compiler (Week 3 Day 17)
7. Profile and optimize (Week 3 Day 17)

---

## References

- [Part 1: Architecture](./FRONTEND_REWORK_PART1_ARCHITECTURE.md)
- [Part 5: Motion System](./FRONTEND_REWORK_PART5_MOTION.md)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Window](https://github.com/bvaughn/react-window)
- [React Compiler](https://react.dev/learn/react-compiler)

---

**Status**: COMPLETE (As-Built 2026-02-15)
**Timeline**: Throughout Weeks 1-3
**Dependencies**: None (can start immediately)

---

## As-Built Addendum (2026-02-15)

- Query tuning, memoization, and chunk splitting are implemented for high-cost routes.
- GuildWar and editor-heavy surfaces are split/lazy-loaded with verified chunk outputs.
- QA/Lighthouse/browser matrix artifacts provide completion evidence.

### Documented Deviations

- Final bundle enforcement was validated with emitted chunk evidence and route-level scores instead of only static global-size targets.

