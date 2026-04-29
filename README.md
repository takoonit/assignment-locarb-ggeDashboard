# GGE Dashboard

Greenhouse Gas Emissions Dashboard & API — a full-stack take-home project demonstrating a production-grade Next.js app with real data, typed API, interactive visualizations, admin CRUD, and full deployment.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL on [Neon](https://neon.tech/) + Prisma |
| UI | MUI (Material Design 3-inspired) + Recharts + react-simple-maps |
| Auth | Auth.js v5 with GitHub OAuth |
| Data fetching | TanStack Query |
| Validation | Zod |
| API docs | OpenAPI 3.1 + Scalar |
| Package manager | bun |
| Deployment | Vercel |

## Features

- **Public dashboard** — trend line, world map, and sector bar chart, all scoped by country and gas filter with server-side pagination.
- **Public REST API** — JSON endpoints for countries, annual emissions, and sector shares with consistent `{ data }` / `{ error }` envelopes.
- **Interactive API docs** — Scalar UI at `/api/docs` backed by a generated OpenAPI 3.1 spec.
- **Admin CRUD** — role-gated `/admin` page for managing countries, annual emissions, and sector shares with server-side pagination.
- **Honest null handling** — missing CSV values stay `null` everywhere; the UI and API never substitute `0`.

## Setup

### Prerequisites

- [Bun](https://bun.sh/) 1.0+
- [Doppler CLI](https://docs.doppler.com/docs/install-cli) (secrets management — no `.env` files are committed)
- Access to the Doppler project for this app (or supply env vars manually — see below)
- A [Neon](https://neon.tech/) PostgreSQL database

### 1. Clone and install

```bash
git clone <repo-url>
cd assignment-locarb-ggeDashboard
bun install
```

### 2. Environment variables

All secrets are managed in Doppler. Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (`sslmode=require`) |
| `NEXTAUTH_SECRET` | ≥ 32 random characters — used by Auth.js |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret |
| `NEXT_PUBLIC_APP_URL` | Public origin, e.g. `http://localhost:3000` |

**With Doppler (recommended):**

```bash
doppler login      # one-time
doppler setup      # link this directory to the Doppler project
```

**Without Doppler:** copy `.env.example` to `.env.local` and fill in real values.

### 3. Migrate the database

```bash
# With Doppler
doppler run -- bun run db:migrate:deploy

# Without Doppler (.env.local present)
bun run db:migrate:deploy
```

### 4. Seed from CSV

The seed script reads the assignment CSV and upserts all countries, annual emissions, and sector shares. Missing numeric values in the CSV become `null`.

```bash
# With Doppler
SEED_CSV_PATH=/path/to/emissions.csv doppler run -- bun run db:seed

# Without Doppler
SEED_CSV_PATH=/path/to/emissions.csv bun run db:seed
```

`SEED_CSV_PATH` must point to the provided assignment CSV file.

### 5. Start the dev server

```bash
# With Doppler
bun run dev:doppler

# Without Doppler
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

| Command | Description |
|---|---|
| `bun run dev` | Dev server (no Doppler) |
| `bun run dev:doppler` | Dev server via Doppler |
| `bun run build` | Production build |
| `bun run start` | Serve production build |
| `bun run test` | Run Vitest test suite |
| `bun run typecheck` | TypeScript check (no emit) |
| `bun run lint` | ESLint |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run db:migrate:deploy` | Apply migrations to database |
| `bun run db:seed` | Seed from CSV (`SEED_CSV_PATH` required) |

## API docs

Visit `/api/docs` for the interactive Scalar UI. The underlying OpenAPI 3.1 spec is served at `/api/openapi.json`.

Public endpoints:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/countries` | List countries |
| `GET` | `/api/emissions` | Annual emissions (filterable by country, gas, year) |
| `GET` | `/api/sector-shares` | Sector shares |

Admin endpoints (require GitHub sign-in with admin role):

| Method | Path | Description |
|---|---|---|
| `POST/PATCH/DELETE` | `/api/countries/:id` | Country CRUD |
| `POST/PATCH/DELETE` | `/api/emissions/:id` | Annual emission CRUD |
| `POST/PATCH/DELETE` | `/api/sector-shares/:id` | Sector share CRUD |

All responses use:

```json
{ "data": ... }
// or
{ "error": { "code": "...", "details": ... } }
```

## Admin access

1. Sign in at `/api/auth/signin` with a GitHub account.
2. Promote the user to admin by running this SQL against your database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Then sign out and back in. The `/admin` route becomes accessible.

## Tradeoffs and next steps

**Tradeoffs made:**

- **Single Next.js app** — API routes and UI live together to minimize deployment surface. The tradeoff is that the API and UI scale together rather than independently.
- **Direct Neon connection** — using `pg` Pool with a direct connection string rather than Neon's pooled proxy. Simpler for a single-region deployment; would need the pooler for many concurrent serverless invocations.
- **MUI over Tailwind** — MUI gives consistent accessible components quickly; Tailwind gives more pixel-level control. For a data dashboard with many table and form primitives, MUI was faster.
- **Seed via upsert, not truncate** — re-running the seed is idempotent and safe on a live database; the tradeoff is slightly more complex SQL.

**Next steps:**

- Add OAuth role promotion UI instead of raw SQL.
- Add export (CSV/JSON) from the admin table.
- Deploy to Vercel and run smoke tests (story B16).
- Add row-level change history / audit log.
