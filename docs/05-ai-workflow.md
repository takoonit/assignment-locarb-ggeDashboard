**Project:** Greenhouse Gas Emissions Dashboard & API
**Status:** Locked for build

---

# 1. Purpose
This document defines how AI agents should use the planning docs during implementation.

The goal is to keep the build fast without letting generated code drift from the app requirements.

Core rule:
```plain text
The app requirements and locked ADRs are the source of truth.
If generated code conflicts with the docs, fix the code or stop and ask.
```

---

# 2. Source of Truth
Before starting a story, read only the documents needed for that story.

Default read order:
1. `00 — PRD`
2. `01 — Architecture`
3. `01b — Conventions`
4. `01c — ADRs`
5. `02 — Data Model`
6. closest task-specific doc:
   - API work: `03 — API Contracts`
   - dashboard work: `04 — UI Spec`
   - planning/process work: this document

Do not implement from memory if the docs are available.

---

# 3. Locked Decisions for Agents
Agents must preserve these decisions unless a new ADR supersedes them:

- single Next.js app
- PostgreSQL on Neon with Prisma
- MUI with a Material Design 3-inspired theme
- TanStack Query for dashboard data
- Auth.js with GitHub OAuth
- app data model: `Country`, `AnnualEmission`, `SectorShare`, `User`
- public API paths may use `/api/emissions/*`
- `/admin` is a top-level route
- gas filter is single-select
- missing CSV values stay `null`, never `0`
- public GET routes do not require auth
- create, update, and delete routes require `requireAdmin()`
- API responses use `{ data }` or `{ error: { code, details } }`

Do not reintroduce `Indicator`, `EmissionRecord`, `Emission`, or `totalEmissions`.

---

# 4. Build Workflow
Use the task order in `07 — Tasks`.

For each build story:
1. Confirm the story status and dependencies in `07 — Tasks`.
2. Read the relevant docs only.
3. Create or update the implementation plan for that story.
4. Write or update focused tests where practical.
5. Implement the smallest change that satisfies the acceptance criteria.
6. Run the most specific useful validation command.
7. Update the task status and note any blocker.

Rules:
- do not skip dependencies
- do not expand scope during implementation
- do not add libraries without a clear reason
- keep route handlers thin
- put business logic in `lib/services`
- validate inputs with Zod
- use explicit Prisma `select`

---

# 5. Story Prompt Template
Use this prompt when handing a story to an AI agent:

```plain text
You are implementing <story id> — <story title> for the Lo-Carb GHG dashboard.

Read first:
- docs/00-prd.md
- docs/01-architecture.md
- docs/01b-conventions.md
- docs/01c-adrs.md
- <story-specific docs>

Acceptance criteria:
- <copy from 07 — Tasks>

Constraints:
- Use the current data model: Country, AnnualEmission, SectorShare, User.
- Preserve null values. Never coerce missing data to zero.
- Keep route handlers thin and business logic in lib/services.
- Validate request input with Zod.
- Use explicit Prisma select.
- Public GET routes do not require auth.
- Mutating routes require requireAdmin().
- API responses use { data } or { error: { code, details } }.
- Do not reintroduce Indicator, EmissionRecord, Emission, or totalEmissions.

Deliver:
- code changes for this story only
- tests or validation notes
- concise summary of changed files
- any blockers or doc conflicts
```

For UI stories, add:
```plain text
Use MUI components and the MUI theme.
Controls must be scoped to the visualisation they affect.
Loading, error, empty, partial, and sparse-data states must be handled.
```

For API stories, add:
```plain text
Follow docs/03-api-contracts.md exactly.
Do not return raw Prisma records directly.
```

---

# 6. Review Checklist
Use this checklist before marking a story done.

## Requirements
- acceptance criteria from `07 — Tasks` are met
- implementation matches the closest task-specific doc
- no locked decision has been changed without an ADR

## Data
- missing CSV values remain `null`
- `0` remains a real reported zero
- aggregate regions are handled according to the endpoint contract
- Prisma queries use explicit `select`

## API
- input validation uses Zod
- invalid params return `400 INVALID_PARAMS`
- success responses use `{ data }`
- errors use `{ error: { code, details } }`
- public GET routes remain public
- mutating routes call `requireAdmin()`
- route handlers stay thin

## UI
- controls are scoped to the chart they affect
- loading, error, empty, partial, and sparse states are visible
- chart copy explains unit and selected scope
- null and no-data states are not hidden
- mobile layout has no horizontal overflow

## Quality
- no `any` in component props
- no hardcoded secrets
- no unnecessary dependency added
- validation command was run or the reason is documented
- README or docs are updated if behaviour changed

---

# 7. Status Update Template
Use this format when handing off progress:

```plain text
Story: <id> — <title>
Status: In progress | Blocked | Done
Changed:
- <file or area>

Validated:
- <command or manual check>

Notes:
- <blockers, tradeoffs, or follow-up>
```

Keep updates short. The task tracker is for state; commit messages are for history.

---

# 8. When to Stop and Ask
Stop before changing code if:

- a task conflicts with an ADR
- the data model appears to require a new entity
- an endpoint response shape differs from `03 — API Contracts`
- UI requirements require data not exposed by the API
- a new dependency is needed for core behaviour
- auth rules are unclear
- seeding would require converting missing values to zero

Do not patch around these issues silently.

---

# 9. Acceptance Criteria
This workflow doc is ready when:
- agents know which docs to read before each story
- build flow follows `07 — Tasks`
- the story prompt template is reusable
- the review checklist covers API, UI, data, and quality rules
- stop conditions are explicit
- locked decisions are repeated clearly enough to prevent model drift
