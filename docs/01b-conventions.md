Constraint document for the build phase. Use this as the coding contract for BMAD or any AI-assisted implementation.

---

# 1. File Structure
```plain text
src/
├── app/
│   ├── (dashboard)/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── countries/
│   │   │   └── route.ts
│   │   ├── emissions/
│   │   │   ├── trend/route.ts
│   │   │   ├── map/route.ts
│   │   │   ├── sector/route.ts
│   │   │   ├── filter/route.ts
│   │   │   └── [id]/route.ts
│   │   ├── sector-shares/
│   │   │   └── [id]/route.ts
│   │   └── docs/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── charts/
│   ├── controls/
│   ├── admin/
│   └── layout/
├── hooks/
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── error.ts
│   │   └── response.ts
│   ├── auth/
│   │   ├── config.ts
│   │   └── require-admin.ts
│   ├── schemas/
│   ├── services/
│   ├── db.ts
│   ├── env.ts
│   └── utils.ts
├── types/
│   └── domain.ts
└── proxy.ts

prisma/
├── schema.prisma
└── seed.ts
```

Rules:
- Route handlers stay thin.
- Business logic lives in `lib/services`.
- Validation schemas live in `lib/schemas`.
- Prisma access should stay inside services or small query helpers.
- One component per file.
- File name should match the component name.
- `/admin` is a top-level route and has its own layout.

---

# 2. Data Model Names
Use the names from `02 — Data Model`.

```plain text
Country
AnnualEmission
SectorShare
User
```

Do not use old model names:

```plain text
Indicator
EmissionRecord
Emission
totalEmissions
```

Exception: API path names may still use `/api/emissions/*` because they are public endpoint names.

---

# 3. Component Conventions
```ts
// Avoid
export default function Chart({ data }: any) {
  return null;
}

// Required
type EmissionsTrendChartProps = {
  countryCode: string;
  gas?: "TOTAL" | "CO2" | "CH4" | "N2O" | "HFC" | "PFC" | "SF6";
  fromYear?: number;
  toYear?: number;
};

export function EmissionsTrendChart({
  countryCode,
  gas = "TOTAL",
  fromYear = 1990,
  toYear = 2023,
}: EmissionsTrendChartProps) {
  const { data, isLoading, error } = useEmissionsTrend({
    countryCode,
    gas,
    fromYear,
    toYear,
  });

  if (isLoading) return <ChartSkeleton />;
  if (error) return <ChartError error={error} />;
  if (!data?.length) return <ChartEmptyState />;

  return null;
}
```

Rules:
- Named exports only.
- No `any` for props.
- Props use a named `Props` type.
- Loading, error, and empty states come before the happy path.
- Chart components must handle null values.
- Recharts components should be wrapped in the shared chart styling layer.

---

# 4. API Route Conventions
Example read route:

```ts
// src/app/api/emissions/trend/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getEmissionsTrend } from "@/lib/services/emissions";

const QuerySchema = z.object({
  country: z.string().length(3),
  gas: z.enum(["TOTAL", "CO2", "CH4", "N2O", "HFC", "PFC", "SF6"]).default("TOTAL"),
  fromYear: z.coerce.number().int().min(1990).max(2030).optional(),
  toYear: z.coerce.number().int().min(1990).max(2030).optional(),
});

export async function GET(req: NextRequest) {
  const params = QuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );

  if (!params.success) {
    return apiError(400, "INVALID_PARAMS", params.error.flatten());
  }

  const data = await getEmissionsTrend(params.data);

  return apiSuccess(data);
}
```

Rules:
- Use `QuerySchema` for query params.
- Use `BodySchema` for request bodies.
- Use `safeParse`.
- Return `400 INVALID_PARAMS` for validation errors.
- Do not put large Prisma queries directly in route handlers.
- Every Prisma query uses `select`.
- Success responses use `apiSuccess(data)`.
- Error responses use `apiError(status, code, details)`.
- Mutating routes call `requireAdmin()` first.

---

# 5. API Response Shape
Success:
```ts
{ data: T }
```

Error:
```ts
{
  error: {
    code: string;
    details?: unknown;
  }
}
```

Standard error codes:

| Status | Code | When |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Zod validation failed |
| 401 | `UNAUTHENTICATED` | No session |
| 403 | `FORBIDDEN` | User is not admin |
| 404 | `NOT_FOUND` | Resource missing |
| 409 | `CONFLICT` | Duplicate country-year record |
| 500 | `INTERNAL_ERROR` | Unexpected error |

Never return raw Prisma records directly.

---

# 6. Auth Convention
```ts
// src/lib/auth/require-admin.ts
import { auth } from "@/lib/auth/config";
import { ApiError } from "@/lib/api/error";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new ApiError(401, "UNAUTHENTICATED");
  }

  if (session.user.role !== "ADMIN") {
    throw new ApiError(403, "FORBIDDEN");
  }

  return session;
}
```

Rules:
- Public GET routes do not require auth.
- Create, update, and delete routes require admin.
- Admin pages live under `/admin`.
- `/admin/layout.tsx` calls `requireAdmin()`.

---

# 7. Service Layer Convention
Service functions hide database shape from route handlers.

