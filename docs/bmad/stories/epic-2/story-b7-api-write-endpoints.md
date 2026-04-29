# Story B7 - API Write Endpoints

**Epic:** 2 - API  
**Status:** Done
**Dependencies:** B4, B5, B6  

## Story

As an admin, I want create, update, and delete endpoints so that emissions data can be maintained after seeding.

## Acceptance Criteria

- Admin-only country create/update/delete works.
- Admin-only annual emissions create/update/delete works.
- Admin-only sector share create/update/delete works.
- `401`, `403`, `404`, `409`, and `400` cases are handled.
- Duplicate country-year records return conflict.
- Write route behavior matches `docs/03-api-contracts.md`.
- Mutating route tests cover unauthenticated, forbidden, invalid body, not found, conflict, and success paths where applicable.
- Error messages should be human-readable and concise.

## Architecture Context

- Mutating routes call `requireAdmin()` first.
- Writes go through services, not inline Prisma-heavy handlers.
- Use B6 response and error helpers.
- Preserve explicit `null` values on nullable gas and sector fields.
- Country deletes rely on the Prisma cascade behavior defined by the schema.
- Do not build the admin UI in this story; that belongs to Epic 4.
