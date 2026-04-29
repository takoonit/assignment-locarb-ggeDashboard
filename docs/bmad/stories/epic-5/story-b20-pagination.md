# Story B20 - Admin Table Pagination

**Epic:** 5 - Advanced Features
**Status:** Done
**Dependencies:** B13

## Story

As an admin, I want paginated records in the admin CRUD table so that I can navigate large datasets without loading all rows at once.

## Acceptance Criteria

- Admin table displays a configurable number of rows per page (default 20).
- Pagination controls show current page, total pages, and prev/next buttons.
- Page state is reflected in the URL query string (`?page=2`) so links are shareable.
- Server-side pagination: only the current page of records is fetched from the API.
- Row count and total records are displayed (e.g. "1–20 of 342").
- Changing the country or gas filter resets to page 1.

## Architecture Context

- Extend the existing `/api/admin/emissions` route to accept `page` and `pageSize` query params.
- Return `{ data, total, page, pageSize }` envelope from the API.
- Use shadcn `<Pagination>` component on the frontend.
- Client state managed with `useSearchParams` / `useRouter` from Next.js.
