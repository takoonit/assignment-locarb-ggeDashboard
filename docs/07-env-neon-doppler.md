# Environment, Neon, and Doppler Setup

Status: B2.5 setup contract

## Secret Rules

- Do not commit `.env`, `.env.local`, Doppler tokens, Neon URLs, OAuth secrets, or Auth secrets.
- Commit `.env.example` only.
- Store real values in Doppler.
- Do not paste real secret values into docs, issue comments, screenshots, logs, or tests.

## Required Variables

```text
DATABASE_URL
AUTH_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
NEXT_PUBLIC_APP_URL
```

## Neon Setup

1. Open Neon and create a project for this app.
2. Create or select a development branch/database for local development.
3. In the project dashboard, use **Connect** to copy the direct PostgreSQL connection string for the development database.
4. Confirm the URL includes `sslmode=require`.
5. Store that value in Doppler as `DATABASE_URL`.

For B2.5, `DATABASE_URL` should be the direct Neon connection string because Prisma migrations run through `prisma.config.ts`. If a pooled Neon runtime connection is introduced later, document that as a separate architecture decision before changing the Prisma client setup.

## Doppler Setup

Run these commands locally:

```powershell
doppler login
doppler setup
```

Select the Doppler project/config for this app. After setup, run app commands through Doppler:

```powershell
doppler run -- bun run dev
doppler run -- bun run db:validate
doppler run -- bun run db:generate
doppler run -- bun run db:migrate:deploy
```

Do not use `doppler secrets download` to create a committed env file.

## Validation

Use these checks after setting `DATABASE_URL` in Doppler:

```powershell
doppler run -- bun run db:validate
doppler run -- bun run db:generate
doppler run -- bun run db:migrate:deploy
```

To verify Doppler resolves the variable without printing the secret:

```powershell
doppler run -- powershell -NoProfile -Command "if ($env:DATABASE_URL) { 'DATABASE_URL is set' } else { 'DATABASE_URL is missing' }"
```
