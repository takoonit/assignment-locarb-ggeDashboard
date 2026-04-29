# Story B2.5 - Environment, Neon, and Doppler Setup

**Epic:** 1 - Foundation
**Status:** Done
**Dependencies:** B2

## Story

As a developer, I want secrets and database environments managed through Doppler and Neon so that Prisma, seed scripts, auth, local development, and deployment use the same explicit configuration contract without committing secrets.

## Acceptance Criteria

- `.env.example` documents every required variable with safe placeholder values only.
- Real `.env`, `.env.local`, Neon URLs, Doppler tokens, OAuth secrets, and Auth secrets are never committed.
- Doppler CLI setup is documented for this repo using project/config names, not hardcoded secret values.
- Local commands can run through Doppler, for example `doppler run -- bun run dev`.
- Prisma commands can run through Doppler, for example `doppler run -- bunx --bun prisma migrate deploy`.
- Neon setup is documented, including which branch/database is for development and which is for production.
- `DATABASE_URL` usage is explicit for Prisma 7 and points to the connection string used by Prisma CLI and app runtime.
- If a pooled Neon connection is introduced later, the direct-vs-pooled choice is documented before code changes.
- `prisma migrate deploy` succeeds against the configured Neon development database.

## Architecture Context

- Prisma 7 reads the migration datasource from `prisma.config.ts`, not from `schema.prisma`.
- Doppler injects secrets as environment variables at process runtime.
- Keep secret access server-side. Only variables intentionally safe for browser exposure may use `NEXT_PUBLIC_`.
- Do not add real secret values to Markdown, code, git history, screenshots, logs, or test output.
- Do not proceed to seed/auth/API stories until the runtime secret contract is documented and validated.

## Implementation Notes

- Add `.env.example` only; do not create or commit a real `.env`.
- Add Doppler-oriented scripts only if they do not require committed secret values.
- Use the user's Doppler workplace/project selected in the dashboard, but document commands generically enough to avoid exposing private IDs.
- Prefer `doppler setup` for local developer binding, then `doppler run -- <command>` for commands.
- For automation/deployment, use a scoped Doppler service token stored in the deployment platform, never in this repo.
- Validate Neon with a development branch/database before production.

## Validation

- Confirm `git status` does not show staged secret files.
- Run `doppler run -- printenv DATABASE_URL` locally and verify it resolves without printing it into committed docs.
- Run `doppler run -- bunx --bun prisma validate`.
- Run `doppler run -- bunx --bun prisma generate`.
- Run `doppler run -- bunx --bun prisma migrate deploy` against the Neon development database.
