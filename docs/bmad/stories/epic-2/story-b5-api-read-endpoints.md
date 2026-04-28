# Story B5 - API Read Endpoints

**Epic:** 2 - API  
**Status:** Todo  
**Dependencies:** B3, A6  

## Story

As a public API user, I want read endpoints for countries, trends, map data, sector data, and selected filters so that I can query the seeded emissions dataset.

## Acceptance Criteria

- `GET /api/countries` works.
- `GET /api/emissions/trend` works.
- `GET /api/emissions/map` works.
- `GET /api/emissions/sector` works.
- `GET /api/emissions/filter` works.
- Zod validation rejects invalid params.
- Response shapes match `docs/03-api-contracts.md`.
- Missing data is preserved as `null`.

## Architecture Context

- Public read routes do not require auth.
- Services handle database access and response shaping.
