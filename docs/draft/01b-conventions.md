Constraint document for the build phase. Loaded into AI assistant context to ensure consistent code generation across the project.

---

# 1. File Structure

```markdown
src/
├── app/
│   ├── (public)/                  Route group, public-facing
│   │   ├── page.tsx              Dashboard
│   │   ├── countries/page.tsx
│   │   └── data-quality/page.tsx
│   ├── (admin)/                   Route group, gated by proxy.ts
│   │   └── admin/page.tsx
│   ├── api/
│   │   ├── countries/route.ts
│   │   ├── emissions/
│   │   │   ├── trend/route.ts
│   │   │   ├── map/route.ts
│   │   │   ├── sector/route.ts
│   │   │   ├── filter/route.ts
│   │   │   └── [id]/route.ts
│   │   └── docs/route.ts          Swagger UI
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                        shadcn primitives, do not edit
│   ├── charts/                    Recharts wrappers (always inside shadcn ChartContainer)
│   ├── controls/                  Dropdowns, sliders, filters
│   ├── admin/                     Admin-only components
│   └── layout/                    Headers, sidebars, shells
├── lib/
│   ├── db.ts                      Prisma singleton
│   ├── auth.ts                    Auth.js config + requireAdmin helper
│   ├── env.ts                     Validated env vars
│   ├── api/
│   │   ├── client.ts              Typed apiFetch helper
│   │   ├── error.ts               apiError, apiSuccess helpers
│   │   └── validators.ts          Shared Zod schemas
│   └── utils.ts                   cn(), formatters
├── hooks/                         TanStack Query hooks, one per endpoint
├── types/
│   └── domain.ts                  Shared domain types
└── proxy.ts                       Auth route protection (Next.js 16)
prisma/
├── schema.prisma
└── seed.ts
docs/
└── CONVENTIONS.md                 This file (mirrors Notion 01b sub-page)
```

**Rules:**

- Components organized by purpose (charts, controls, admin), not by feature
- shadcn primitives in `components/ui/` are not edited; project components compose them
- Route handlers in `app/api/` stay thin; logic moves to `lib/queries/` if it grows past 30 lines
- One component per file, file name matches the component name

> Examples below elide imports for brevity. All TypeScript files must include explicit imports.
> 

---

# 2. Component Conventions

```tsx
// ❌ Avoid
export default function Chart({ data }: any) { ... }

// ✅ Required
type EmissionsTrendChartProps = {
  countryCode: string;
  fromYear?: number;
  toYear?: number;
};

export function EmissionsTrendChart({
  countryCode,
  fromYear = 1990,
  toYear = 2023,
}: EmissionsTrendChartProps) {
  const { data, isLoading, error } = useEmissionsTrend({ countryCode, fromYear, toYear });

  if (isLoading) return <ChartSkeleton />;
  if (error) return <ChartError error={error} />;
  if (!data?.length) return <ChartEmptyState />;

  return ( /* chart JSX wrapped in shadcn ChartContainer */ );
}
```

**Required:**

- Named exports only, never default
- Props always typed via a `Props` type, never `any` or inline objects
- Default values in destructuring, not in JSX
- Loading, error, and empty states handled explicitly before the happy path
- One component per file, file name matches the component name
- All chart components wrap Recharts in shadcn's `<ChartContainer>` for consistent theming

---

# 3. API Route Conventions

```tsx
// src/app/api/emissions/trend/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/error";

const QuerySchema = z.object({
  country: z.string().length(3),
  fromYear: z.coerce.number().int().min(1750).max(2030).optional(),
  toYear: z.coerce.number().int().min(1750).max(2030).optional(),
});

export async function GET(req: NextRequest) {
  const params = QuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!params.success) {
    return apiError(400, "INVALID_PARAMS", params.error.flatten());
  }

  const { country, fromYear = 1990, toYear = 2023 } = params.data;

  const data = await db.emission.findMany({
    where: { country: { code: country }, year: { gte: fromYear, lte: toYear } },
    orderBy: { year: "asc" },
    select: { year: true, totalEmissions: true },
  });

  return apiSuccess(data);
}
```

**Admin-gated routes use the `requireAdmin` helper:**

```tsx
// src/lib/auth.ts
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api/error";

export async function requireAdmin() {
  const session = await auth();
  if (!session) return { error: apiError(401, "UNAUTHENTICATED") };
  if (session.user.role !== "ADMIN") return { error: apiError(403, "FORBIDDEN") };
  return { user: session.user };
}

// Usage in CRUD routes
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  // ... rest of handler
}
```

**Required:**

