# GGE Dashboard

Greenhouse Gas Emissions Dashboard & API — a production-ready full-stack application with a typed API, interactive data visualisation, and admin management.

---

## Live Demo

- **App:** https://assignment-locarb-gge-dashboard.vercel.app/
- **API Docs:** https://assignment-locarb-gge-dashboard.vercel.app/api/docs

---

## Overview

This project delivers a full-stack greenhouse gas emissions dashboard and API with:

- RESTful API endpoints for emissions data
- Responsive dashboard with charts and world map visualisation
- Admin CRUD with role-based access control
- Robust handling of missing and partial datasets
- Structured documentation for maintainability and handover

---

## Features

### Public Dashboard

- Emissions trend line by country over time
- Interactive world map by selected year
- Sector comparison chart by country and year
- Filters for country, gas, and year
- Empty states for missing or unavailable data

### Public API

Consistent response contract:

```json
{ "data": ... }
```

or:

```json
{ "error": { "code": "...", "details": ... } }
```

Key endpoints:

- `/api/countries`
- `/api/emissions/trend`
- `/api/emissions/map`
- `/api/emissions/sector`
- `/api/emissions/filter`

### Admin Panel

- Protected `/admin` route
- CRUD operations for:
  - Countries
  - Annual emissions
  - Sector shares
- Role-based access control

### Data Handling

- Provided CSV is used as seed data only
- Seed script transforms CSV into application tables
- Missing CSV values are preserved as `null`, never converted to `0`
- Partial datasets render gracefully on the frontend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + TypeScript |
| Database | PostgreSQL (Neon) + Prisma |
| UI | MUI + Recharts + react-simple-maps |
| Auth | Auth.js / NextAuth with GitHub OAuth |
| Data Fetching | TanStack Query |
| Validation | Zod |
| API Docs | Scalar UI + OpenAPI 3.1 |
| Package Manager | Bun |
| Deployment | Vercel |

---

## Core Decisions

- Single Next.js app for dashboard and API
- App-oriented data model:
  - `Country`
  - `AnnualEmission`
  - `SectorShare`
  - `User`
- Public API paths use `/api/emissions/*`
- `/admin` is a top-level route
- Gas filter is single-select
- Route handlers stay thin
- Business logic lives in `lib/services`
- Inputs are validated with Zod
- Prisma queries use explicit `select`
- Public GET routes do not require auth
- Create, update, and delete routes require `requireAdmin()`

---

## Documentation

- `docs/00-prd.md`
- `docs/01-architecture.md`
- `docs/01b-conventions.md`
- `docs/01c-adrs.md`
- `docs/02-data-model.md`
- `docs/03-api-contracts.md`
- `docs/04-ui-spec.md`
- `docs/05-ai-workflow.md`
- `docs/06-tradeoffs-next-steps.md`
- `docs/07-env-neon-doppler.md`
- `TASK.md`

---

## BMAD Approach

This project follows a structured Build–Measure–Adapt–Document approach:

- **Build** — Implement the typed API, dashboard, admin CRUD, and seed pipeline
- **Measure** — Validate behaviour through type safety, Zod validation, and tests
- **Adapt** — Record tradeoffs and future improvements clearly
- **Document** — Maintain practical docs for review, handover, and future development

---

## Getting Started

### Prerequisites

- Bun 1.0+
- PostgreSQL database (Neon recommended)
- Doppler CLI

---

### Installation

```bash
git clone <repo-url>
cd assignment-locarb-ggeDashboard
bun install
```

---

## Environment Setup

This project uses Doppler for secrets management. Real secret values should not be committed to the repository.

Required variables:

| Variable | Description |
|---|---|
| DATABASE_URL | PostgreSQL connection string |
| NEXTAUTH_SECRET | Auth.js secret |
| AUTH_GITHUB_ID | GitHub OAuth client ID |
| AUTH_GITHUB_SECRET | GitHub OAuth client secret |
| NEXT_PUBLIC_APP_URL | Application base URL |

See `.env.example` for the expected variable names.

---

## Doppler Setup

```bash
doppler login
doppler setup
```

Run commands through Doppler:

```bash
doppler run -- bun run dev
doppler run -- bun run db:migrate:deploy
doppler run -- bun run db:seed
```

For full Neon + Doppler setup details, see:

```text
docs/07-env-neon-doppler.md
```

---

## Database Setup

Run migrations:

```bash
bun run db:migrate:deploy
```

Seed the database:

```bash
bun run db:seed
```

If a custom CSV path is required:

```bash
SEED_CSV_PATH=/path/to/emissions.csv bun run db:seed
```

---

## Run Development Server

```bash
bun run dev
```

The app will be available at:

```text
http://localhost:3000
```

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Production build |
| `bun run test` | Run tests |
| `bun run typecheck` | Type checking |
| `bun run db:migrate:deploy` | Run database migrations |
| `bun run db:seed` | Seed database |

---

## Authentication & Roles

- Users sign in with GitHub OAuth
- First login creates a user with the `VIEWER` role
- Admin-only writes require the `ADMIN` role

Promote a user to admin:

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'your@email.com';
```

Re-login after promotion to access `/admin`.

---

## API Documentation

- Interactive docs: `/api/docs`
- OpenAPI spec: `/api/openapi`

---

## Tradeoffs

- **Single Next.js app**
  - Simpler deployment and review
  - Less independent scaling between API and UI

- **Direct database connection**
  - Simple and practical for this assignment
  - Less optimal for high serverless concurrency

- **MUI over custom CSS/Tailwind**
  - Faster structured UI delivery
  - Less granular visual control

- **Idempotent seeding**
  - Safe to re-run
  - Slightly more complex seed logic

---

## Future Improvements

- Admin UI for role management
- CSV/JSON export
- Audit logs for admin changes
- Chart image/PDF export
- API response caching
- Load testing and performance tuning

---

## Deployment

Deploy directly to Vercel with environment variables managed through Doppler.

---

## License

This project is for demonstration purposes.
