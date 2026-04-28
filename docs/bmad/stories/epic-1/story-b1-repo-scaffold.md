# Story B1 - Repo Scaffold

**Epic:** 1 - Foundation  
**Status:** Done
**Dependencies:** A1-A7  

## Story

As a reviewer, I want the repository scaffolded with the approved stack and app foundation so that later stories can build database, API, auth, and dashboard features consistently.

## Acceptance Criteria

- Next.js 16 + TypeScript project remains buildable.
- Relevant Next.js 16 docs in `node_modules/next/dist/docs/` are reviewed before code changes.
- Required project dependencies are installed for MUI, Prisma, Zod, TanStack Query, Recharts, react-simple-maps, Auth.js, OpenAPI docs, and testing.
- MUI theme foundation exists and reflects the Lo-Carb design direction.
- Starter metadata/page content is replaced with a Lo-Carb app foundation.
- Basic scripts still work.

## Architecture Context

- Use MUI as the primary UI layer.
- Keep the app monolithic in Next.js.
- Do not implement API endpoints, Prisma models, seed logic, auth flows, or chart behavior in this story.
- Do not add shadcn or Redux/Zustand.

## Implementation Notes

- Read `AGENTS.md` and the relevant Next.js 16 local docs first.
- Check the existing package manager state before installing dependencies.
- Respect Git Flow: do not commit directly to `develop` or `main`.
- Keep this story focused on scaffold/foundation only.

## Validation

- Run the available lint/build/type checks after changes.
- Confirm no unrelated docs or task statuses are changed except moving B1 from `Next` to `Done` and B2 to `Next` after successful completion.
