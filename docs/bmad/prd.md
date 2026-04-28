# BMAD PRD - GHG Emissions Dashboard

**Status:** Approved  
**Source docs:** `docs/00-prd.md`, `TASK.md`

## MVP Definition

The MVP is complete when public users can explore seeded GHG emissions through the dashboard and public API, admins can maintain records through protected CRUD paths, API documentation is available, and the project can be deployed and reviewed.

## Epics

### Epic 1 - Foundation

Set up the project runtime, data schema, seed pipeline, and authentication foundation.

- B1 - Repo scaffold
- B2 - Prisma schema
- B3 - CSV seed pipeline
- B4 - Auth.js + GitHub OAuth

### Epic 2 - API

Implement public read APIs, shared response/error handling, admin write APIs, and API documentation.

- B5 - API read endpoints
- B6 - API error wrapper
- B7 - API write endpoints
- B14 - OpenAPI + Scalar docs

### Epic 3 - Dashboard

Build the dashboard shell and visualization cards with scoped controls and safe null handling.

- B8 - Dashboard shell
- B9 - Trend line chart
- B10 - World map
- B11 - Sector bar chart
- B12 - Gas filter

### Epic 4 - Admin and Delivery

Build the admin UI, finalize README, deploy, and smoke test.

- B13 - Admin CRUD page
- B15 - README
- B16 - Deploy + smoke test

## Out of Scope

- Redis/server-side cache unless measured performance requires it.
- PDF export.
- Real-time updates.
- User registration outside GitHub OAuth.
- Multi-tenancy.
- Audit logs.
- Rate limiting.
- Internationalization.

## Acceptance Criteria

- Story acceptance criteria in `TASK.md` are satisfied.
- BMAD current story is tracked in `docs/bmad/current.md`.
- Implementation happens one story at a time.
- Each story is validated before advancing.
