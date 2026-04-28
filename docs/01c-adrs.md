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
**Decision:** Use Auth.js v5 with GitHub OAuth and JWT sessions. Store only `User.email` and `User.role` for admin access.
**Consequence:** Auth setup stays small. Admin checks use the stored role. Sign-in is limited to GitHub accounts.

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
**Status:** Accepted
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
**Decision:** Use OpenAPI as the contract format. Serve the raw OpenAPI document at `GET /api/openapi`. Render interactive API documentation at `/api/docs` using Scalar API Reference. Describe the result as Swagger-compatible OpenAPI documentation.
**Consequence:** The API documentation has a modern UI while remaining compatible with the OpenAPI/Swagger ecosystem. The OpenAPI document becomes the machine-readable source for documentation. The team must keep the contract, Zod schemas, and implementation aligned to avoid documentation drift.

---

# ADR-012: Evaluate OpenAPI schema source strategy
**Status:** Proposed
**Date:** 2026-04-28
**Context:** The app will use Zod for runtime validation and OpenAPI for API documentation. If schemas are maintained in multiple places, the contract can drift from the implementation.
**Decision:** Pending. Options to compare: hand-written OpenAPI, generated OpenAPI from Zod, or route-comment-based documentation.
**Consequence:** This decision will affect documentation maintenance, schema drift risk, and implementation complexity.

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

# ADR-016: Evaluate API contract testing depth
**Status:** Proposed
**Date:** 2026-04-28
**Context:** The API contract must stay aligned with route handlers, Zod validation, and OpenAPI documentation. The project needs enough confidence without turning the take-home into a large test platform.
**Decision:** Pending. Options to compare: route-level tests only, route tests plus OpenAPI validation, or broader integration tests.
**Consequence:** This decision will affect confidence, build time, and how much contract drift can be caught before deployment.
