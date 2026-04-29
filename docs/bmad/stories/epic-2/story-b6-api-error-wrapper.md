# Story B6 - API Error Wrapper

**Epic:** 2 - API
**Status:** Done
**Dependencies:** B5
## Story

As an API consumer, I want consistent success and error responses so that frontend and external clients can handle API behavior predictably.

## Acceptance Criteria

- Shared success helper returns `{ data }`.
- Shared error helper returns `{ error: { code, details } }`.
- Standard error codes are used consistently.
- Route handlers avoid repeated try/catch boilerplate.
- `requireAdmin()` errors are aligned to the same error response shape before B7 uses them.

## Architecture Context

- Use `ApiError` and a route-level error mapper.
- Do not return raw Prisma errors or stack traces.
- Keep helpers in `src/lib/api-utils.ts` unless B5 establishes a more specific local pattern.
- Error codes must match `docs/03-api-contracts.md`: `INVALID_PARAMS`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, and `INTERNAL_ERROR`.
- The error mapper should accept expected application errors and convert unexpected errors to `500 INTERNAL_ERROR` with empty details.
