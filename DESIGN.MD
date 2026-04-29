---
version: alpha
name: Lo-Carb
description: Lo-Carb's web system is a precise climate-data dashboard interface built from clean white analytical space, carbon-green product bands, soft environmental surfaces, rounded chart cards, and a clear type split between confident dashboard headlines and compact technical UI text.

colors:
  primary: "#10231f"
  carbon-black: "#050807"
  ink: "#1f2926"
  forest-green: "#0b3d2e"
  dark-teal: "#082f38"
  canvas: "#ffffff"
  soft-earth: "#f0eee7"
  pale-green: "#eef8ef"
  pale-blue: "#eef6fb"
  hairline: "#d8dedb"
  border-light: "#e5ebe8"
  card-border: "#eef2ef"
  muted: "#8a9691"
  slate: "#65746f"
  body-muted: "#596963"
  action-blue: "#2563eb"
  focus-blue: "#3b82f6"
  warning-amber: "#d97706"
  warning-soft: "#fdecc8"
  form-focus: "#14866d"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  error: "#b42318"

typography:
  hero-display:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -2.16px
  product-display:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -1.68px
  section-display:
    fontFamily: Inter
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -1.1px
  section-heading:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.72px
  card-heading:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.24px
  feature-heading:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  body-large:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.26px
  micro:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 22px
  xl: 30px
  pill: 32px
  full: 9999px

spacing:
  xxs: 2px
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: 8px 0
  button-pill-outline:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.xl}"
    padding: 6px 12px
  status-bar:
    backgroundColor: "{colors.carbon-black}"
    textColor: "{colors.on-dark}"
    typography: "{typography.micro}"
    height: 36px
  dashboard-hero-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
  api-console-card:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.sm}"
    padding: 24px
  data-source-strip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
  metric-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: 24px
  dark-insight-band:
    backgroundColor: "{colors.forest-green}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.lg}"
    padding: 80px
  chart-card:
    backgroundColor: "{colors.soft-earth}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 32px
  filter-chip:
    backgroundColor: transparent
    textColor: "{colors.forest-green}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 8px 14px
  data-table:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-large}"
  admin-form-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 32px
  footer-summary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-dark}"
    typography: "{typography.micro}"
---

## Overview

Lo-Carb should feel like a calm analytical instrument rather than a decorative climate site. The interface is built around clean white canvas, grounded carbon-green bands, compact filters, and rounded data cards that make greenhouse-gas information legible across trend charts, sector comparisons, map views, and admin CRUD screens. The product voice is precise, quiet, and trustworthy.

The system must support real dashboard behaviour: missing values, sparse country data, null sector shares, map no-data states, loading states, error states, and responsive chart layouts. Visual polish should come from restraint, hierarchy, and clarity, not from ornamental gradients or heavy effects.

**Key Characteristics:**
- Large, confident dashboard headlines with tight spacing and practical copy.
- White analytical canvases interrupted by deep forest-green or dark-teal insight bands.
- Rounded chart, map, metric, and admin cards with thin borders and minimal shadow.
- Pill CTAs for primary actions, compact outline chips for country, year, and gas filters.
- Clear distinction between available data, partial data, null values, and no data.
- API and admin surfaces that feel technical but still readable.
- Responsive layouts that prioritise filter usability and chart readability on small screens.

## Colors

### Brand & Accent

- **Carbon Black** (`#050807`): Highest-contrast anchor for status bars, severe text, and technical footer surfaces.
- **Near-Black Primary** (`#10231f`): Primary CTA buttons, dark footer, and key dashboard shell elements.
- **Forest Green** (`#0b3d2e`): Main climate identity colour for insight bands, selected filters, and map emphasis.
- **Dark Teal** (`#082f38`): Secondary dark surface for API, admin, and technical panels.
- **Action Blue** (`#2563eb`): Links, export actions, focused data interactions, and secondary navigation emphasis.
- **Warning Amber** (`#d97706`): Partial-data indicators, missing-year markers, and caution states.
- **Soft Warning Amber** (`#fdecc8`): Pale background for non-blocking warnings and sparse-data notes.

### Surface & Background

- **Canvas White** (`#ffffff`): Dominant page background, chart panel surface, forms, and table rows.
- **Soft Earth** (`#f0eee7`): Warm neutral dashboard sections, supporting chart cards, and low-emphasis blocks.
- **Pale Green Wash** (`#eef8ef`): Environmental context panels, positive empty states, and gentle filter surfaces.
- **Pale Blue Wash** (`#eef6fb`): API documentation, export notices, and calm technical callouts.
- **Card Border** (`#eef2ef`): Softest chart-card containment line.

### Text & Rules

- **Ink** (`#1f2926`): Default text on light backgrounds.
- **Muted Slate** (`#8a9691`): Metadata, axis labels, disabled controls, and low-priority helper text.
- **Slate** (`#65746f`): Secondary text, table sublabels, and quiet data labels.
- **Hairline** (`#d8dedb`): Standard section dividers, table rules, and card separators.
- **Border Light** (`#e5ebe8`): Inputs, filter groups, chart containers, and admin forms.

### Semantic