```ts
export async function getEmissionsTrend(params: TrendParams) {
  const gasField = mapGasToAnnualEmissionField(params.gas);

  return db.annualEmission.findMany({
    where: {
      country: { code: params.country },
      year: {
        gte: params.fromYear ?? 1990,
        lte: params.toYear ?? 2023,
      },
    },
    orderBy: { year: "asc" },
    select: {
      year: true,
      [gasField]: true,
    },
  });
}
```

Rules:
- Route handlers call services.
- Services call Prisma.
- Services map gas keys to `AnnualEmission` fields.
- Services map sector rows from `SectorShare` into chart-friendly response shapes.
- Services preserve `null` values.

---

# 8. State Management

| Concern | Tool |
| --- | --- |
| API/server data | TanStack Query |
| Form state | react-hook-form + Zod resolver |
| URL filters | `useSearchParams` |
| Local UI state | `useState` |

Rules:
- Do not store API responses in `useState`.
- URL is the source of truth for `country`, `year`, and `gas`.
- Do not add Redux or Zustand for this scope.

---

# 9. TanStack Query Convention
```ts
export function useEmissionsTrend(params: TrendParams) {
  return useQuery({
    queryKey: ["emissions", "trend", params],
    queryFn: () => fetchEmissionsTrend(params),
    enabled: Boolean(params.countryCode),
    staleTime: 1000 * 60 * 5,
  });
}
```

Rules:
- One hook per endpoint.
- Query keys are arrays.
- Include filters in the query key.
- Use `enabled` for dependent queries.
- Fetchers use `apiFetch`.

---

# 10. Seed Script Convention
The seed script reads the provided CSV and transforms it into app tables.

Target tables:
```plain text
Country
AnnualEmission
SectorShare
```

Rules:
- Skip footer and metadata rows.
- Upsert countries by country code.
- Mark aggregate regions with `isRegion = true`.
- Map total/gas series into `AnnualEmission`.
- Map sector percentage series into `SectorShare`.
- Preserve missing values as `null`.
- Do not coerce missing values to `0`.
- Seed must be idempotent.

---

# 11. Testing Conventions
Focus tests on API behaviour.

Minimum route test cases:
- happy path
- validation error
- missing data / null data case

Example:
```ts
describe("GET /api/emissions/trend", () => {
  it("returns trend data for a valid country", async () => {
    const req = new NextRequest(
      "http://localhost/api/emissions/trend?country=THA&gas=CO2",
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data[0]).toHaveProperty("year");
    expect(json.data[0]).toHaveProperty("value");
  });
});
```

Test priority:

| Layer | Test? |
| --- | --- |
| API route handlers | Yes |
| Seed mapping helpers | Yes |
| Zod schemas | Through route tests |
| Prisma itself | No |
| React components | Only if time allows |

---

# 12. MUI Styling Discipline
Rules:
- Use MUI components for cards, selects, buttons, skeletons, tooltips, and layout primitives.
- Use the MUI theme for colours, typography, spacing, radius, and elevation.
- Prefer theme tokens over hardcoded colours.
- Repeated UI patterns become reusable components.
- Chart cards share one wrapper pattern for title, subtitle, controls, loading, error, empty, and content states.
- Use subtle elevation and hover states, not flashy animation.
- Do not use one global filter bar that implies every control affects every chart.
- Do not use chart colours that hide null or no-data states.

Recommended spacing:
```plain text
Page padding: 2 on mobile, 3 on desktop
Card padding: 2 on mobile, 3 on desktop
Card gap: 2 on mobile, 3 on desktop
Section gap: 3 to 4
```

Recommended components:
```plain text
Card / CardHeader / CardContent
FormControl / InputLabel / Select
Button / IconButton
Skeleton
Tooltip
Alert
Box / Stack / Grid
```

---

# 13. Accessibility Rules
Rules:
- Use semantic HTML.
- Buttons must be real buttons.
- Inputs must have labels.
- Charts need accessible labels or text alternatives.
- Map countries need useful `aria-label` values.
- Loading, error, and empty states must be visible and readable.

---

# 14. Environment Variables
```ts
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_GITHUB_ID: z.string(),
  AUTH_GITHUB_SECRET: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});
```

Rules:
- Read env vars through `lib/env.ts`.
- Do not read `process.env.X` across the app.
- Do not expose secrets with `NEXT_PUBLIC_`.
- Commit `.env.example`.
- Do not commit real `.env` files.

---

# 15. Logging
Rules:
- Use `console.log` and `console.error` only.
- Log structured JSON for server errors.
- Do not log secrets.
- Do not log full request bodies.
- Do not return stack traces in API responses.

---

# 16. Commit Convention
Use Conventional Commits.

```plain text
feat(api): add emissions trend endpoint
fix(seed): preserve null values from csv
refactor(auth): extract requireAdmin helper
docs: update data model
```

Rules:
- One logical change per commit.
- Subject under 72 characters.
- Body only when the reason is not obvious.

---

# 17. What This Document Is For
This document keeps generated code consistent.
Every build story should include this constraint:

```plain text
Read docs/CONVENTIONS.md before writing code.
Follow the file structure, API response shape, data model names, MUI styling rules, and service-layer rules.
If a rule conflicts with the task, stop and ask before changing the rule.
```
