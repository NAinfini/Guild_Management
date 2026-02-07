# Auth — Login / Session (`/login`)

@FEATURE: AUTH
@ROLE: All (login required for mutations)

## Summary

Simple username + password login and session handling. HttpOnly cookie sessions managed by the Cloudflare Worker.

## Access

- External: can browse read-only pages without login
- Members/Admin/Mod: login required for all mutations and protected pages

## Login Page

### Layout

Minimal centered card:
- Username field
- Password field
- Login button
- "Stay logged in" checkbox

### UX Requirements

- **Show/hide password** (eye icon toggle)
- **Caps Lock warning** when detected
- **Loading state:** login button becomes spinner + disabled; inputs disabled during request
- **Error states:** inline banner area (keeps layout stable); generic "Invalid credentials" (no username probing)
- **Return-to handling:** preserve `returnTo` URL from redirect; on success, redirect back (else Dashboard)
- **Rate limit feedback:** "Too many attempts, try again in X seconds"; never reveal whether username exists

### Stay Logged In

- If selected: session persists for 30 days
- If not: shorter session TTL (1 day or browser-session)

## Session Rules

- HttpOnly cookie session (Worker issues cookie)
- Client stores no password, ever
- All privileged requests require session cookie
- Session expiry mid-action: preserve form state, redirect to login, allow re-submit after re-login

## Logout

- Located in top-right profile dropdown
- Clears session cookie
- Also available on My Profile page

## Password Storage (D1)

### Table: `user_auth_password`

- `password_hash` — hashed password
- `salt` — per-user salt
- `updated_at` — last change timestamp

## Rate Limiting

- Login: rate limit by username + IP bucket (Worker-side)
- UI: "Too many attempts, try again in X seconds"
- Never reveal if username exists
- Generic error messages only

## Security

- Rate limit login attempts at Worker level
- Generic error messages ("Invalid credentials")
- Audit: record password resets and role changes
- Do NOT record login success/failure spam
- HttpOnly, Secure, SameSite cookie attributes

## Post-Login Flow

- Redirect to Dashboard (default)
- Or redirect to `returnTo` URL if user was redirected from a protected page

## Post-Logout Flow

- Clear session cookie
- Redirect to login page (or public dashboard if External view is enabled)


## Permissions

| Action | External | Member | Moderator | Admin |
|--------|----------|--------|-----------|-------|
| View login page | Yes | Yes | Yes | Yes |
| Login | N/A | Yes | Yes | Yes |
| Logout | N/A | Yes | Yes | Yes |

## Audit

- Password resets: logged
- Role changes: logged
- Login/logout: NOT logged (no spam)
