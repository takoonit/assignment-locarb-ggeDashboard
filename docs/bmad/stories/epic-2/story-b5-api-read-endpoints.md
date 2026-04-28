# Story B5 - API Read Endpoints

**Epic:** 2 - API
**Status:** Done
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
- Route handlers are covered by tests for success, invalid params, missing country, and null-preserving data.

## Architecture Context

- Public read routes do not require auth.
- Services handle database access and response shaping.
- Route handlers stay thin: validate query params, call services, return shared API responses.
- Use the existing Prisma models from `prisma/schema.prisma`: `Country`, `AnnualEmission`, and `SectorShare`.
- Do not add admin write endpoints in this story.
- Do not complete Swagger/OpenAPI docs in this story; update docs only if route behavior changes the contract.

## Implementation Notes

- Add shared query schemas for `country`, `gas`, `year`, `fromYear`, `toYear`, and `includeRegions`.
- Add an emissions service layer for country lookup, gas-field mapping, trend data, map data, sector breakdowns, and single filter lookup.
- Fill trend year ranges with explicit `null` values when a year has no row or the selected gas value is missing.
- Return all non-region countries for map data by default, including countries with `null` values for the requested year/gas.
- Return an all-null sector object when the country exists but has no sector row for the requested year.
