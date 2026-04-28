# Story B9 - Trend Line Chart

**Epic:** 3 - Dashboard  
**Status:** Todo  
**Dependencies:** B5, B8  

## Story

As a dashboard user, I want to see emissions over time for one country and gas so that I can understand the selected country's trend.

## Acceptance Criteria

- Country selector controls trend data.
- Gas selector controls trend data.
- Missing years render as gaps, not zeros.
- One or two data points render safely.
- Loading, error, empty, and sparse states are visible.

## Architecture Context

- Fetch through TanStack Query.
- Render with Recharts.
