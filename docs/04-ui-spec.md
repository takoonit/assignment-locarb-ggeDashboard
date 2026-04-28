**Project:** Greenhouse Gas Emissions Dashboard & API
**Status:** Draft locked for dashboard build

---

# 1. Purpose
This document defines the dashboard UX/UI contract for the build phase.
The dashboard must satisfy the assignment requirements while staying honest to the actual API contracts and seed data.

Core rule:
```plain text
0 means a reported zero value.
null means no reported data.
Never convert null to 0.
```

---

# 2. Dashboard Goal
The dashboard is a filter-driven emissions explorer with three visualisation cards:
1. Emissions trend over time for one selected country
2. Sector breakdown for one selected country and year
3. World map by emissions for one selected year

The UI should be calm, readable, and data-first. Visual polish is welcome, but it must not hide missing or partial data.

---

# 3. Control Model
The dashboard does not use one shared filter bar for every chart.

Reason:
Each visualisation has a different responsibility:
```plain text
Trend chart -> country over time
Sector chart -> country and year breakdown
World map -> global comparison by year
```

Using one shared filter bar would make users think every control affects every card, which is not true.

Instead, controls are scoped to the visualisation that uses them.

## Shared source state
The page may still keep selected values in URL state:
```plain text
country
year
gas
```

But the UI must present these controls near the chart where they are meaningful.

## Country selector
Uses `GET /api/countries`.

Default behaviour:
- show real countries only
- hide aggregate regions unless explicitly included later
- display country name
- store country code in URL/query state

Example display:
```plain text
Thailand
```

Example internal value:
```plain text
THA
```

Used by:
- trend chart
- sector chart

Not used by:
- world map, except optional selected-country highlight

## Year selector
Used by:
- sector chart
- world map

Not used by:
- trend chart

The trend chart shows the full available range instead of one selected year.

## Gas selector
Allowed values:
```plain text
TOTAL
CO2
CH4
N2O
HFC
PFC
SF6
```

Used by:
- trend chart
- world map as a committed bonus

Not used by:
- sector chart

Reason:
Sector data is a sector breakdown, not a gas-by-sector breakdown.

---

# 4. Layout
## Desktop
```plain text
Top bar

Trend chart card
- country selector
- gas selector

Sector chart card
- country selector
- year selector

World map card
- year selector
- gas selector, default TOTAL
```

Desktop card layout:
```plain text
Trend chart | Sector chart
World map full width
```

## Mobile
```plain text
Top bar
Trend chart with its controls
Sector chart with its controls
World map with its controls
```

Rules:
- no horizontal overflow
- controls remain usable on mobile
- chart cards keep their title, subtitle, and state messages visible
- map scales down without breaking the page

---

# 5. Shared Card States
Every visualisation card must support these states:

## Loading
Use a skeleton inside the card.
Do not use a full-page spinner.

## Error
Show an inline error message and retry action.
Example:
```plain text
Failed to load data.
Try again.
```

## Empty
Show a meaningful empty state inside the card.
Do not show a broken chart.

## Partial data
Render available data and make missing data visible.
Do not silently remove missing values.

---

# 6. Trend Line Chart
## Purpose
Shows greenhouse gas emissions over time for one selected country and one selected gas.

## API
```plain text
GET /api/emissions/trend?country=THA&gas=CO2
```

Optional query params:
```plain text
fromYear
toYear
```

The first build can use the default full available range.

## Controls used
```plain text
Country selector
Gas selector
```

## Controls not used
```plain text
Year selector
```

## UI copy
Title:
```plain text
Emissions trend
```

Subtitle example:
```plain text
Thailand · CO2 · Full available range
```

## Chart behaviour
```plain text
number value -> draw point/line
null value -> show gap, not zero
no points -> empty state
1 point -> show one dot
2 points -> show simple line
```

Tooltip example:
```plain text
Thailand
Year: 2020
CO2: 257,000 kt_co2e
```

Null tooltip:
```plain text
Thailand
Year: 2020
CO2: No data
```

Empty state:
```plain text
No emissions trend data available for Thailand.
```

Sparse data note:
```plain text
Only one data point is available for this selection.
```

---

# 7. Sector Bar Chart
## Purpose
Shows the available sector breakdown for one selected country and year.

The assignment wording says emissions by sector, but the seed data and backend contract expose sector values as percentages. The UI must therefore keep the title broad and explain the exact unit in the subtitle and axis.

## API
```plain text
GET /api/emissions/sector?country=THA&year=2014
```

## Controls used
```plain text
Country selector
Year selector
```

## Controls not used
```plain text
Gas selector
```

Reason:
The sector endpoint has no gas parameter. Sector values represent CO2 share of fuel combustion, not gas-specific emissions.

## UI copy
Title:
```plain text
Sector breakdown
```

Subtitle example:
```plain text
Thailand · 2014 · CO2 share of fuel combustion
```

Y-axis:
```plain text
% of fuel combustion CO2 emissions
```

## Sectors
Render these sector keys from the API contract:
```plain text
transport
manufacturing
electricity
buildings
other
```

Display labels:
```plain text
Transport
Manufacturing
Electricity
Buildings
Other
```

