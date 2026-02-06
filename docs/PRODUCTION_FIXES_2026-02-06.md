# Production Fixes - February 6, 2026

## Summary

Fixed critical production errors preventing the application from functioning correctly.

## Issues Fixed

### 1. API Routing Error ✅

**Problem:** All API requests going to `/members` instead of `/api/members`

**Root Cause:** `.env.development` had `VITE_API_BASE_URL=https://guild-management.na-infini.workers.dev` which caused the API client to construct full URLs like `https://...workers.dev/members` (missing `/api` prefix)

**Fix:**
- Removed `VITE_API_BASE_URL` from `.env.development`
- Let it default to `/api` which works for both:
  - Local dev: Vite proxy forwards `/api/*` to production worker
  - Production: Requests go directly to `/api/*` endpoints

**Commit:** `9333e78` - "fix: correct API base URL to use relative /api path"

**Files Changed:**
- `.env.development`

### 2. React Error #310 - Rules of Hooks Violation ✅

**Problem:** "Error: Rendered more hooks than during the previous render" in ActiveWarManagement component

**Root Cause:** Three `useMemo` hooks were called AFTER conditional early returns:

```typescript
// Line 280
if (isLoadingTeams) return <ActiveWarSkeleton />;

// Lines 283-305 - ❌ HOOKS AFTER RETURN
const assignedUserIds = useMemo(...);
const legacyTeams = useMemo(...);
const poolMembers = useMemo(...);
```

This violated React's Rules of Hooks which require all hooks to be called in the same order on every render.

**Fix:**
- Moved `assignedUserIds`, `legacyTeams`, and `poolMembers` useMemo hooks to BEFORE the early returns
- All hooks now called before any conditional logic

**Commit:** `d321ae9` - "fix: move useMemo hooks before early returns in ActiveWarManagement"

**Files Changed:**
- `react-portal/features/GuildWar/index.tsx`

## Expected Results

### Members/Roster Page
- ✅ API requests go to correct endpoint `/api/members`
- ✅ Members display correctly (26 members returned from API)
- ✅ No more infinite render loops
- ✅ Filtering and sorting work properly

### Guild War Page
- ✅ No more "Rendered more hooks" errors
- ✅ Page loads without crashing
- ✅ Team management functionality restored
- ✅ Drag & drop team assignment works

### WebSocket
- ⚠️ Still showing connection error - this is expected if WebSocket Durable Objects haven't been deployed yet
- The error is non-blocking and doesn't prevent page functionality

## Testing Checklist

After deployment completes, verify:

- [ ] Members/Roster page displays all members
- [ ] Guild War page loads without errors
- [ ] Can drag members between teams
- [ ] No React Error #310 in console
- [ ] API requests show `/api/*` paths (check Network tab)
- [ ] Dashboard shows recent wars/events
- [ ] Profile page loads correctly
- [ ] Events page functional

## Technical Details

### API Architecture
- API Base: `/api` (relative path)
- Development: Vite proxy forwards to `https://guild-management.na-infini.workers.dev`
- Production: Worker handles `/api/*` routes directly
- Static assets: Served by Cloudflare Workers Assets

### React Hooks Order
All components must follow the Rules of Hooks:
1. Call all hooks at the top of the component
2. Never call hooks inside conditionals, loops, or after early returns
3. Use stable dependencies for `useMemo`/`useEffect` (primitives, not objects/arrays)

## Deployment

```bash
git log --oneline -3
# d321ae9 fix: move useMemo hooks before early returns in ActiveWarManagement
# 9333e78 fix: correct API base URL to use relative /api path
# 1a5aad4 (previous commit)

git push  # ✅ Pushed to GitHub
# Cloudflare Pages will auto-deploy
```

## Previous Related Fixes

- Dashboard useMemo fixes (4 hooks)
- Members/Roster useMemo fixes (2 hooks)
- Event join/leave endpoint migration to team_members table
- WebSocket route handler added to worker.ts

## Status

🚀 **DEPLOYED** - Waiting for Cloudflare Pages build to complete

All fixes committed and pushed. Application should be fully functional once deployment completes.
