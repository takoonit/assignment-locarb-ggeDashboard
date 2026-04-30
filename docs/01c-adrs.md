**Project:** Greenhouse Gas Emissions Dashboard & API
**Author:** Takoon

**Status:** Living document

---

# About This Document
Architecture Decision Records for the Lo-Carb take-home. Each entry captures a decision, the context that forced it, and the consequence accepted in return. ADRs are immutable once Accepted; new context produces a new ADR that supersedes the old one rather than edits in place.

## Format
Context / Decision / Consequence. Three short sections, one decision per ADR. Alternatives may be listed when the choice was non-obvious.

## Status Legend
- **Proposed** - under review, not yet locked
- **Accepted** - decided and in effect
- **Superseded** - replaced by a later ADR
- **Deprecated** - no longer in effect, not replaced

## Adding New ADRs
Append at the end with the next sequential number. Set status to `Proposed` during review, flip to `Accepted` once locked. Never renumber existing ADRs. If a decision changes, write a new ADR that supersedes the old one.

---

# ADR-001: Use a single Next.js app
**Status:** Accepted
**Date:** 2026-04-27
**Context:** The app needs a REST API and a dashboard. These can run as separate apps or as one app.
**Decision:** Use one Next.js 16 app for both API routes and dashboard pages.
**Consequence:** Deployment and setup are simpler. API and UI are deployed together. If independent scaling is needed later, the internal layers can be split out.

---

# ADR-002: Use PostgreSQL on Neon
**Status:** Accepted
**Date:** 2026-04-27
**Context:** The app data is structured around countries, years, emissions, and sector values. The app needs predictable queries and simple relationships.
**Decision:** Use PostgreSQL on Neon with Prisma.
**Consequence:** Relational queries are straightforward. Prisma provides typed database access. The schema is less flexible for unstructured data, but the app data is structured.

---

# ADR-003: Use TanStack Query for dashboard data
**Status:** Accepted
**Date:** 2026-04-27
**Context:** The dashboard changes data based on country, year, and gas filters. These interactions need client-side fetching and caching.
**Decision:** Use TanStack Query for dashboard API calls. Use server components only for static page structure.
**Consequence:** Filter changes can refetch data without a page reload. Repeat queries can use cached data. This adds some client-side JavaScript.

---

# ADR-004: Use Auth.js with GitHub OAuth
**Status:** Accepted
**Date:** 2026-04-27
**Context:** Admin routes need authentication and role checks. The app does not need custom user registration.
**Decision:** Use next-auth v4 with GitHub OAuth and JWT sessions. Store only `User.email` and `User.role` for admin access. v5 was evaluated and rejected because it is still in beta (`5.0.0-beta.31`) and introduces breaking API changes that are not yet stable.
**Consequence:** Auth setup stays small. Admin checks use the stored role. Sign-in is limited to GitHub accounts. Upgrading to v5 later will require rewriting `authOptions`, the route handler, and `getServerSession` call sites.

---

# ADR-005: Use a shared API error wrapper
**Status:** Accepted
**Date:** 2026-04-27
**Context:** API routes need consistent success and error responses.
**Decision:** Use a shared `ApiError` class and `withErrorHandler` wrapper for route handlers.
**Consequence:** Route handlers do not need repeated try/catch blocks. Error responses use one format. This adds one small abstraction.

---

# ADR-006: Use app-oriented emission tables
**Status:** Accepted
**Date:** 2026-04-27
**Context:** The app needs country, year, gas, and sector queries. The provided CSV is seed data, not the database model.
**Decision:** Use app-oriented tables: `Country`, `AnnualEmission`, `SectorShare`, and `User`. The seed script maps CSV rows into these tables.
**Consequence:** API queries stay simple. Dashboard data is easier to fetch. CSV mapping is handled during seeding. New indicator types may require schema changes.

---

# ADR-007: Use react-simple-maps for the world map
**Status:** Superseded by ADR-020
**Date:** 2026-04-27
**Context:** The dashboard needs a world map coloured by country emissions.
**Decision:** Use `react-simple-maps` with bundled TopoJSON data.
**Consequence:** The map does not need an external map service. The implementation stays focused on choropleth rendering. Advanced map features are out of scope.

---

# ADR-008: Use a separate admin route
**Status:** Accepted
**Date:** 2026-04-27
**Context:** Admin pages need role checks and CRUD-focused layout. Public dashboard pages do not.
**Decision:** Use `/admin` as a top-level route with its own layout. The admin layout calls `requireAdmin()`.
**Consequence:** Admin access is checked in one place. Public and admin layouts stay separate. This creates two layouts to maintain.

---

