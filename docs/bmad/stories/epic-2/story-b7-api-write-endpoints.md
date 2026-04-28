# Story B7 - API Write Endpoints

**Epic:** 2 - API  
**Status:** Todo  
**Dependencies:** B4, B5, B6  

## Story

As an admin, I want create, update, and delete endpoints so that emissions data can be maintained after seeding.

## Acceptance Criteria

- Admin-only country create/update/delete works.
- Admin-only annual emissions create/update/delete works.
- Admin-only sector share create/update/delete works.
- `401`, `403`, `404`, `409`, and `400` cases are handled.
- Duplicate country-year records return conflict.

## Architecture Context

- Mutating routes call `requireAdmin()` first.
- Writes go through services, not inline Prisma-heavy handlers.
