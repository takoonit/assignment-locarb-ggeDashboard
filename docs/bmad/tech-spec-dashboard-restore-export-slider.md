# BMAD Quick Flow Tech Spec: Dashboard Export and Trend Slider Restoration

## Summary
Restore two dashboard bonus capabilities that were previously implemented and then lost during later merge/conflict churn:

- chart export support
- a time slider for dynamic updates to the line chart as the year changes

This Quick Flow item also tightens the sector chart presentation so it continues to clearly satisfy the core assignment requirement for a bar chart by sector for a selected country and year.

## Scope
In scope:
- restore chart export support and its dependencies
- restore the trend chart time slider
- ensure the slider behaves as a line-chart timeline control, not a dashboard-global year control
- make the trend chart update dynamically as the selected year changes
- keep the sector chart clearly framed as a selected country/year comparison chart
- update focused tests for the restored behavior

Out of scope:
- broader dashboard UX/UI polish
- navbar/layout redesign
- KPI rows or shared filter-bar redesign
- map redesign
- route or API contract changes

## Requirements Alignment
### Bonus: time slider
Assignment wording:
`Provide a time slider for dynamic updates to the line chart as the year changes.`

Implementation interpretation for this branch:
- the slider belongs to the trend line chart
- moving the slider updates the line chart immediately
- the chart reveals the trend progressively up to the selected year
- the slider does not mutate sector-year or map-year controls

This avoids misleading cross-card coupling while still satisfying the bonus requirement in a reviewer-visible way.

### Core dashboard requirement 1b
Assignment wording:
`Display a bar chart comparing greenhouse gas emissions by sector for a selected year and country.`

Backend/data constraint:
- the sector endpoint returns percentage shares, not raw absolute sector emissions

Required presentation behavior:
- keep the chart scoped to the selected country and year
- make the country/year context explicit in chart copy
- compare all returned sectors in a bar chart
- continue to distinguish `0` from `null`

## Implementation Notes
- `src/components/dashboard/trend-chart.tsx`
  - keep the slider embedded in the trend card
  - derive a `visiblePoints` series filtered to `year <= selectedYear`
  - render the line chart from `visiblePoints` so the line changes dynamically as the slider moves
  - keep the selected-year label visible in the trend card
- `src/components/dashboard/dashboard-page.tsx`
  - keep a local `trendYear` state for the trend chart
  - do not reuse sector or map year state for the trend slider
  - do not push slider changes into the URL for this branch
- `src/components/dashboard/sector-chart.tsx`
  - keep the selected country/year context visible
  - retain explicit handling for `0` and `null`
- `src/app/page.test.tsx`
  - verify the trend slider changes the selected year display inside the trend card
  - verify the slider does not update sector/map query params

## Acceptance Criteria
- The trend chart shows a visible time slider.
- Moving the slider updates the line chart dynamically as the year changes.
- The trend slider affects only the line chart state on this branch.
- The sector chart still reads clearly as a bar chart for the selected country and year.
- Sector `0` and `null` values remain visually distinct.
- Focused dashboard tests pass for the restored slider behavior.

## Validation
Focused validation used for this restoration slice:
- `vitest run src/app/page.test.tsx`
- focused `eslint` on touched dashboard files

## Restoration Notes
- This work is restoration, not new scope expansion.
- The export support and slider capability existed previously and were reintroduced after being lost in later branch integration/conflict handling.
