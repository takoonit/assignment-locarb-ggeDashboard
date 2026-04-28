**Project:** Greenhouse Gas Emissions Dashboard & API
**Author:** Takoon

---

# 1. Purpose
A full-stack web app that serves greenhouse gas emissions data through a REST API and visualises it through an interactive dashboard.

# 2. Users & Roles
- **Public visitor:** Reads dashboard data, calls GET endpoints
- **Admin:** Authenticated user who can create, update, and delete records

Auth via Auth.js with GitHub provider.

# 3. Functional Requirements

## Must Have

### API
- `GET /api/countries`
- `GET /api/emissions/trend?country=`
- `GET /api/emissions/map?year=`
- `GET /api/emissions/sector?country=&year=`
- `GET /api/emissions/filter?country=&gas=&year=`
- `POST`, `PATCH`, `DELETE` for emissions
- `POST`, `PATCH`, `DELETE` for countries
- OpenAPI / Swagger-compatible documentation at `/api/docs`
- Structured error responses with correct HTTP status codes

### Dashboard
- Line chart of emissions over time for a selected country
- Bar chart by sector for selected country and year
- World map coloured by emissions for a selected year
- Country and year dropdowns
- Tooltips on charts and map
- Mobile responsive
- Handles failed API calls gracefully

### Edge Cases
- Missing years render as gaps in the line chart
- Countries with 1-2 data points render correctly
- Countries with no data show an empty state
- Bar chart handles null or zero sector values
- Map shows a distinct "no data" colour
- Partial API responses still render

## Bonuses
Committed bonus scope:
- Single-select gas filter (TOTAL, CO2, CH4, N2O, HFC, PFC, SF6) for trend/map views and the filter API
- Admin CRUD page
- Auth.js with role-based access
- Search on country dropdown
- Vercel deployment with live URL
- Environment variables for config
- TanStack Query caching

Backlog bonus scope, only after the core build works:
- Time slider for selected year
- Download chart as PNG

## Not Doing
- Redis caching (TanStack Query and Next.js revalidate are enough)
- PDF export
- Real-time updates
- User registration (GitHub OAuth only)

# 4. Non-Functional
- API responses under 500ms for typical queries
- Input validation on every endpoint (Zod)
- Type-safe end to end (Prisma + Zod)
- Accessible: keyboard navigable, colourblind-safe map palette

# 5. Data Source
The app uses the provided greenhouse gas emissions CSV as the initial seed dataset.
The seed script loads the CSV into PostgreSQL and transforms it into the tables used by the API and dashboard.

# 6. Out of Scope
Noted in the README's "Next Steps" section:
- Multi-tenant data isolation
- Audit log for CRUD
- Server-side caching layer
- Rate limiting
- Internationalization

# 7. Definition of Done
- All must-haves implemented
- Committed bonuses implemented
- Deployed at a public URL
- README with screenshots, setup steps, architecture diagram
- Tests pass in CI
