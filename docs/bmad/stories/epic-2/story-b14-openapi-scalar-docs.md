# Story B14 - OpenAPI / Scalar Docs

**Epic:** 2 - API  
**Status:** Done  
**Dependencies:** B5, B7  

## Story

As a reviewer, I want interactive API documentation so that I can inspect endpoints, params, bodies, responses, and errors without guessing.

## Acceptance Criteria

- `GET /api/openapi` returns raw OpenAPI 3.1 JSON.
- `GET /api/docs` renders the Scalar interactive API reference UI.
- Docs include public read and admin write endpoints.
- Docs match implemented route behavior.
- OpenAPI tests cover the required path list, response envelope schemas, error schema, gas enum, year bounds, and nullable numeric fields.
- All write endpoints have explicit `operationId` values.
- All paths have a `description` in addition to a `summary`.
- Tags are declared with descriptions (`Countries`, `Emissions`, `Sector Shares`, `Internal`).
- Meta-routes (`/api/openapi`, `/api/docs`) are grouped under the `Internal` tag.
- `{id}` path params use resource-specific examples (`country_id`, `emission_id`, `sector_share_id`).

## Architecture Context

- OpenAPI document is generated via `zod-to-openapi` (`@asteasolutions/zod-to-openapi`) — schemas are defined once in Zod and reflected directly into the spec.
- Interactive docs are served by `@scalar/nextjs-api-reference`, pointed at `/api/openapi`.
- The spec targets OpenAPI 3.1.0; Swagger 2.0 compatibility is not required.
- Keep docs aligned with Zod schemas and route contracts.
- Both packages must be declared explicitly in `package.json` and `bun.lock`.
- B14 is not complete until B5 and B7 routes exist and the generated spec reflects implemented behavior, not only planned contract behavior.