- **Focus Blue** (`#3b82f6`): Keyboard focus ring and accessible focus states.
- **Form Focus Green** (`#14866d`): Focus border for text fields, selects, and admin inputs.
- **Error Red** (`#b42318`): API errors, destructive actions, validation errors, and failed request states.

### Gradient System

Lo-Carb should not use gradients as default UI fills. Gradients may appear only in map legends, heat-scale swatches, or small visual previews where a continuous value range must be communicated. Keep the shell flat; let data density, map colour, and chart structure provide visual richness.

## Typography

### Font Family

- **Display**: `Inter`, falling back to `ui-sans-serif`, `system-ui`, `Arial`, and `sans-serif`.
- **Body/UI**: `Inter`, falling back to `ui-sans-serif`, `system-ui`, `Arial`, and `sans-serif`.
- **Technical labels**: `JetBrains Mono`, falling back to `ui-monospace`, `SFMono-Regular`, `Consolas`, and `monospace`.
- **Icons**: Thin-line interface icons with simple climate/data metaphors only where useful.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---:|---:|---:|---:|---|
| Hero Display | Inter | 72px | 600 | 1.00 | -2.16px | Dashboard landing or overview declaration. |
| Product Display | Inter | 56px | 600 | 1.05 | -1.68px | Major page hero and report headings. |
| Section Display | Inter | 44px | 600 | 1.10 | -1.1px | Dashboard section titles. |
| Section Heading | Inter | 36px | 600 | 1.20 | -0.72px | Main chart groups and admin pages. |
| Card Heading | Inter | 24px | 600 | 1.25 | -0.24px | Chart cards, map card, metric summaries. |
| Feature Heading | Inter | 20px | 600 | 1.30 | 0 | Filters, smaller cards, table groups. |
| Body Large | Inter | 18px | 400 | 1.50 | 0 | Lead copy and empty-state explanations. |
| Body | Inter | 16px | 400 | 1.50 | 0 | Default copy, labels, form help, table text. |
| Button | Inter | 14px | 600 | 1.50 | 0 | Primary buttons and compact actions. |
| Caption | Inter | 14px | 400 | 1.40 | 0 | Axis labels, legends, timestamps, notes. |
| Mono Label | JetBrains Mono | 13px | 500 | 1.40 | 0.26px | API paths, response codes, technical chips. |
| Micro | Inter | 12px | 400 | 1.40 | 0 | Footer, metadata, tiny helper text. |

### Principles

- Use large type to orient the user, then quickly move into compact dashboard copy.
- Avoid decorative display fonts; data interfaces need trust before personality.
- Use `JetBrains Mono` only for API paths, codes, data keys, and technical labels.
- Keep chart titles human-readable: “Emissions trend” is better than “AnnualEmission series”.
- Use captions to explain missing or partial data clearly, not to apologise vaguely.

## Layout

### Spacing System

The system uses an 8px base with practical dashboard increments: `2px`, `6px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `56px`, `64px`, and `80px`.

Large sections need enough breathing room to keep dense data readable. Dashboard internals should be tighter than marketing sections, especially filter rows, chart controls, legends, and table areas.

### Grid & Container

- Global shell uses a simple top navigation with project identity left and admin/API links right.
- Dashboard overview uses a filter bar above a responsive card grid.
- Primary dashboard composition uses one wide trend card, one map card, and one sector card.
- Metric cards can sit above charts when they summarise the selected country/year/gas.
- Admin pages use two-column form/table layouts on desktop and single-column layouts on mobile.
- API documentation pages use full-width examples with compact code blocks and clear endpoint cards.

### Whitespace Philosophy

Lo-Carb uses whitespace to reduce cognitive load. Charts, maps, and filters need clear separation so users can tell what is selected, what is missing, and what has failed. Dense content is acceptable in tables and legends, but never in a way that hides data quality signals.

## Elevation & Depth

Lo-Carb is mostly flat. Depth comes from contrast, rules, rounded cards, selected states, and data colour. Use shadows only as a very subtle separation aid on floating controls or export menus.

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, white or pale surface | Page shell, chart canvas, tables |
| Bordered | 1px `#d8dedb`, `#e5ebe8`, or `#eef2ef` | Chart cards, filter bars, forms, data rows |
| Data Lift | Rounded card over pale surface with strong heading | Map card, trend card, sector card, metric cards |
| Dark Insight Field | Forest green or dark teal full-width band | API confidence, methodology, admin/security sections |

## Shapes

### Radius Scale

| Token | Value | Role |
|---|---:|---|
| `xs` | 4px | Inputs, small badges, table controls, code chips |
| `sm` | 8px | Filter chips, chart containers, compact cards |
| `md` | 16px | Metric groups and grouped dashboard blocks |
| `lg` | 22px | Main dashboard panels and admin form cards |
| `xl` | 30px | Large filter pills and selected overview controls |
| `pill` | 32px | Primary CTA buttons |
| `full` | 9999px | Status dots, legends, and round icon buttons |

### Image Treatment

Lo-Carb should not rely heavily on photography. When imagery appears, it should support climate context, not distract from data. Prefer abstract map previews, chart mockups, CSV/data source illustrations, or subtle earth textures inside rounded cards.

