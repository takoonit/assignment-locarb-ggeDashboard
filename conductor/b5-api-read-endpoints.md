# Implementation Plan: B5 - API Read Endpoints

## Objective
Implement five public read endpoints for the emissions dashboard, ensuring they are thin, use Zod for validation, and rely on a shared service layer for database queries and data mapping.

## Key Files & Context
- `src/lib/api-schemas.ts` (New): Centralized Zod schemas for validating query parameters (e.g., country code, year, gas type, boolean flags).
- `src/lib/services/emissions.ts` (New): Shared business logic to fetch data from Prisma, map gas enums to database columns, and format the responses to match the API contracts.
- Route Handlers (New):
  - `src/app/api/countries/route.ts`
  - `src/app/api/emissions/trend/route.ts`
  - `src/app/api/emissions/map/route.ts`
  - `src/app/api/emissions/sector/route.ts`
  - `src/app/api/emissions/filter/route.ts`

## Implementation Steps

### 1. Define Zod Schemas (`src/lib/api-schemas.ts`)
Create schemas for validating common query parameters:
- `country`: 3-letter uppercase string.
- `gas`: Enum (`TOTAL`, `CO2`, `CH4`, `N2O`, `HFC`, `PFC`, `SF6`).
- `year`, `fromYear`, `toYear`: Integers between 1990 and 2030.
- `includeRegions`: Boolean (parsed from string query params).

### 2. Implement Service Layer (`src/lib/services/emissions.ts`)
Create a service to interact with Prisma. It will handle:
- **Countries**: Fetching countries, optionally including regions.
- **Trend**: Fetching annual emissions for a country within a year range, mapping the selected gas to the correct column, and filling in missing years with `null` values.
- **Map**: Fetching a specific gas value for all countries in a specific year, including countries with missing data as `null`.
- **Sector**: Fetching sector shares for a specific country and year, handling completely missing records by returning an object with `null` values for all sectors.
- **Filter**: Fetching a single gas value for a specific country and year, reusing the same lookup logic to ensure consistency.

### 3. Create Route Handlers
For each endpoint:
1. Extract query parameters using `req.nextUrl.searchParams`.
2. Validate parameters using the Zod schemas. Return `400 INVALID_PARAMS` if validation fails.
3. Call the appropriate function from `emissions.ts`.
4. Return `404 NOT_FOUND` if the country does not exist (where applicable).
5. Return a `200 OK` JSON response formatted as `{ data: { ... } }`.
6. Wrap with a global error handler or try/catch to return `500 INTERNAL_ERROR` on unexpected failures.

## Verification & Testing
- Manually test each endpoint using `curl` or a browser to ensure responses exactly match `docs/03-api-contracts.md`.
- Verify `null` value preservation (e.g., missing years in trends, missing countries in map).
- Verify Zod validation correctly rejects invalid inputs (e.g., year out of bounds, invalid gas type) with a `400` status.