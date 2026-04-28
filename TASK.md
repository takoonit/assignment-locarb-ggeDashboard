# ✅ 07 — Tasks

**Project:** Greenhouse Gas Emissions Dashboard & API
**Owner:** Takoon
**Last sync to `TASK.md`:** 2026-04-28

> Working tracker. Update this page first, then regenerate `TASK.md` for the repo.

---

# Legend
- ✅ Done
- 🟡 In Progress
- ⏳ Todo
- 🔵 Backlog
- ❓ Needs Decision

---

# Section A: Planning Artifacts
Docs that define the build.

| # | Artifact | Status | Acceptance Criteria |
| --- | --- | --- | --- |
| A1 | 00 — PRD | ✅ Done | Scope, users, API/dashboard requirements, bonuses, out-of-scope, and definition of done are clear. |
| A2 | 01 — Architecture | ✅ Done | System overview, layers, request lifecycle, auth flow, deployment, and out-of-scope are clear. |
| A3 | 01b — Conventions | ✅ Done | Must align with `Country`, `AnnualEmission`, `SectorShare`, `User`; remove old `db.emission` / `totalEmissions` examples. |
| A4 | 01c — ADRs | ✅ Done | ADRs 1-9 are plain, restrained, and aligned with current decisions. |
| A5 | 02 — Data Model | ✅ Done | Uses `Country`, `AnnualEmission`, `SectorShare`, `User`; includes schema, seed mapping, CRUD rules, indexes, and acceptance criteria. |
| A6 | 03 — API Contracts | ✅ Done | All required endpoints with query/body schema, response shape, and error codes. OpenAPI-ready. |
| A7 | 04 — UI Spec | ✅ Done | Dashboard layout, scoped controls, loading, empty, and error states are defined. |
| A8 | 05 — AI Workflow | ⏳ Todo | How docs are used by BMAD/agents, story prompt template, review checklist. |
| A9 | 06 — Tradeoffs & Next Steps | ⏳ Todo | Clear reviewer-facing tradeoffs and future improvements. |

---

# Section B: Pre-BMAD Cleanup
Must finish before build phase.

| # | Task | Status | Acceptance Criteria |
| --- | --- | --- | --- |
| P1 | Clean main project tracking table | ⏳ Todo | Malformed table is removed or replaced with simple bullets/list. |
| P2 | Update Conventions to new data model | ✅ Done | Examples use `AnnualEmission` / `SectorShare`; admin route path matches ADR-008; styling rules now match MUI decision. |
| P3 | Verify Architecture model references | ✅ Done | Request lifecycle and examples use current model names and aligned API error/response conventions. |
| P4 | Final consistency pass | ✅ Done | PRD, Architecture, Conventions, ADRs, Data Model, API Contracts, UI Spec, and Tasks are aligned after MUI and scoped-control updates. |
| P5 | Export/copy docs to repo | ✅ Done | Repo has clean Markdown docs matching Notion final docs. |

---

# Section C: Build Stories
Build order after docs are final.

| # | Story | Status | Depends On | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| B1 | Repo scaffold | ⏳ Todo | A1-A7 | Next.js 16 + TypeScript + MUI + Material Design 3-inspired theme created. Basic scripts work. |
| B2 | Prisma schema | ⏳ Todo | A5 | Schema matches `Country`, `AnnualEmission`, `SectorShare`, `User`. Migration runs clean. |
| B3 | CSV seed pipeline | ⏳ Todo | B2 | Seed reads provided CSV, skips metadata rows, preserves nulls, upserts countries, annual emissions, and sector shares. |
| B4 | Auth.js + GitHub OAuth | ⏳ Todo | B2 | GitHub sign-in works. User has `email` and `role`. Admin role check works. |
| B5 | API read endpoints | ⏳ Todo | B3, A6 | Countries, trend, map, sector, and filter endpoints work with Zod validation. |
| B6 | API error wrapper | ⏳ Todo | B5 | Shared error shape and success shape are used by all routes. |
| B7 | API write endpoints | ⏳ Todo | B4, B5 | Admin-only create/update/delete for countries, annual emissions, and sector shares. |
| B8 | Dashboard shell | ⏳ Todo | B1, A7 | Responsive layout with header/controls/main dashboard area. |
| B9 | Trend line chart | ⏳ Todo | B5, B8 | Country/gas selection works. Missing years and sparse data render safely. |
| B10 | World map | ⏳ Todo | B5, B8 | Year/gas selection works. No-data countries use distinct colour. |
| B11 | Sector bar chart | ⏳ Todo | B5, B8 | Sector shares render by country/year. Null and zero values handled safely. |
| B12 | Gas filter | ⏳ Todo | B9-B11 | Single-select gas filter controls trend/map and URL state. |
| B13 | Admin CRUD page | ⏳ Todo | B7, B8 | `/admin` route protected by `requireAdmin`; create/edit/delete forms work. |
| B14 | Swagger docs | ⏳ Todo | B5, B7 | `/api/docs` documents endpoints, params, bodies, responses, and errors. |
| B15 | README | ⏳ Todo | B1-B14 | Setup, env vars, seed, run, API docs, screenshots, tradeoffs, live URL. |
| B16 | Deploy + smoke test | ⏳ Todo | B15 | Vercel live URL works. Dashboard, APIs, seed, and auth are verified. |

---

# Section D: Bonus / Backlog
Only after core build works.

| # | Item | Status | Acceptance Criteria |
| --- | --- | --- | --- |
| C1 | Time slider | 🔵 Backlog | Slider changes selected year and updates visualisation. |
| C2 | Download chart as PNG | 🔵 Backlog | Chart download button exports PNG. |
| C3 | Extra response caching | 🔵 Backlog | Server-side cache added only if needed. |
| C4 | Rate limiting | 🔵 Backlog | Write endpoints protected if time allows. |
| C5 | Audit log | 🔵 Backlog | CRUD changes logged with user/action/timestamp. |

---

# Section E: Handoff Notes
## Read Order
1. `00 — PRD`
2. `01 — Architecture`
3. `01b — Conventions`
4. `01c — ADRs`
5. `02 — Data Model`
6. closest task-specific doc

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

## Quality Bar
- Keep route handlers thin
- Keep business logic in services
- Validate inputs with Zod
- Preserve `null` values from seed data
- Do not coerce missing values to zero
- Keep API responses consistent
- Test assignment edge cases

## Anti-Goals
- Do not model the raw CSV shape as the app schema
- Do not reintroduce `Indicator` unless a new ADR supersedes ADR-006
- Do not add libraries without a reason
- Do not start BMAD until planning docs are consistent
- Do not reintroduce Tailwind/shadcn unless a new ADR supersedes the MUI UI decision
