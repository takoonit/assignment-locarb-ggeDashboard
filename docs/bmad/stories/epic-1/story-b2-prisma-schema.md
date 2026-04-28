# Story B2 - Prisma Schema

**Epic:** 1 - Foundation  
**Status:** Next
**Dependencies:** A5, B1  

## Story

As a developer, I want the Prisma schema to match the locked data model so that API and seed work can rely on stable typed entities.

## Acceptance Criteria

- Prisma schema defines `Country`, `AnnualEmission`, `SectorShare`, and `User`.
- Relationships, uniqueness rules, indexes, and role enum match `docs/02-data-model.md`.
- Migration runs cleanly against the configured database.
- Prisma client generation succeeds.

## Architecture Context

- PostgreSQL provider.
- Data model is app-oriented, not raw CSV-oriented.
- Deleting a country cascades associated annual emissions and sector shares.
