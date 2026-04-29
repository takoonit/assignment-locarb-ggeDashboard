# GGE Dashboard

Greenhouse Gas Emissions Dashboard & API.

## Project Status

- Planning docs exported to `docs/`
- Build phase not started yet; implementation begins when `TASK.md` story B1 starts.
- BMAD readiness is tracked in `TASK.md`.

This project showcases:
- A public analytics dashboard with interactive charts and maps
- A typed REST API with consistent response contracts
- Admin CRUD capabilities with role-based access control
- Clean data handling with explicit null semantics
- End-to-end TypeScript safety and modern tooling

---

## Tech Stack

| Layer            | Technology |
|------------------|-----------|
| Framework        | Next.js 16 (App Router) + TypeScript |
| Database         | PostgreSQL (Neon) + Prisma |
| UI               | MUI + Recharts + react-simple-maps |
| Authentication   | Auth.js (NextAuth) with GitHub OAuth |
| Data Fetching    | TanStack Query |
| Validation       | Zod |
| API Documentation| Scalar UI + OpenAPI 3.1 |
| Package Manager  | Bun |
| Deployment       | Vercel |

---

## Features

### Public Dashboard
- Emissions trend line visualisation
- Interactive world map
- Sector-based breakdown charts
- Filters by country, gas type, and year range

### Public API
- RESTful endpoints with consistent response format:
```json
{ "data": ... }
```
or
```json
{ "error": { "code": "...", "details": ... } }
```

### API Documentation
- Interactive docs: `/api/docs`
- OpenAPI spec: `/api/openapi`

### Admin Panel
- Role-protected `/admin` dashboard
- CRUD operations for:
  - Countries
  - Annual emissions
  - Sector shares
- Server-side pagination

### Data Integrity
- Missing CSV values are preserved as `null`
- No silent substitution with `0`

---

## Documentation & BMAD Approach

This project follows a structured documentation strategy inspired by **BMAD (Build–Measure–Adapt–Document)** principles.

### Documentation Structure

- **README.md** — high-level overview, setup, and usage
- **API Docs** — OpenAPI 3.1 + Scalar UI for interactive exploration
- **Design Docs (`design.md`)** — architecture decisions, data flow, and UI reasoning
- **Schema & Data Contracts** — Prisma schema and Zod validation ensure consistency

### BMAD in Practice

- **Build** — Implement core dashboard and API with strict typing and modular design
- **Measure** — Validate through type safety, runtime validation (Zod), and test suite
- **Adapt** — Iterative improvements via tradeoffs and future roadmap
- **Document** — Maintain clear, developer-friendly docs to support handover and scalability

This ensures the project is not only functional but also maintainable, extensible, and easy for other developers to onboard.

---

## Getting Started

### Prerequisites
- Bun 1.0+
- PostgreSQL database (Neon, Supabase, or local)
- (Optional) Doppler CLI

---

### Installation
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
bun install
```

---

### Environment Setup

Copy `.env.example` to `.env.local` and configure:

| Variable | Description |
|----------|------------|
| DATABASE_URL | PostgreSQL connection string |
| NEXTAUTH_SECRET | ≥32 random characters |
| AUTH_GITHUB_ID | GitHub OAuth Client ID |
| AUTH_GITHUB_SECRET | GitHub OAuth Secret |
| NEXT_PUBLIC_APP_URL | App base URL |

---

### Database Setup

```bash
bun run db:migrate:deploy

SEED_CSV_PATH=/path/to/emissions.csv bun run db:seed
```

---

### Run Development Server

```bash
bun run dev
```

Visit: http://localhost:3000

---

## Scripts

| Command | Description |
|--------|------------|
| bun run dev | Start development server |
| bun run dev:doppler | Run with Doppler |
| bun run build | Production build |
| bun run test | Run tests |
| bun run typecheck | Type checking |
| bun run db:seed | Seed database |

---

## Authentication & Roles

### User Flow
- Users sign in via GitHub OAuth
- First login creates a `VIEWER` role user

### Promote to Admin

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'your@email.com';
```

Then re-login to access `/admin`.

---

## Architecture Decisions

### Tradeoffs

- **Single Next.js app**
  - Simplifies deployment
  - Limits independent scaling of API/UI

- **Direct DB connection**
  - Simpler setup
  - Less optimal for high serverless concurrency

- **MUI over Tailwind**
  - Faster for structured UI
  - Less granular styling control

- **Idempotent seeding**
  - Safe for re-runs
  - Slightly more complex logic

---

## Future Improvements

- Admin UI for role management
- Data export (CSV/JSON)
- Audit logs for changes
- Multi-region database optimisation
- Load testing and performance tuning

---

## Deployment

Deploy directly to Vercel with environment variables configured.

---

## License

This project is for demonstration purposes.
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


## Deployment

Deploy directly to Vercel with environment variables configured in Doppler.

---

## License

This project is for demonstration purposes.