# Product Brief - GHG Emissions Dashboard

**Status:** Approved via existing planning docs  
**Source docs:** `docs/00-prd.md`, `docs/06-tradeoffs-next-steps.md`

## Problem Statement

Build a take-home full-stack application that exposes greenhouse gas emissions data through a REST API and visualizes the same data through an interactive dashboard.

The app must prove that the implementation can handle real data shape issues: missing values, sparse year ranges, countries without data, sector nulls, and admin-maintained records.

## Target Users

- Public visitor: views dashboard data and calls read-only API endpoints.
- Admin user: signs in with GitHub and creates, updates, or deletes country, annual emissions, and sector share records.
- Reviewer: evaluates architecture, API clarity, data handling, UI quality, tests, documentation, and deployment readiness.

## Success Metrics

- All must-have API endpoints work with consistent response and error shapes.
- Dashboard renders trend, sector, and map views with scoped controls.
- Missing data remains `null` and is visible in UI/API behavior.
- Admin CRUD is role-gated.
- API documentation is available.
- README explains setup, seed, run, API docs, screenshots, deployment, and tradeoffs.

## Constraints

- Next.js 16 App Router with TypeScript.
- PostgreSQL on Neon with Prisma.
- MUI with Material Design 3-inspired styling.
- TanStack Query, Recharts, and react-simple-maps for frontend data and charts.
- Auth.js with GitHub provider for admin auth.
- Zod validation for API inputs.
- Vercel deployment target.
- Do not start implementation outside the approved story sequence.

## Open Questions

- Exact assignment CSV filename/location must be confirmed before B3 seed implementation.
- Final deployment env vars and Neon connection details must be supplied before B16.
