# BMAD Architecture - GHG Emissions Dashboard

**Status:** Approved  
**Source docs:** `docs/01-architecture.md`, `docs/01b-conventions.md`, `docs/02-data-model.md`, `docs/03-api-contracts.md`, `docs/04-ui-spec.md`

## Stack

- Next.js 16 App Router + TypeScript
- PostgreSQL on Neon + Prisma
- MUI with Material Design 3-inspired theme
- TanStack Query for client API data
- Recharts for line and bar charts
- react-simple-maps for world map
- Auth.js with GitHub OAuth
- Zod validation
- OpenAPI/Swagger-compatible API docs
- Vercel deployment

## Layers

- Presentation: `src/app`, `src/components`, hooks
- API routes: `src/app/api/**/route.ts`
- Validation: `src/lib/schemas`
- Business logic: `src/lib/services`
- Persistence: `src/lib/db.ts` and Prisma
- Auth: `src/lib/auth`

Rules:

- Route handlers stay thin.
- Pages do not call Prisma directly.
- Services preserve `null` values.
- Mutating routes call `requireAdmin()`.
- API success shape is `{ data }`.
- API error shape is `{ error: { code, details } }`.

## Data Model

Use the app-oriented model:

- `Country`
- `AnnualEmission`
- `SectorShare`
- `User`

Do not reintroduce raw CSV model names such as `Indicator`, `EmissionRecord`, or `Emission`.

## API Surface

Public reads:

- `GET /api/countries`
- `GET /api/emissions/trend`
- `GET /api/emissions/map`
- `GET /api/emissions/sector`
- `GET /api/emissions/filter`

Admin writes:

- `POST /api/countries`
- `PATCH /api/countries/{id}`
- `DELETE /api/countries/{id}`
- `POST /api/emissions`
- `PATCH /api/emissions/{id}`
- `DELETE /api/emissions/{id}`
- `POST /api/sector-shares`
- `PATCH /api/sector-shares/{id}`
- `DELETE /api/sector-shares/{id}`

Docs:

- `GET /api/openapi`
- `GET /api/docs`

## UI Contract

- Trend card controls: country and gas.
- Sector card controls: country and year.
- Map card controls: year and gas, default `TOTAL`.
- No global filter bar that implies every control affects every chart.
- Every visualization handles loading, error, empty, partial, sparse, `0`, and `null` states.

## Implementation Discipline

- Load only the active story file during implementation.
- Use TDD for each story.
- Do not expand scope while implementing a story.
- If architecture changes are needed, update architecture docs and affected story files before coding.