- Validation schema named `QuerySchema` (for query params) or `BodySchema` (for POST/PATCH bodies), defined at the top
- Always use `safeParse`, return 400 with structured error on failure
- All errors go through `apiError(status, code, details)` from `lib/api/error.ts`
- All success responses go through `apiSuccess(data)`
- Default values applied after parsing, never in the schema
- Every Prisma query uses an explicit `select` clause; never return whole rows
- Route handler bodies stay under 30 lines; longer logic moves to `lib/queries/`
- Async params and searchParams (Next.js 16): always `await` them
- Admin-gated routes use `requireAdmin()`, never inline role checks

---

# 4. Error Handling

```tsx
// src/lib/api/error.ts
import { NextResponse } from "next/server";

export function apiError(status: number, code: string, details?: unknown) {
  if (status >= 500) {
    console.error(JSON.stringify({
      level: "error",
      code,
      status,
      details,
      timestamp: new Date().toISOString(),
    }));
  }
  return NextResponse.json({ error: { code, details } }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
```

**Standard error codes:**

| Status | Code | When |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Zod validation failed |
| 401 | `UNAUTHENTICATED` | No session |
| 403 | `FORBIDDEN` | Wrong role |
| 404 | `NOT_FOUND` | Resource missing |
| 409 | `CONFLICT` | Duplicate or constraint violation |
| 500 | `INTERNAL_ERROR` | Unhandled, logged to Vercel |

Every API response, success or error, has shape `{ data }` or `{ error: { code, details } }`. Never raw values, never stack traces.

---

# 5. Naming Conventions

| Thing | Pattern | Example |
| --- | --- | --- |
| Components | PascalCase, descriptive | `EmissionsTrendChart`, not `Chart1` |
| Files | Match component | `EmissionsTrendChart.tsx` |
| Hooks | `use`  • return value | `useEmissionsTrend`, not `useFetch` |
| API routes | Plural noun | `/api/countries`, not `/api/country` |
| Zod schemas | Purpose suffix | `QuerySchema`, `BodySchema`, `CreateEmissionSchema` |
| Types | PascalCase nouns | `Country`, `EmissionRecord`, `ChartProps` |
| Booleans | `is/has/can` prefix | `isLoading`, `hasData`, `canEdit` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleCountryChange` |
| TanStack Query keys | Array, specific | `["emissions", "trend", countryCode]` |

---

# 6. Tailwind Discipline

```tsx
// ❌ Avoid: magic spacing, hardcoded colors, transition-all
<div className="flex flex-col gap-3 p-5 bg-blue-500 rounded-md shadow hover:shadow-lg transition-all">

// ✅ Required: scale-aligned spacing, theme tokens, named transitions
<div className="flex flex-col gap-4 p-6 bg-primary rounded-lg shadow-sm hover:shadow-md transition-shadow">
```

**Rules:**

- Spacing scale: `gap-2`, `gap-4`, `gap-6`, `gap-8` only. No `gap-3`, no `gap-5`
- Padding: `p-4` for tight elements, `p-6` for cards, `p-8` for sections
- Colors via CSS theme tokens: `bg-primary`, `text-foreground`, `border-border`. Never `bg-blue-500`
- Transitions: name the property. `transition-colors`, `transition-shadow`, `transition-opacity`. Never `transition-all`
- Repeated class strings (used 2+ times) extract to a component, not a const
- Dark mode is automatic via theme tokens, not via `dark:` overrides on every element

---

# 7. State Management

| Concern | Tool |
| --- | --- |
| Server data (API responses) | TanStack Query |
| Form state | react-hook-form + Zod resolver |
| URL state (selected country, year, gas) | `useSearchParams` from Next.js |
| Local UI state (open/closed, hover) | `useState` |
| Cross-component state | Lift to nearest common parent, then context if 3+ levels |

**Rules:**

- Never store server data in `useState`
- Never use Redux, Zustand, or any other store for this scope
- URL is the source of truth for filters (country, year, gas), so refresh and share work correctly

---

# 8. TanStack Query Conventions

```tsx
// src/hooks/useEmissionsTrend.ts
export function useEmissionsTrend({ countryCode, fromYear, toYear }: TrendParams) {
  return useQuery({
    queryKey: ["emissions", "trend", countryCode, fromYear, toYear],
    queryFn: () => fetchEmissionsTrend({ countryCode, fromYear, toYear }),
    enabled: Boolean(countryCode),
    staleTime: 1000 * 60 * 5,
  });
}
```

**Typed fetcher:**

```tsx
// src/lib/api/client.ts
class ApiError extends Error {
  constructor(public status: number, public code: string, public details?: unknown) {
    super(`${status} ${code}`);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error?.code ?? "UNKNOWN", body.error?.details);
  }
  const json = await res.json();
  return json.data as T;
}
```

**Rules:**

- One hook per endpoint, file name matches: `useEmissionsTrend.ts`
- Query keys are arrays starting with the resource: `["emissions", ...]`
- `enabled` flag for queries that depend on user input
- `staleTime` is explicit, not left at default
- `queryFn` calls `apiFetch` from `lib/api/client.ts`, never inline `fetch`

---

# 9. Testing Conventions

```tsx
// src/app/api/emissions/trend/__tests__/route.test.ts
import { describe, it, expect } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

