# Story B12 - Gas Filter

**Epic:** 3 - Dashboard  
**Status:** Todo  
**Dependencies:** B9, B10, B11  

## Story

As a dashboard user, I want a single-select gas filter so that trend and map views can switch between supported gases.

## Acceptance Criteria

- Allowed gases are `TOTAL`, `CO2`, `CH4`, `N2O`, `HFC`, `PFC`, and `SF6`.
- Gas state is reflected in URL/query state.
- Trend and map respond to gas changes.
- Sector chart is not affected by gas.

## Architecture Context

- Single-select only.
- Do not introduce multi-select comparison in this story.
