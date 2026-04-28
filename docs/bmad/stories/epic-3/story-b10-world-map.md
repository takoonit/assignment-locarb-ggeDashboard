# Story B10 - World Map

**Epic:** 3 - Dashboard  
**Status:** Todo  
**Dependencies:** B5, B8  

## Story

As a dashboard user, I want a world map colored by emissions for a selected year and gas so that I can compare countries globally.

## Acceptance Criteria

- Year selector controls map data.
- Gas selector controls map data and defaults to `TOTAL`.
- No-data countries use a distinct color.
- Legend includes low, high, and no data.
- Tooltips distinguish values from no data.

## Architecture Context

- Use react-simple-maps.
- Do not hide countries with no data.