describe("GET /api/emissions/trend", () => {
  it("returns trend data for a valid country", async () => {
    const req = new NextRequest("http://localhost/api/emissions/trend?country=USA");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeInstanceOf(Array);
    expect(json.data[0]).toHaveProperty("year");
    expect(json.data[0]).toHaveProperty("totalEmissions");
  });

  it("returns 400 for missing country param", async () => {
    const req = new NextRequest("http://localhost/api/emissions/trend");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("INVALID_PARAMS");
  });
});
```

**What to test:**

| Layer | Test? | Why |
| --- | --- | --- |
| API route handlers | Yes | Highest leverage, covers validation + DB integration |
| Zod schemas | Implicitly via routes | No need to test in isolation |
| Prisma queries | No | Trust Prisma, test the route that uses it |
| React components | No | Skip for take-home, low ROI per hour |
| Auth.js config | No | Trust the library |
| Utility functions | If they have logic | Custom date formatters yes, `cn()` no |

**Coverage targets:**

- Every API route file gets one test file at `__tests__/route.test.ts`
- Each test file has at least 3 cases: happy path, validation error, edge case
- Tests live next to the file they test, not in a top-level `tests/` folder
- One `describe` block per route file, one `it` per scenario, sentence-form names

**Setup:**

```tsx
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    globals: false,
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

**Reference:**

- Vitest docs: https://vitest.dev
- Next.js testing guide: https://nextjs.org/docs/app/guides/testing/vitest

---

# 10. Logging Conventions

**Rules:**

- Use `console.log` / `console.error` only. Vercel captures stdout/stderr automatically
- Log as JSON, not free-text. Vercel's log search treats JSON as structured fields
- Log only at the boundary: API entry/exit, unhandled errors, auth failures
- Never log full request bodies (PII risk), never log secrets, never log full stack traces in production responses
- Skip Pino, Winston, OpenTelemetry. Mention as a Next Steps item if asked

**Reference:**

- Vercel Logs: https://vercel.com/docs/observability/logs
- Next.js logging: https://nextjs.org/docs/app/guides/logging

---

# 11. Environment Variables

```tsx
// src/lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_GITHUB_ID: z.string(),
  AUTH_GITHUB_SECRET: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = EnvSchema.parse(process.env);
```

**File layout:**

```
.env                      Local dev secrets (gitignored)
.env.example              Template, committed, no real values
.env.test                 Test DB URL, optional
```

**Naming:**

| Prefix | Where exposed | Example |
| --- | --- | --- |
| (none) | Server only | `DATABASE_URL`, `AUTH_SECRET` |
| `NEXT_PUBLIC_` | Browser bundle | `NEXT_PUBLIC_APP_URL` |

**Rules:**

- Validate on app boot via `lib/env.ts`. Boot fails loud if any var is missing
- Never read `process.env.X` directly outside `lib/env.ts`. Always import from `env`
- Never put secrets in `NEXT_PUBLIC_*`. They get bundled into client JS
- `.env.example` is committed with placeholder values. `.env` is gitignored
- Production secrets live in Vercel's environment variables UI

**Reference:**

- Next.js env vars: https://nextjs.org/docs/app/guides/environment-variables
- T3 Env (the inspiration): https://env.t3.gg

---

# 12. Accessibility Conventions

```tsx
// ❌ Inaccessible
<div onClick={handleClick}>Submit</div>
<img src="/chart.png" />

// ✅ Accessible
<Button onClick={handleClick}>Submit</Button>
<img src="/chart.png" alt="Bar chart of emissions by sector for Thailand in 2020" />
```

**Required:**

