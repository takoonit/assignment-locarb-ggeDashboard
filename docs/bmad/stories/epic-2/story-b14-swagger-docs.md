# Story B14 - Swagger/OpenAPI Docs

**Epic:** 2 - API  
**Status:** Todo  
**Dependencies:** B5, B7  

## Story

As a reviewer, I want interactive API documentation so that I can inspect endpoints, params, bodies, responses, and errors without guessing.

## Acceptance Criteria

- `GET /api/openapi` returns raw OpenAPI JSON.
- `GET /api/docs` renders interactive API docs.
- Docs include public read and admin write endpoints.
- Docs match implemented route behavior.

## Architecture Context

- OpenAPI must remain Swagger-compatible.
- Keep docs aligned with Zod schemas and route contracts.
