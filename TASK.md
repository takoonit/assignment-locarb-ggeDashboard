# TASK - GHG Emissions Dashboard

**Project:** Greenhouse Gas Emissions Dashboard & API
**Owner:** Takoon
**Source:** Notion `07 - Tasks`
**Status:** BMAD implementation in progress; next story is B8

---

# Legend

- Done: complete
- Next: the next task to start
- In Progress: active work
- Todo: not started
- Backlog: optional or later
- Needs Decision: blocked by a decision

---

# Work Tracker

Use this section first. The detailed task tables below are the source of acceptance criteria and dependencies.

## Done

- A1-A9: planning artifacts are complete.
- B1-B4: Epic 1 (Scaffold, Prisma, Seed, Auth) is complete.
- B5-B7, B14: Epic 2 (API Read/Write, Error Wrapper, Docs) is complete.
- P1-P5: pre-BMAD cleanup is complete.
- BMAD readiness gate is green.
- Main Notion checklist is synced with the repo.
- README references the current planning docs.
- BMAD Full Method handoff is sharded under `docs/bmad/`.

## Next

- B8 - Dashboard shell
  - Active BMAD story: `docs/bmad/stories/epic-3/story-b8-dashboard-shell.md`.
  - Resume pointer: `docs/bmad/current.md`.
  - Implement the main dashboard layout and responsive shell.

## Not Started

- B9 - Trend line chart
- B10 - World map
- B11 - Sector bar chart
- B12 - Gas filter
- B13 - Admin CRUD page
- B15 - README
- B16 - Deploy + smoke test

## Backlog

- C1 - Time slider
- C2 - Download chart as PNG
- C3 - Extra response caching
- C4 - Rate limiting
- C5 - Audit log

---

# BMAD Readiness Gate

BMAD implementation may start only when every item below is checked.

| Gate | Status | Evidence |
| --- | --- | --- |
| PRD scope locked | Checked | `docs/00-prd.md` separates must-have, committed bonus, backlog, and out-of-scope items. |
| Architecture locked | Checked | `docs/01-architecture.md` defines the stack, layers, request lifecycle, auth flow, and deployment topology. |
| Conventions locked | Checked | `docs/01b-conventions.md` defines file structure, API response shape, service boundaries, MUI rules, testing, and env rules. |
| Data model locked | Checked | `docs/02-data-model.md` defines `Country`, `AnnualEmission`, `SectorShare`, `User`, seed mapping, indexes, and CRUD rules. |
| API contracts locked | Checked | `docs/03-api-contracts.md` defines params, bodies, response shapes, and error cases. |
| UI spec locked | Checked | `docs/04-ui-spec.md` defines layout, scoped controls, chart/map behavior, and loading/error/empty states. |
| Tradeoffs documented | Checked | `docs/06-tradeoffs-next-steps.md` documents excluded scope and later paths. |
| Story order locked | Checked | Section C lists build stories B1-B16 in dependency order. |
| Acceptance gates testable | Checked | Docs include acceptance criteria for PRD, data model, API contracts, UI spec, AI workflow, tradeoffs, and build stories. |
| README aligned | Checked | `README.md` references existing planning docs, includes `TASK.md`, and clarifies that implementation begins at B1. |
| Notion and repo synced | Checked | Main Notion checklist now matches repo readiness state and points to `07 - Tasks` / `TASK.md`. |

Current gate status: BMAD implementation in progress. Continue from story B8.

---

# Section A: Planning Artifacts

Docs that define the build.

| # | Artifact | Status | Acceptance Criteria |
| --- | --- | --- | --- |
| A1 | 00 - PRD | Done | Scope, users, API/dashboard requirements, bonuses, out-of-scope, and definition of done are clear. |
| A2 | 01 - Architecture | Done | System overview, layers, request lifecycle, auth flow, deployment, and out-of-scope are clear. |
| A3 | 01b - Conventions | Done | Conventions align with `Country`, `AnnualEmission`, `SectorShare`, and `User`; old model names are not used. |
| A4 | 01c - ADRs | Done | ADRs are plain, restrained, and aligned with current decisions. |
| A5 | 02 - Data Model | Done | Uses `Country`, `AnnualEmission`, `SectorShare`, and `User`; includes schema, seed mapping, CRUD rules, indexes, and acceptance criteria. |
| A6 | 03 - API Contracts | Done | All required endpoints include query/body schema, response shape, and error codes. OpenAPI-ready. |
| A7 | 04 - UI Spec | Done | Dashboard layout, scoped controls, MUI direction, loading/error/empty states, and responsive behavior are defined. |
| A8 | 05 - AI Workflow | Done | Defines how docs are used by BMAD/agents, story prompt template, review checklist, and stop conditions. |
| A9 | 06 - Tradeoffs & Next Steps | Done | Reviewer-facing tradeoffs and future improvements are documented. |

---

# Section B: Pre-BMAD Cleanup

Must finish before the build phase starts.

