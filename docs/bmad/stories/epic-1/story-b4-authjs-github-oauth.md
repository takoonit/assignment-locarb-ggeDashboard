# Story B4 - Auth.js + GitHub OAuth

**Epic:** 1 - Foundation  
**Status:** Todo  
**Dependencies:** B2  

## Story

As an admin, I want to sign in with GitHub so that write operations and the admin page can be role-gated.

## Acceptance Criteria

- Auth.js GitHub provider is configured.
- Signed-in users have `email` and `role`.
- Default role is `VIEWER`.
- `requireAdmin()` distinguishes unauthenticated, forbidden, and admin users.

## Architecture Context

- No self-service admin signup.
- Admin promotion is manual and documented later in README.
