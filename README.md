# GGE Dashboard

Greenhouse Gas Emissions Dashboard & API.

## Project Status

- Planning docs exported to `docs/`
- Build phase not started yet; implementation begins when `TASK.md` story B1 starts.
- BMAD readiness is tracked in `TASK.md`.

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
- `docs/05-ai-workflow.md`
- `docs/06-tradeoffs-next-steps.md`
- `TASK.md`

## Getting Started

This project uses [Doppler](https://www.doppler.com/) for secrets management. Real values are never committed — `.env.example` lists the required variable names only.

### Prerequisites

- [Node.js](https://nodejs.org/) 20+, [pnpm](https://pnpm.io/), and [Doppler CLI](https://docs.doppler.com/docs/install-cli)
- Access to the Doppler project for this app
- A [Neon](https://neon.tech/) PostgreSQL database (see `docs/07-env-neon-doppler.md`)

### 1. Clone and install

```bash
git clone <repo-url>
cd assignment-locarb-ggeDashboard
pnpm install
```

### 2. Connect Doppler

```bash
doppler login       # one-time authentication
doppler setup       # link this directory to the Doppler project/config
```

All five required secrets (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `NEXT_PUBLIC_APP_URL`) must be present in Doppler before running the app. See `.env.example` for the full list.

### 3. Run database migrations and seed

```bash
doppler run -- pnpm db:migrate:deploy
doppler run -- pnpm db:seed
```

### 4. Start the dev server

```bash
doppler run -- pnpm dev
```

The app will be available at `http://localhost:3000`.

> For full Neon + Doppler setup details see `docs/07-env-neon-doppler.md`.

## Build Notes

- Keep route handlers thin
- Put business logic in `lib/services`
- Validate inputs with Zod
- Use explicit Prisma `select`
- Public GET routes do not require auth
- Write routes require `requireAdmin()`
- API responses use `{ data }` or `{ error: { code, details } }`
