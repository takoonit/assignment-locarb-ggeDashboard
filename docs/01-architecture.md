**Project:** Greenhouse Gas Emissions Dashboard & API
**Author:** Takoon

**Status:** Locked

---

# 1. System Overview
A single Next.js 16 application serves both the REST API and the dashboard UI, deployed to Vercel with PostgreSQL on Neon. The API exposes GHG emissions data seeded from the assignment CSV, with role-gated CRUD for admins. The dashboard consumes the same API as any external client would, keeping a clean boundary between data layer and presentation.

The architecture is monolithic for a 2-day build, but layered internally so that splitting API and UI into separate services later would not require rewriting business logic.

---

# 2. Architecture Diagram

```mermaid
flowchart TB
    subgraph Browser
        UI[Dashboard UI<br/>React 19.2 + MUI]
        TQ[TanStack Query<br/>Cache + Refetch]
        UI --> TQ
    end

    subgraph Vercel["Vercel Edge Network"]
        subgraph NextApp["Next.js 16 App"]
            Proxy[proxy.ts<br/>Auth Session Check]
            Pages[App Router Pages<br/>RSC + Client Components]
            API[API Route Handlers<br/>/api/*]
            Lib[lib/<br/>db, auth, validators]
        end
    end

    subgraph External["External Services"]
        Neon[(PostgreSQL<br/>Neon Serverless)]
        GitHub[GitHub OAuth]
        CSV[Assignment CSV<br/>Seed Source]
    end

    TQ -->|fetch| Proxy
    Proxy --> Pages
    Proxy --> API
    Pages --> Lib
    API --> Lib
    Lib --> Neon
    Proxy -.->|verify session| GitHub
    CSV -.->|one-time seed| Neon

    classDef external fill:#fef3c7,stroke:#92400e
    classDef app fill:#dbeafe,stroke:#1e40af
    class Neon,GitHub,CSV external
    class UI,TQ,Proxy,Pages,API,Lib app
```

**Reading the diagram:** The browser holds presentation state and a query cache. The Next.js app holds business logic, validation, and persistence. External services are isolated behind clear boundaries: Neon for data, GitHub for identity, the assignment CSV as a one-time seed source.

---

# 3. Layered Internal Structure
Within the Next.js app, code is organised in concentric layers:

```text
Presentation     app/(dashboard)/*      React components, charts, map
API              app/api/*/route.ts     Request parsing, response shaping
Validation       lib/schemas/*.ts       Zod schemas for input/output
Business         lib/services/*.ts      Domain logic (aggregation, rules)
Persistence      lib/db.ts + Prisma     Database access only
```

**Rule:** layers only call downward. Pages never touch Prisma directly. API routes never embed business logic. This keeps each file under 100 lines and each test focused on one concern.

Full folder structure lives in `01b — Conventions § File Structure`.

---

# 4. Request Lifecycle

## Read path: dashboard requests trend data

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser (TanStack Query)
    participant P as proxy.ts
    participant R as /api/emissions/trend
    participant S as services/emissions.ts
    participant D as Prisma + Neon

    U->>B: Selects country "USA"
    B->>B: Check query cache
    alt Cache hit (fresh)
        B-->>U: Render chart immediately
    else Cache miss or stale
        B->>P: GET /api/emissions/trend?country=USA
        P->>P: Public route, skip auth check
        P->>R: Forward request
        R->>R: Parse + validate query (Zod)
        alt Invalid params
            R-->>B: 400 { error.code: INVALID_PARAMS }
        else Valid
            R->>S: getTrend(countryCode)
            S->>D: SELECT year, selected gas value FROM AnnualEmission WHERE country_code = ?
            D-->>S: Rows
            S->>S: Fill year gaps with null
            S-->>R: TrendData[]
            R-->>B: 200 { data: [...] }
        end
        B->>B: Update cache
        B-->>U: Render chart
    end
```

## Write path: admin deletes an emission record

```mermaid
sequenceDiagram
    participant U as Admin
    participant B as Browser
    participant P as proxy.ts
    participant R as /api/emissions/[id]
    participant A as auth() + requireAdmin
    participant D as Prisma + Neon

    U->>B: Clicks Delete
    B->>P: DELETE /api/emissions/123
    P->>R: Forward API request
    R->>A: requireAdmin()
    alt No session
        R-->>B: 401 { error: { code: "UNAUTHENTICATED" } }
    else Not admin
        R-->>B: 403 { error: { code: "FORBIDDEN" } }
    else Admin
        R->>D: DELETE FROM AnnualEmission WHERE id = 123
        D-->>R: Deleted row
        R-->>B: 200 { data: { deleted: true } }
        B->>B: Invalidate trend + map queries
        B-->>U: Toast "Deleted"
    end
