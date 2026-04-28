# Story B6 - API Error Wrapper

**Epic:** 2 - API  
**Status:** Todo  
**Dependencies:** B5  

## Story

As an API consumer, I want consistent success and error responses so that frontend and external clients can handle API behavior predictably.

## Acceptance Criteria

- Shared success helper returns `{ data }`.
- Shared error helper returns `{ error: { code, details } }`.
- Standard error codes are used consistently.
- Route handlers avoid repeated try/catch boilerplate.

## Architecture Context

- Use `ApiError` and a route-level error mapper.
- Do not return raw Prisma errors or stack traces.