# ADR-009: Use a single-select gas filter
**Status:** Accepted
**Date:** 2026-04-27
**Context:** The dashboard needs a greenhouse gas filter. The filter can be single-select or multi-select.
**Decision:** Use single-select. One gas is selected at a time.
**Consequence:** URL state stays simple with one `gas` value. Charts and map render one selected gas. Side-by-side gas comparison is not included.

---

# ADR-010: Transform seed data during import
**Status:** Accepted
**Date:** 2026-04-27
**Context:** The provided CSV is used as seed data. It contains wide year columns, metadata rows, missing values, and series that are not all needed by the app.
**Decision:** Transform the CSV during the seed step. Store only the fields needed by the app tables. Preserve missing values as `null`. Do not treat missing values as `0`.
**Consequence:** The database stays aligned with the app model. The seed script owns CSV cleanup and mapping. If the CSV format changes, the seed script may need updates.

---

# ADR-011: Use OpenAPI with Scalar for API documentation
**Status:** Accepted
**Date:** 2026-04-28
**Context:** The project requires API documentation at `/api/docs`. The requirements allow Swagger or similar tools, but the app should avoid outdated documentation UX while still using a standard machine-readable API contract.
**Decision:** Use OpenAPI as the contract format. Serve the raw OpenAPI document at `GET /api/openapi`. Render interactive API documentation at `/api/docs` using Scalar API Reference as the Swagger UI replacement.
**Consequence:** The API documentation has a modern UI while remaining compatible with the OpenAPI/Swagger ecosystem. The OpenAPI document becomes the machine-readable source for documentation. The team must keep the contract, Zod schemas, and implementation aligned to avoid documentation drift.

---

# ADR-012: Evaluate OpenAPI schema source strategy
**Status:** Accepted
**Date:** 2026-04-28
**Context:** The app will use Zod for runtime validation and OpenAPI for API documentation. If schemas are maintained in multiple places, the contract can drift from the implementation.
**Decision:** Generate OpenAPI from Zod schemas using `@asteasolutions/zod-to-openapi`. Render the generated spec with Scalar using `@scalar/nextjs-api-reference`. Do not maintain hand-written OpenAPI YAML or route-comment documentation as a second source of truth.
**Consequence:** Zod remains the schema source for validation and documentation. Route handlers can stay thin, API docs avoid duplication, and reviewers get a modern Swagger-style documentation experience at `/api/docs`.

---

# ADR-013: Evaluate server-side API caching
**Status:** Proposed
**Date:** 2026-04-28
**Context:** Dashboard queries are read-heavy and mostly stable after seeding. TanStack Query already provides client-side caching, but public API routes may still benefit from server-side caching if response time is poor.
**Decision:** Pending. Options to compare: no server cache, Next.js route/service caching, or an external cache layer.
**Consequence:** This decision will affect performance, infrastructure complexity, and cache invalidation behaviour after admin writes.

---

# ADR-014: Evaluate chart export method
**Status:** Proposed
**Date:** 2026-04-28
**Context:** The PRD includes chart download as a bonus. The app only needs image export unless requirements change.
**Decision:** Pending. Options to compare: client-side PNG export, library-specific export helpers, or server-side rendering.
**Consequence:** This decision will affect export quality, browser compatibility, and implementation cost.

---

# ADR-015: Evaluate admin CRUD interface structure
**Status:** Proposed
**Date:** 2026-04-28
**Context:** Admin users need create, update, and delete flows for countries, annual emissions, and sector shares. The interface should stay simple enough for a take-home while remaining clear to reviewers.
**Decision:** Pending. Options to compare: one combined admin page, tabbed sections, or separate admin subpages.
**Consequence:** This decision will affect admin usability, routing complexity, and test coverage.

---

# ADR-018: Manual smoke test for GitHub OAuth end-to-end flow
**Status:** Accepted
**Date:** 2026-04-28
**Context:** The GitHub OAuth redirect flow requires a live GitHub OAuth app, real client credentials, and a browser session. This cannot be replicated in a unit or integration test without mocking GitHub's OAuth server, which would test the mock rather than the real flow. Automated E2E tests (e.g. Playwright) against a live OAuth provider require test GitHub accounts, secret management in CI, and significant setup that exceeds the scope of this take-home.
**Decision:** The GitHub sign-in flow is verified by a manual smoke test during the B4 story: start the dev server with Doppler secrets, navigate to `/api/auth/signin`, click "Sign in with GitHub", confirm redirect to GitHub, confirm callback returns an authenticated session, confirm a `User` row is created in the database with `role = VIEWER`. Unit tests cover the Auth.js config shape, JWT/session callbacks, and `requireAdmin()` logic in isolation using mocks.
**Consequence:** The OAuth redirect itself is not regression-tested automatically. A broken `AUTH_GITHUB_ID` or `AUTH_GITHUB_SECRET` in a new environment would only be caught by re-running the manual smoke test.

---