```

**Why this matters:** the two flows show that authorisation happens at one chokepoint (`requireAdmin` helper), not scattered across handlers. Route handlers still enforce admin access and return standard JSON errors.

---

# 5. Authentication & Authorisation

## Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Next.js App
    participant Auth as Auth.js v5
    participant GH as GitHub OAuth
    participant DB as Neon

    U->>App: Click "Sign in with GitHub"
    App->>Auth: signIn("github")
    Auth->>GH: Redirect to OAuth consent
    GH->>U: Show consent screen
    U->>GH: Approve
    GH->>Auth: Callback with code
    Auth->>GH: Exchange code for token
    GH-->>Auth: User profile
    Auth->>DB: Upsert User row
    DB-->>Auth: User { id, email, role }
    Auth->>U: Set session cookie (JWT)
    U->>App: Subsequent requests include cookie
```

## Role Model
Two roles, defined as a Prisma enum:

```ts
enum Role {
  VIEWER  // default for new sign-ups, read-only
  ADMIN   // can CRUD emissions and countries
}
```

Promotion to ADMIN happens manually via a one-line SQL command, documented in the README. No self-service admin signup.

## Authorisation Pattern
A single helper enforces role at the route level:

```ts
// lib/auth/require-admin.ts
export async function requireAdmin() {
  const session = await auth();
  if (!session) throw new ApiError(401, "UNAUTHENTICATED");
  if (session.user.role !== "ADMIN") throw new ApiError(403, "FORBIDDEN");
  return session;
}
```

Every mutating route calls `requireAdmin()` as its first line. No try/catch in handlers; a top-level error mapper converts `ApiError` to JSON responses.

---

# 6. Deployment Topology

```mermaid
flowchart LR
    Dev[Local Dev<br/>npm run dev]
    GH[GitHub Repo<br/>main branch]
    CI[GitHub Actions<br/>lint + test + build]
    Vercel[Vercel<br/>Production]
    NeonProd[(Neon<br/>Production Branch)]
    NeonPreview[(Neon<br/>Preview Branch)]

    Dev -->|push| GH
    GH -->|trigger| CI
    CI -->|on success| Vercel
    Vercel -->|prod env| NeonProd
    Vercel -.->|preview env| NeonPreview

    style Dev fill:#fef3c7
    style Vercel fill:#dbeafe
    style NeonProd fill:#dcfce7
    style NeonPreview fill:#dcfce7
```

**Pipeline:**
1. Push to `main` triggers GitHub Actions
2. Actions run `lint`, `test`, `build` against a Neon test branch
3. On green, Vercel auto-deploys to production
4. PR branches deploy to Vercel preview URLs against Neon preview branches

**Environment variables:** managed via Vercel dashboard, mirrored locally in `.env.local`. Never committed. Reference list lives in `.env.example`.

---

# 7. Boundaries: Out of Scope
These are deliberately not built. Each is a 1-week extension from the current architecture, not a rewrite.

| Excluded | Why | How architecture supports adding it later |
| --- | --- | --- |
| Multi-tenant data isolation | Single-tenant is sufficient for the demo | Add `tenantId` column + Prisma middleware for RLS |
| Audit log for CRUD | Out of scope for 2 days | Wrap mutating service calls in an audit decorator |
| Server-side response cache (Redis) | Vercel edge cache + TanStack Query is enough at demo scale | Add `unstable_cache` wrappers to service functions |
| Rate limiting | Single-user demo, no abuse vector | Drop in `@upstash/ratelimit` at the proxy layer |
| Real-time updates | Out of scope; not in brief | Add Server-Sent Events route or Pusher integration |
| Internationalisation | English-only demo | Add `next-intl`, all UI strings already in components |

---

# 8. References
- Next.js 16 docs: https://nextjs.org/docs
- Auth.js v5: https://authjs.dev
- Prisma + Neon: https://neon.tech/docs/guides/prisma
- TanStack Query: https://tanstack.com/query/latest
- Sister docs:
  - `00 — PRD`
  - `01b — Conventions`
  - `01c — ADRs`
  - `02 — Data Model`
  - `03 — API Contracts`
