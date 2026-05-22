# BMAD Quick Flow Tech Spec: Assignment Review Fixes

## Problem

The submitted app mostly satisfies the dashboard assignment, but several reviewer-facing gaps remain: the country selector is not truly searchable, documentation evidence is stale or incomplete, the OpenAPI implementation does not match the Zod-generated claim, and the seed pipeline keeps annual rows where every gas field is missing.

## Current Behavior

- Country controls use native selects, so users cannot type to filter countries.
- `TASK.md` on remote `main` and `develop` still marks B13, B15, and B16 as unfinished.
- README documents setup and live links but does not clearly include screenshots and the architecture diagram evidence required by the PRD.
- OpenAPI is valid JSON but manually authored, while docs claim Zod-generated OpenAPI.
- The seed transform preserves missing CSV cells as `null`, but also materializes annual rows where all annual gas values are `null`.

## Desired Behavior

- Country selection is a true searchable combobox/autocomplete while preserving URL state and dashboard behavior.
- README and `TASK.md` accurately reflect completed assignment work and point to reviewer-visible evidence.
- OpenAPI documentation no longer overclaims generation behavior unless the implementation is actually generated from Zod.
- The seed pipeline preserves partial missing values, preserves zeroes, and prunes annual rows only when every annual gas field is `null`.
- Tests document the seed pruning rule so the reason is not ambiguous later.

## Approach

- Replace the reusable dashboard `CountrySelect` native select with MUI `Autocomplete`, keeping the same `value` and `onChange(code)` contract.
- Update focused dashboard tests for searchable country behavior if existing tests cover country selection.
- Align OpenAPI docs with the implementation by changing the claim from "Zod-generated" to "OpenAPI JSON built from the API contract and validated by tests." Do not introduce a generator library this late unless tests reveal the manual schema is invalid.
- Update README to reference existing screenshot/architecture assets and make setup/live/API evidence easy to find.
- Update `TASK.md` and BMAD current status to mark B13/B15/B16 complete if the repo evidence supports that state.
- Add a seed transform helper or filter that drops all-null annual emission records before upsert.
- Add or update `prisma/seed-transform.test.ts` to verify all-null annual rows are pruned while partial-null rows and zero values remain.

## Acceptance Criteria

- [x] Country dropdowns allow typing to filter by country name/code and still update the dashboard URL/state.
- [x] README includes setup, live/API docs links, screenshots or screenshot references, and architecture diagram reference.
- [x] `TASK.md` no longer says B13/B15/B16 are unfinished when the implementation evidence exists.
- [x] OpenAPI docs/ADR wording matches the actual implementation and no longer claims Zod generation without a generator.
- [x] Seed transform does not produce `AnnualEmission` records where `total`, `co2`, `ch4`, `n2o`, `hfc`, `pfc`, and `sf6` are all `null`.
- [x] Seed transform continues to preserve partial `null` values and numeric `0` values.
- [x] Focused tests, typecheck, and build/lint checks run or any blockers are reported.

## Stories

1. Searchable country controls - Replace native select with MUI Autocomplete while preserving dashboard contracts.
2. Reviewer documentation alignment - Update README, `TASK.md`, and OpenAPI wording to match reality.
3. Seed data pruning - Filter all-null annual records and cover the behavior with tests.
4. Verification - Run focused tests plus typecheck/build/lint where practical.

## Out of Scope

- Redesigning the entire Admin page beyond the cleanup already present in the current dirty worktree.
- Rebuilding OpenAPI generation around a new library unless the user explicitly wants that extra risk.
- Changing chart null semantics or connecting missing trend years.
- Editing production data directly; this branch changes the seed behavior, not remote database rows.
- Committing or pushing without a separate explicit request.

## Risks / Open Questions

- Current local workspace already contains uncommitted Admin/docs/presentation changes. These should be kept separate in staging/commit discipline.
- Updating `TASK.md` is documentation truth maintenance, but if the submitted remote is already frozen, it will only help after this branch is merged.
- If the interviewer expects literal Zod-generated OpenAPI, documentation alignment is safer than overclaiming, but it does not satisfy that bonus as strongly as implementing generation.
