# 06 - Tradeoffs & Next Steps

**Project:** Greenhouse Gas Emissions Dashboard & API  
**Status:** Ready for BMAD review  

---

# 1. Purpose

This document explains what is deliberately out of scope for the take-home build, why those choices are reasonable, and how the architecture can support those capabilities later.

The goal is to keep the build focused on the assignment requirements:

- a working greenhouse gas emissions REST API
- an interactive dashboard
- admin CRUD
- GitHub auth
- seed data loaded from the provided CSV
- clear API documentation
- deployable Next.js application

---

# 2. Deliberate Tradeoffs

| Excluded item | Why it is out of scope | Later path |
| --- | --- | --- |
| Redis or server-side cache | The app is a take-home demo with predictable read queries. TanStack Query and normal database indexes are enough for the expected usage. | Add a cache wrapper around service functions or route handlers after measuring slow queries. |
| PDF export | The assignment requires dashboard visualisation, not report generation. PDF export adds layout, pagination, and rendering complexity that does not improve the core API/dashboard proof. | Add a report route or background export job that reuses the existing chart data APIs. |
| Real-time updates | Seeded emissions data is historical and changes through admin CRUD, not live streams. Polling or query invalidation after writes is enough. | Add Server-Sent Events, WebSockets, or a hosted pub/sub service if collaborative editing becomes required. |
| User registration | GitHub OAuth is enough for the role-based access requirement. Open registration would add account lifecycle, email verification, and abuse concerns. | Add a registration flow only if the product needs non-GitHub users. Keep admin promotion manual or move it to an owner-only screen. |
| Multi-tenancy | The assignment is single-dataset and single-organization. Tenant isolation would complicate every query and seed path without proving the requested feature set. | Add `tenantId` to domain tables and enforce tenant scoping in service-layer helpers. |
| Audit logs | Admin CRUD is required, but historical change tracking is not. Adding audit logs would expand schema, UI, and tests beyond the two-day scope. | Add an `AuditLog` table and wrap mutating service calls with a shared audit helper. |
| Rate limiting | The app is a demo with public read endpoints and authenticated writes. Rate limiting is useful in production but not required to prove the assignment. | Add request limiting at the proxy/middleware layer or through a provider such as Upstash after deployment needs are clear. |
| Internationalization | The brief and dashboard are English-only. i18n would add routing, message catalogs, and copy review overhead. | Centralize strings and add `next-intl` or a similar library when a second locale is required. |

---

# 3. Design Principles Behind These Choices

- Prioritize the core assignment over production-adjacent extras.
- Keep the app monolithic but layered so future extraction does not require rewriting business logic.
- Preserve clean boundaries between API routes, validation, services, and persistence.
- Avoid fake polish that hides missing data, null values, or unsupported workflows.
- Document future paths clearly so reviewers can see the system is intentionally scoped, not unfinished by accident.

---

# 4. Immediate Next Steps

These should be completed during the take-home build.

- Implement the Prisma schema and idempotent CSV seed pipeline.
- Build the public read API endpoints and shared response/error helpers.
- Add admin-only write endpoints with `requireAdmin()`.
- Build the dashboard with scoped controls and explicit loading, error, empty, partial, and sparse states.
- Add Swagger-compatible API documentation.
- Update README with setup, env vars, seed instructions, screenshots, API docs, deployment URL, and this tradeoff summary.

---

# 5. Production Hardening Later

These are sensible follow-ups after the assignment is complete.

- Add CI checks for lint, tests, build, and seed validation.
- Add structured server logging around API errors and seed imports.
- Add rate limiting for write endpoints and high-volume public reads.
- Add audit logging for admin create, update, and delete operations.
- Add response caching only after measuring actual endpoint latency.
- Add monitoring for deployment health, failed auth callbacks, API error rates, and database query latency.

---

# 6. Future Product Work

These are product extensions rather than requirements for the take-home.

- Time slider for map and sector year exploration.
- Download chart as PNG.
- Saved dashboard views.
- Compare two countries in the trend chart.
- CSV export for the currently selected API result.
- Richer admin search, sorting, and pagination.
- Multi-tenant organization support.
- Internationalized UI labels and country names.

---

# 7. Acceptance Criteria

This tradeoff document is ready when:

- every intentionally excluded item has a clear reason
- every excluded item has a plausible later implementation path
- next steps are grouped into immediate build work, production hardening, and future product work
- the document does not change the locked PRD, architecture, data model, API contracts, or UI spec
- README and `TASK.md` can reference this page as the reviewer-facing scope boundary