| Rule | How to enforce |
| --- | --- |
| Use semantic HTML elements | `<button>` for clicks, `<a>` for navigation, `<nav>`, `<main>`, `<article>` for landmarks |
| All interactive elements keyboard-reachable | shadcn primitives handle this; verify Tab key during build |
| All images have `alt` text | Empty `alt=""` for decorative, descriptive `alt` for content |
| Form inputs have associated `<label>` | shadcn `<Form>` does this; check manually if rolling own |
| Color contrast meets WCAG AA (4.5:1 text) | Verify with browser DevTools accessibility panel |
| Charts have text alternatives | Wrap in a region with `aria-label` describing purpose |
| Focus visible | Tailwind `focus-visible:ring-2 focus-visible:ring-ring` on interactive elements |

**Chart accessibility pattern:**

```tsx
<section aria-label="Emissions trend for Thailand from 1990 to 2023" role="img">
  <h2 className="sr-only">Trend chart</h2>
  <EmissionsTrendChart countryCode="THA" />
</section>
```

**Map accessibility pattern:**

- Each country path has `aria-label="{country name}: {emissions value} Mt CO2e"`
- Tooltip content also rendered as a live region for screen readers

**Not enforcing for take-home:**

- Full WCAG AAA compliance
- Manual screen reader testing
- Skip-nav links
- Reduced-motion media queries (mentioned in Next Steps)

**Reference:**

- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg
- Radix UI accessibility: https://www.radix-ui.com/primitives/docs/overview/accessibility
- WebAIM contrast checker: https://webaim.org/resources/contrastchecker

---

# 13. The 35-Minute Polish Pass

Locked tasks for hour 8 of Day 2. Non-optional.

1. **Brand color.** One primary, defined as CSS variable in `globals.css`. Suggested: `oklch(0.55 0.22 145)` (sustainability green)
2. **Typography.** Geist Sans for UI, Geist Mono for numerical data labels (defaults in Next.js 16)
3. **Chart palette.** Brand color + 2 muted shades, defined as CSS variables, applied via shadcn Chart config
4. **Empty states.** Every chart has a dedicated empty state component, not a blank box
5. **Animated counter.** Hero stat uses Motion's `useSpring`, ~10 lines
6. **Animated map transitions.** Time slider tick triggers Motion transitions on country path fills
7. **Subtle gradient.** Hero section uses `bg-gradient-to-br from-primary/5 via-background to-background`

**Motion imports:**

```tsx
import { motion } from "motion/react";              // for React components
import { animate, useSpring } from "motion/react";  // for hooks
```

Note: the React-specific entry point is `motion/react`, not `motion`. The bare `motion` import is for vanilla JS.

**Reference:**

- Motion docs: https://motion.dev
- Motion for React: https://motion.dev/docs/react

---

# 14. File Headers (Top-Level Files Only)

For `lib/db.ts`, `lib/auth.ts`, `proxy.ts`, and similar foundational files, include a short comment explaining purpose and any non-obvious decisions:

```tsx
// src/lib/db.ts
// Prisma client singleton.
// Reuses the connection in dev to avoid exhausting Neon's connection pool
// during HMR. In production, Vercel functions create one client per cold start.
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

Component files do not need headers; the type and component name are self-documenting.

---

# 15. Lint & Type Check

- `npm run lint` runs Next.js defaults
- `npm run typecheck` runs `tsc --noEmit`
- CI runs both on every push
- No custom ESLint rules added; the goal is type safety, not style policing

---

# 16. Seed Script Behavior

The seed script (`prisma/seed.ts`) is **destructive and idempotent**: it truncates `Emission` and `Country` tables before loading. Safe to run repeatedly in dev.

```bash
npm run seed  # safe to re-run
```

No defensive existence checks; just truncate and load. Production will use migrations + manual data ingestion, not this script.

---

# 17. Commit Convention

Conventional Commits, scoped to keep history readable:

```
feat(api): add /api/emissions/trend endpoint
fix(charts): handle null years in line chart
refactor(auth): extract role check into requireAdmin helper
docs: add architecture diagram
test(api): cover invalid country code on trend endpoint
chore: bump prisma to 5.20
```

**Rules:**

- One logical change per commit
- Subject under 72 characters
- Body only when the *why* isn't obvious from the diff

**Reference:**

- Conventional Commits: https://www.conventionalcommits.org

---

# 18. What This Document Is For

These conventions are loaded into the AI assistant's context to ensure consistent code generation across the project. Every story file in the build phase prepends the constraint:

```
Constraints (must follow):
- Read /docs/CONVENTIONS.md before writing any code in this story
- All component, API route, and Tailwind rules in that document are non-negotiable
- If a rule blocks the task, stop and ask before working around it
```

This is what keeps the codebase consistent across stories and prevents drift.
