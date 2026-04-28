# assignment-locarb-ggeDashboard

Greenhouse Gas Emissions Dashboard & API for the Lo-Carb take-home.

## Project Status

- Planning docs exported to `docs/`
- Build phase not started yet

## Stack at a Glance

- Next.js 16 (App Router) + TypeScript
- PostgreSQL on Neon + Prisma
- MUI with a Material Design 3-inspired theme
- TanStack Query + Recharts + react-simple-maps
- Auth.js with GitHub OAuth
- Zod for validation
- Vercel deployment

## Core Decisions

- Single Next.js app for dashboard and API
- App-oriented data model: `Country`, `AnnualEmission`, `SectorShare`, `User`
- Seed script transforms the provided CSV into app tables
- Missing CSV values stay `null`, never `0`
- `/admin` is a top-level route
- Gas filter is single-select

## Docs

- `docs/00-prd.md`
- `docs/01-architecture.md`
- `docs/01b-conventions.md`
- `docs/01c-adrs.md`
- `docs/02-data-model.md`
- `docs/03-api-contracts.md`
- `docs/04-ui-spec.md`
- `TASK.md`

## Build Notes

- Keep route handlers thin
- Put business logic in `lib/services`
- Validate inputs with Zod
- Use explicit Prisma `select`
- Public GET routes do not require auth
- Write routes require `requireAdmin()`
- API responses use `{ data }` or `{ error: { code, details } }`
