# BMAD Quick Flow Tech Spec: Admin UI Cleanup

## Context

The protected `/admin` page already supports CRUD for countries, annual emissions, and sector shares, but the current presentation is visually crowded and does not fully match the Lo-Carb design brief for a precise, quiet, trustworthy admin surface.

The cleanup should preserve the existing route, authorization boundary, API endpoints, TanStack Query behavior, and modal CRUD flows while making the page easier to scan during review.

## Scope

- Keep `/admin` as a single protected route with tabbed record sections.
- Improve the page header, section framing, table density, row actions, empty/loading/error states, and responsive table behavior.
- Keep create/edit/delete dialogs and mutation behavior intact.
- Avoid introducing new routes, new data fetching behavior, or unrelated dashboard changes.

## Design Direction

- Use the existing Lo-Carb tokens from `src/theme.ts`.
- Treat admin tables as technical data surfaces, not marketing cards.
- Separate admin destructive actions visually from public dashboard browsing.
- Show null values explicitly as missing data, while keeping zero values distinct.
- Maintain compact controls near the data they affect.

## Implementation Notes

- The main code surface is `src/components/admin/admin-page-client.tsx`.
- Tests should continue to exercise tab rendering, CRUD create/edit/delete paths, mutation errors, and null/zero handling.
- If visual affordances add accessible text, update tests around those labels without weakening CRUD assertions.

## Verification

- Run focused Admin component tests.
- Run lint or typecheck when available.
- Run a build if the dependency installation and local environment allow it.
- Inspect the rendered Admin route where authentication/environment constraints allow.
