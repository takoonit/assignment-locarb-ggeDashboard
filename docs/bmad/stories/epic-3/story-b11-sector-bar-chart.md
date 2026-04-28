# Story B11 - Sector Bar Chart

**Epic:** 3 - Dashboard  
**Status:** Todo  
**Dependencies:** B5, B8  

## Story

As a dashboard user, I want a sector breakdown for one country and year so that I can inspect available sector share data.

## Acceptance Criteria

- Country selector controls sector data.
- Year selector controls sector data.
- Null values show as no data.
- Zero values remain visible as real zero.
- All configured sector slots are represented.

## Architecture Context

- Sector chart does not use gas selector.
- Use Recharts and MUI chart card states.