| # | Task | Status | Acceptance Criteria |
| --- | --- | --- | --- |
| P1 | Clean main project tracking table | Done | Malformed table is removed or replaced with a simple checklist/list in Notion. |
| P2 | Update conventions to current data model | Done | Examples use `AnnualEmission` and `SectorShare`; admin route path and MUI styling rules match locked decisions. |
| P3 | Verify architecture model references | Done | Request lifecycle and examples use current model names and aligned API error/response conventions. |
| P4 | Final consistency pass | Done | PRD, architecture, conventions, ADRs, data model, API contracts, UI spec, and tasks are aligned. |
| P5 | Export/copy docs to repo | Done | Repo has clean Markdown docs matching final Notion docs. |

---

# Section C: Build Stories

Build order after docs are final.

| # | Story | Status | Depends On | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| B1 | Repo scaffold | Done | A1-A7 | Next.js 16 + TypeScript + MUI + Material Design 3-inspired theme are set up. Basic scripts work. |
| B2 | Prisma schema | Done | A5 | Schema matches `Country`, `AnnualEmission`, `SectorShare`, and `User`. Migration runs cleanly. |
| B3 | CSV seed pipeline | Done | B2 | Seed reads provided CSV, skips metadata rows, preserves nulls, and upserts countries, annual emissions, and sector shares. |
| B4 | Auth.js + GitHub OAuth | Done | B2 | GitHub sign-in works. User has `email` and `role`. Admin role check works. |
| B5 | API read endpoints | Done | B3, A6 | Countries, trend, map, sector, and filter endpoints work with Zod validation. |
| B6 | API error wrapper | Done | B5 | Shared error shape and success shape are used by all routes. |
| B7 | API write endpoints | Done | B4, B5 | Admin-only create/update/delete exists for countries, annual emissions, and sector shares. |
| B8 | Dashboard shell | Next | B1, A7 | Responsive layout with header, scoped controls, and main dashboard area. |
| B9 | Trend line chart | Todo | B5, B8 | Country/gas selection works. Missing years and sparse data render safely. |
| B10 | World map | Todo | B5, B8 | Year/gas selection works. No-data countries use distinct color. |
| B11 | Sector bar chart | Todo | B5, B8 | Sector shares render by country/year. Null and zero values are handled safely. |
| B12 | Gas filter | Todo | B9-B11 | Single-select gas filter controls trend/map and URL state. |
| B13 | Admin CRUD page | Todo | B7, B8 | `/admin` route is protected by `requireAdmin`; create/edit/delete forms work. |
| B14 | OpenAPI + Scalar docs | Done | B5, B7 | Zod schemas generate `GET /api/openapi`; Scalar renders `GET /api/docs`; docs cover endpoints, params, bodies, responses, and errors without manual YAML. |
| B15 | README | Todo | B1-B14 | Setup, env vars, seed, run, API docs, screenshots, tradeoffs, and live URL are documented. |
| B16 | Deploy + smoke test | Todo | B15 | Vercel live URL works. Dashboard, APIs, seed, and auth are verified. |

---

# Section D: Bonus / Backlog

Only after the core build works.

| # | Item | Status | Acceptance Criteria |
| --- | --- | --- | --- |
| C1 | Time slider | Backlog | Slider changes selected year and updates visualisations. |
| C2 | Download chart as PNG | Backlog | Chart download button exports PNG. |
| C3 | Extra response caching | Backlog | Server-side cache is added only if measured performance requires it. |
| C4 | Rate limiting | Backlog | Write endpoints are protected if production hardening is needed. |
| C5 | Audit log | Backlog | CRUD changes are logged with user, action, and timestamp. |

---

# Section E: Handoff Notes

## Read Order

1. `docs/00-prd.md`
2. `docs/01-architecture.md`
3. `docs/01b-conventions.md`
4. `docs/01c-adrs.md`
5. `docs/02-data-model.md`
6. `docs/03-api-contracts.md`
7. `docs/04-ui-spec.md`
8. `docs/05-ai-workflow.md`
9. `docs/06-tradeoffs-next-steps.md`
10. closest task-specific doc or section

## Locked Decisions

- Single Next.js app
- PostgreSQL on Neon with Prisma
- TanStack Query for dashboard data
- Auth.js with GitHub OAuth
- Shared API error wrapper
- App-oriented data model: `Country`, `AnnualEmission`, `SectorShare`, `User`
- `react-simple-maps` for world map
- `/admin` top-level route
- single-select gas filter
- MUI with a Material Design 3-inspired theme

## Quality Bar

- Keep route handlers thin.
- Keep business logic in services.
- Validate inputs with Zod.
- Preserve `null` values from seed data.
- Do not coerce missing values to zero.
- Keep API responses consistent.
- Test assignment edge cases.
- Keep controls scoped to the visualization they affect.
- Use the existing docs as the contract before changing behavior.

## Anti-Goals

- Do not model the raw CSV shape as the app schema.
- Do not reintroduce `Indicator`, `EmissionRecord`, `Emission`, or `totalEmissions` unless a new ADR supersedes the current data model.
- Do not add libraries without a reason tied to the locked docs.
- Do not start BMAD implementation until the readiness gate is green.
- Do not reintroduce Tailwind/shadcn as the primary UI approach unless a new ADR supersedes the MUI decision.
- Do not hide missing data or convert `null` to `0`.
