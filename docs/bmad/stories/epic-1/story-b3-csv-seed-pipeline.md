# Story B3 - CSV Seed Pipeline

**Epic:** 1 - Foundation  
**Status:** Todo  
**Dependencies:** B2  

## Story

As a reviewer, I want the provided CSV loaded into the app schema so that the API and dashboard operate on realistic seeded data.

## Acceptance Criteria

- Seed reads the provided CSV.
- Metadata/footer rows are skipped.
- Countries are upserted by code.
- Aggregate regions are marked with `isRegion = true`.
- Annual gas series map to `AnnualEmission`.
- Sector series map to `SectorShare`.
- Missing values remain `null`.
- Seed is idempotent.

## Architecture Context

- Seed owns CSV cleanup and transformation.
- Do not model the raw CSV as the database schema.