# ADR-017: Use PrismaPg adapter singleton for database access
**Status:** Accepted
**Date:** 2026-04-28
**Context:** Prisma v7 requires a driver adapter when connecting to PostgreSQL via `pg`. Instantiating `PrismaClient` at module load without `DATABASE_URL` crashes the Next.js dev server. Multiple modules importing `PrismaClient` directly would each create their own connection pool.
**Decision:** Create a shared singleton at `src/lib/prisma.ts` using `PrismaPg` (from `@prisma/adapter-pg`) configured from `DATABASE_URL`. Export the singleton as `prisma`. Guard against multiple instances in development with `globalThis._prisma`.
**Consequence:** The database connection pool is shared across all server modules. Module load no longer crashes when `DATABASE_URL` is absent at import time — the adapter reads the env var only when the singleton is first used. All modules that need database access must import from `@/lib/prisma`.

---

# ADR-016: Evaluate API contract testing depth
**Status:** Proposed
**Date:** 2026-04-28
**Context:** The API contract must stay aligned with route handlers, Zod validation, and OpenAPI documentation. The project needs enough confidence without turning the take-home into a large test platform.
**Decision:** Pending. Options to compare: route-level tests only, route tests plus OpenAPI validation, or broader integration tests.
**Consequence:** This decision will affect confidence, build time, and how much contract drift can be caught before deployment.

---

# ADR-019: Use dedicated endpoints for available years
**Status:** Accepted
**Date:** 2026-04-29
**Context:** The dashboard year dropdowns need to show only years that have actual data. The existing `/api/emissions/map` and `/api/emissions/sector` endpoints require a specific year as input — they cannot enumerate available years. The original client implementation probed 33–41 years in parallel by calling the data endpoints for each candidate year and filtering out empty responses, producing up to 74 concurrent API calls on dashboard load.
**Decision:** Add `GET /api/emissions/map/years` and `GET /api/emissions/sector/years?country=XX` as dedicated read endpoints. Each queries the database directly using `distinct` year selection with a `not: null` filter. The map years endpoint is cached client-side with `staleTime: Infinity` since seeded data does not change at runtime.
**Consequence:** Year enumeration costs one database query per endpoint instead of dozens of round-trips. The client-side probing logic is removed. The two new routes are thin and follow the same `withApiErrorHandling` / `apiSuccess` pattern as existing routes.

---

# ADR-020: Load world map TopoJSON from CDN at runtime
**Status:** Accepted
**Supersedes:** ADR-007
**Date:** 2026-04-29
**Context:** ADR-007 stated "bundled TopoJSON data" but `world-atlas` TopoJSON cannot be bundled directly via import without a raw-loader or inline JSON import (which adds ~100 KB to the JS bundle). `react-simple-maps` v3 accepts a URL string as the `geography` prop and fetches and parses the TopoJSON internally — this is the canonical usage pattern for the library.
**Decision:** Pass `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` as the `geography` prop to `<Geographies>`. No bundling or manual `topojson-client` parsing is needed. The map geography uses ISO numeric country IDs which are mapped to ISO alpha-3 codes via a lookup table in the component.
**Consequence:** The JS bundle does not include the TopoJSON file. The map makes one CDN fetch on first render, cached by the browser thereafter. The implementation stays within the react-simple-maps v3 API without needing `topojson-client` types or manual feature extraction.

---

# ADR-021: Keep explicit world map legend states aligned and always visible
**Status:** Accepted
**Date:** 2026-04-30
**Context:** The assignment requires the world map to communicate value scale plus missing-data handling clearly. A map legend alignment regression made the legend harder to scan and weakened the distinction between normal scale labels and special states such as `No data` and `Not tracked`.
**Decision:** Keep the world map legend as a fixed, explicit legend block with aligned entries for sequential scale labels and special non-value states. Preserve dedicated labels for `Low`, `High`, `No data`, and `Not tracked`, and verify their rendering in component tests.
**Consequence:** The map legend remains reviewer-readable and supports the assignment’s honest-data requirement. The component takes on a small amount of extra layout/test maintenance, but missing-data semantics stay visible instead of being implied by color alone.

---

# ADR-022: Use a temporary tooltip for snapped-year messaging
**Status:** Accepted
**Date:** 2026-04-30
**Context:** Some year selectors can snap to the nearest available reporting year when the requested year is missing. A persistent helper line under the control communicated this, but it permanently consumed vertical space and added low-signal chrome to dense dashboard control rows.
**Decision:** Represent snapped-year messaging as a temporary tooltip attached to a small info affordance next to the year label instead of persistent helper typography under the field.
**Consequence:** The snapped-year explanation remains discoverable on hover/focus/touch without permanently expanding the control layout. This slightly increases reliance on tooltip interaction, but keeps the dashboard controls cleaner while still exposing the behavior.