## Components

### **`button-primary`**

Near-black or forest-green pill CTA for the highest-priority action. Used for “View dashboard”, “Save record”, “Apply filters”, and “Export chart”. Keep labels short and verbs explicit.

### **`button-secondary`**

Text-only or minimal action link for lower-priority navigation. Used for “Reset filters”, “Open API docs”, “View source data”, and “Cancel”. Avoid giving secondary actions the same visual weight as primary actions.

### **`button-pill-outline`**

Outlined pill control with transparent fill, 1px border, and compact padding. Used for gas filters, year selectors, country shortcuts, and map legend toggles.

### **`status-bar`**

Compact dark strip for environment, seed-data, or demo-state notices. It can communicate “Seed data loaded”, “Admin mode”, or “API unavailable” without occupying main dashboard space.

### **`dashboard-hero-card`**

Rounded overview card that introduces the dashboard purpose, selected filters, and key explanation. It should never fake analytics; if no country/year is selected, it should guide the next action.

### **`api-console-card`**

Dark technical panel for endpoint examples, request parameters, response shapes, and API status. Use mono labels for paths like `/api/emissions/trend` and keep examples short.

### **`data-source-strip`**

Quiet horizontal strip that explains the dataset source, loaded years, supported gases, and last seed/import time. It should make data boundaries visible without becoming legal text.

### **`metric-card`**

Small summary card for selected emissions totals, year, gas, country, sector count, or missing-data count. Use it to orient users before they inspect charts.

### **`dark-insight-band`**

Deep forest-green or dark-teal section for methodology, API design confidence, data quality explanation, or security/admin notes. Text turns white; supporting cards may use translucent borders.

### **`chart-card`**

Primary data visualisation card for line chart, bar chart, world map, or legend. It must include title, selected filters, loading state, empty state, error state, and export affordance where applicable.

### **`filter-chip`**

Compact selected/unselected control for country, year, gas, or sector context. Active chips use forest-green fill or border emphasis; disabled chips must explain why they cannot be selected.

### **`data-table`**

Rule-separated table for countries, annual emissions, sector shares, and admin records. It should support null display, sortable columns, and explicit empty rows for no result states.

### **`admin-form-card`**

Rounded white panel for create/update/delete flows. Inputs must show validation clearly, destructive actions must use red, and create/update/delete routes must be visually separated from public dashboard browsing.

### **`footer-summary`**

Dark footer block for project summary, API links, source-data note, and repository/documentation links. Keep it compact and technical rather than marketing-heavy.

## Do's and Don'ts

### Do

- Use white canvas as the default analytical surface.
- Use forest green and dark teal for major confidence and methodology sections.
- Keep filters close to the charts they affect.
- Show missing data, null values, and no-data countries explicitly.
- Use one clear primary action per panel.
- Use mono labels for API paths, codes, and schema field names.
- Keep chart cards calm, readable, and responsive.

### Don't

- Do not hide countries with no data on the map.
- Do not convert missing CSV values to zero.
- Do not make every dashboard section look like a marketing card.
- Do not use heavy shadows or saturated decorative gradients.
- Do not overload the dashboard with too many colours unrelated to data meaning.
- Do not use invented metrics just to make the page look full.
- Do not mix public browsing controls with admin destructive actions.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---:|---|
| Small Mobile | <425px | Single-column cards, compact filter stack, reduced headline scale |
| Mobile | 425-640px | Charts stack, map becomes full-width, legends move below charts |
| Large Mobile | 640-768px | Wider one-column dashboard with denser filters |
| Tablet | 768-1024px | Two-column cards begin, filters can sit inline |
| Desktop | 1024-1440px | Full dashboard grid, trend/map/sector composition |
| Large Desktop | 1440-2560px | Wider containers, larger map panel, more generous chart spacing |

### Touch Targets

Primary buttons, filter chips, select controls, and chart export actions should be at least 40px tall where possible. Map regions can be visually small, but touch interaction should favour tooltip alternatives or searchable country selection on mobile.

### Collapsing Strategy

- Nav collapses into compact links or a menu button.
- Filter bar stacks into country, year, and gas rows.
- Trend, sector, and map cards collapse from grid to single column.
- Legends move below charts when horizontal space is limited.
- Data tables become horizontally scrollable only when stacked summaries would lose meaning.
- Admin forms move above record tables on mobile.

## Iteration Guide

1. Start from the dashboard use case: country, year, gas, trend, map, sector, or admin action.
2. Choose one dominant panel and make every other component support that task.
3. Add data quality states before visual polish: loading, empty, partial, null, error, and no-data map colour.
4. Use `chart-card`, `filter-chip`, `metric-card`, and `data-table` before inventing new components.
5. Keep API examples honest and aligned with the app routes.
6. Prefer readable defaults over clever visual effects.

## Known Gaps

- Exact production chart library styling may differ slightly from these tokens.
- Map colour scales require final data-domain tuning after seed import.
- The dashboard may need additional mobile testing for tooltip behaviour on map regions.
- Export-to-image or PDF styling should be checked separately if implemented.
