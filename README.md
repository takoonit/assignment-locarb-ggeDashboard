# GGE Dashboard

A full-stack Greenhouse Gas Emissions dashboard and API built with Next.js, demonstrating production-grade architecture, typed APIs, interactive data visualisation, and admin management. Designed for real-world deployment on Vercel.

---

## Overview

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