## Chart behaviour
```plain text
number value -> draw bar
0 value -> show zero-height bar and tooltip says 0%
null value -> reserve sector slot and tooltip says No data
all null -> show empty state
```

Do not filter sectors using truthy checks.

Bad pattern:
```plain text
filter(Boolean)
```

Tooltip example:
```plain text
Transport
25.4%
```

Null tooltip:
```plain text
Electricity
No data
```

Empty state:
```plain text
No sector breakdown available for Thailand in 2020.
```

If year is beyond the sector data coverage:
```plain text
No sector breakdown available for Thailand in 2020.
Sector data in the seed dataset is only available up to 2014.
```

---

# 8. World Map
## Purpose
Shows emissions by country for one selected year.

Core assignment requirement:
- map highlights countries based on total greenhouse gas emissions

Default behaviour must satisfy the core requirement first:
```plain text
Default gas = TOTAL
```

Committed bonus:
- gas selector can also control the map

When another gas is selected, the map remains the same component but the subtitle must make the selected gas explicit.

## API
```plain text
GET /api/emissions/map?year=2020&gas=TOTAL
```

## Controls used
```plain text
Year selector
Gas selector
```

The year selector is required by the core assignment.
The gas selector is a committed bonus. It must default to `TOTAL` so the first map view clearly satisfies the assignment wording.

## Controls not required
```plain text
Country selector
```

Country selector may optionally highlight the selected country on the map later, but the map itself compares all countries for a selected year.

## UI copy
Title:
```plain text
World emissions map
```

Subtitle examples:
```plain text
2020 · Total GHG emissions
```
```plain text
2020 · CO2 emissions
```

## Map behaviour
```plain text
number value -> colour by scale
null value -> no-data colour
missing map match -> no-data colour
```

Countries with no data must still appear on the map.
They must not be hidden.

Legend must include:
```plain text
Low
High
No data
```

Tooltip example:
```plain text
Thailand
2020 TOTAL: 403,000 kt_co2e
```

Null tooltip:
```plain text
Japan
2020 TOTAL: No data
```

---

# 9. Accessibility
Rules:
- controls have visible labels
- buttons are real buttons
- loading, error, and empty states are readable
- chart cards have clear titles
- map regions have useful aria labels
- colour must not be the only way to understand no-data states

---

# 10. Styling and UX/UI Direction
The assignment requires a visually appealing and intuitive design. For this build, that means the UI must feel polished without adding fake data or misleading interactions.

## Styling approach
Base the dashboard on MUI with a Material Design 3-inspired visual direction.

Rules:
- use MUI components for cards, selects, buttons, skeletons, tooltips, layout primitives, and form controls
- use CSS or MUI theme overrides for spacing, elevation, typography, colour tokens, and component polish
- keep repeated chart card, empty state, error state, and loading state patterns as reusable components
- use subtle polish in spacing, shadows, typography, rounded surfaces, and hover states
- avoid decoration that hides data meaning

## Visual style
Use a premium but restrained dashboard style:
- card-based layout
- soft border
- subtle shadow
- generous spacing
- clear typography hierarchy
- neutral base palette
- one restrained accent colour
- calm chart colours
- readable legends and axis labels

## Layout polish
Rules:
- cards use consistent padding
- chart titles and subtitles are visually separated
- controls sit near the card they affect
- chart area remains stable during loading, error, and empty states
- no horizontal overflow on mobile

Recommended spacing:
```plain text
Page padding: p-4 mobile, p-6 desktop
Card padding: p-4 mobile, p-6 desktop
Card gap: gap-4 mobile, gap-6 desktop
Section gap: gap-6 to gap-8
```

## Typography
Rules:
- page title is the strongest text
- card titles are clear but not oversized
- subtitles explain scope and unit
- muted text is used for helper copy, not core labels

Example hierarchy:
```plain text
Page title: large / semibold
Card title: medium / semibold
Subtitle: small / muted
Axis and legend labels: small / readable
```

## Chart styling
Trend chart:
- clean line
- visible gap for null values
- minimal grid lines
- hover tooltip
- dot visible for sparse data

Sector chart:
- simple bars
- all sector labels visible
- no rainbow palette
- null values represented as no data, not zero

World map:
- sequential scale for values
- neutral grey for no data
- legend must explain no-data colour

## UX/UI practices
The UI must make data meaning clear:
- every chart has title, subtitle, and unit context
- every chart has loading, error, empty, and partial-data states
- every interactive control has a visible label
- tooltips show value and no-data states clearly
- users should know which control affects which card

## Avoid
- fake metrics not backed by API data
- heavy animations
- flashy gradients
- hiding null values for visual neatness
- making gas appear to control sector data
- one global filter bar that implies all controls affect all charts
- chart colours that imply good/bad unless explicitly intended

---

# 11. Acceptance Criteria
This UI spec is ready when:
- controls are scoped to the chart that uses them
- trend chart shows country and gas controls in or near the trend card
- trend chart does not show a year control
- sector chart shows country and year controls in or near the sector card
- sector chart does not show a gas control
- sector chart title is broad but unit is explicit
- map shows year and gas controls in or near the map card
- map defaults to TOTAL so the core assignment requirement is satisfied
- null and zero are visually distinct
- loading, error, empty, partial, and sparse states are defined
- responsive layout is defined
- no UI element requires data that the API does not provide
