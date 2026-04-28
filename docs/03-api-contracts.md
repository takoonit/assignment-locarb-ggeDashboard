**Project:** Greenhouse Gas Emissions Dashboard & API
**Status:** Draft locked for build

---

# 1. Purpose
This document explains what each API endpoint does, what the frontend sends to it, what the API sends back, and what can go wrong.

The goal is simple:
- the dashboard knows exactly what data it can ask for
- the backend knows exactly what shape to return
- the OpenAPI docs can be written from the same rules
- reviewers can test each endpoint without guessing

---

# 2. Basic API Rules
All successful responses use this shape:

```json
{
  "data": {}
}
```

All error responses use this shape:

```json
{
  "error": {
    "code": "INVALID_PARAMS",
    "details": {}
  }
}
```

Plain rule:
- `data` means the request worked
- `error` means the request failed
- missing values stay `null`
- missing values never become `0`
- public read APIs do not need login
- create, update, and delete APIs need admin access

---

# 3. Common Error Codes
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | The request is missing something or has the wrong value. |
| 401 | `UNAUTHENTICATED` | The user is not logged in. |
| 403 | `FORBIDDEN` | The user is logged in but is not an admin. |
| 404 | `NOT_FOUND` | The requested country or record does not exist. |
| 409 | `CONFLICT` | The record already exists, usually same country and year. |
| 500 | `INTERNAL_ERROR` | Something unexpected failed on the server. |

---

# 4. Shared Values
## Gas filter values
The app uses a single-select gas filter.

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

Plain meaning:
- user chooses one gas at a time
- `TOTAL` means total greenhouse gas emissions
- `CO2`, `CH4`, and `N2O` support the main dashboard requirement
- `HFC`, `PFC`, and `SF6` are supported because the data model already stores them

## Year
Allowed range:
```plain text
1990 to 2030
```

Plain meaning:
- old historical data is supported
- impossible future values are rejected
- this range can be widened later if new seed data needs it

## Country
Country is passed as a 3-letter code.

Example:
```plain text
THA
USA
JPN
```

---

# 5. Public Read APIs
## GET `/api/countries`
### What it does
Returns countries for dropdowns.
By default, it returns real countries only. Aggregate regions are hidden unless requested.

### Query params
| Name | Required | Example | Plain meaning |
| --- | --- | --- | --- |
| `includeRegions` | No | `true` | Include aggregate regions like world or income groups. |

### Example request
```plain text
GET /api/countries
```

### Example response
```json
{
  "data": [
    {
      "code": "THA",
      "name": "Thailand",
      "isRegion": false
    }
  ]
}
```

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | `includeRegions` is invalid. |

---

## GET `/api/emissions/trend`
### What it does
Returns yearly emissions for one country.
Used by the line chart.

### Query params
| Name | Required | Example | Plain meaning |
| --- | --- | --- | --- |
| `country` | Yes | `THA` | Country to show. |
| `gas` | No | `CO2` | Gas to show. Defaults to `TOTAL`. |
| `fromYear` | No | `1990` | First year in the chart. |
| `toYear` | No | `2023` | Last year in the chart. |

Extra rule:
```plain text
fromYear must be less than or equal to toYear
```

### Example request
```plain text
GET /api/emissions/trend?country=THA&gas=CO2&fromYear=2000&toYear=2020
```

### Example response
```json
{
  "data": {
    "country": {
      "code": "THA",
      "name": "Thailand"
    },
    "gas": "CO2",
    "unit": "kt_co2e",
    "points": [
      {
        "year": 2000,
        "value": 184200
      },
      {
        "year": 2001,
        "value": null
      }
    ]
  }
}
```

Plain rule:
- `value: null` means no data reported for that year
- the frontend should show a gap, not zero
- if the country has only 1 or 2 points, the API still returns them normally

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid country, gas, or year range. |
| 404 | `NOT_FOUND` | Country does not exist. |

---

## GET `/api/emissions/map`
### What it does
Returns emissions for all countries in one year.
Used by the world map.

### Query params
| Name | Required | Example | Plain meaning |
| --- | --- | --- | --- |
| `year` | Yes | `2020` | Year to show on the map. |
| `gas` | No | `TOTAL` | Gas to colour the map by. Defaults to `TOTAL`. |
| `includeRegions` | No | `false` | Include aggregate regions if needed. Defaults to `false`. |

### Example request
```plain text
GET /api/emissions/map?year=2020&gas=TOTAL
```

### Example response
```json
{
  "data": {
    "year": 2020,
    "gas": "TOTAL",
    "unit": "kt_co2e",
    "countries": [
      {
        "countryCode": "THA",
        "countryName": "Thailand",
        "value": 403000
      },
      {
        "countryCode": "JPN",
        "countryName": "Japan",
        "value": null
      }
    ]
  }
}
```

Plain rule:
- countries with no value must still be returned
- the map should colour `null` countries as "no data"
- countries should not disappear just because data is missing

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid year, gas, or includeRegions value. |

---

## GET `/api/emissions/sector`
### What it does
Returns sector breakdown for one country and one year.
Used by the bar chart.

### Query params
| Name | Required | Example | Plain meaning |
| --- | --- | --- | --- |
| `country` | Yes | `THA` | Country to show. |
| `year` | Yes | `2020` | Year to show. |

### Example request
```plain text
GET /api/emissions/sector?country=THA&year=2020
```

### Example response
```json
{
  "data": {
    "country": {
      "code": "THA",
      "name": "Thailand"
    },
    "year": 2020,
    "unit": "percent",
    "sectors": {
      "transport": 25.4,
      "manufacturing": 18.2,
      "electricity": null,
      "buildings": 7.1,
      "other": 3.4
    }
  }
}
```

Plain rule:
- `0` means a real zero
- `null` means no reported value
- the bar chart must not break if one sector is `0` or `null`

### If no sector row exists
Return a valid empty breakdown:
```json
{
  "data": {
    "country": {
      "code": "THA",
      "name": "Thailand"
    },
    "year": 2020,
    "unit": "percent",
    "sectors": {
      "transport": null,
      "manufacturing": null,
      "electricity": null,
      "buildings": null,
      "other": null
    }
  }
}
```

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid country or year. |
| 404 | `NOT_FOUND` | Country does not exist. |

---

## GET `/api/emissions/filter`
### What it does
Returns one emissions value that matches one selected country, one selected gas, and one selected year.
This is the single-select filter check endpoint.

Plain example:
```plain text
User selects Thailand, CO2, and 2020.
API returns Thailand's CO2 value for 2020.
```

### Query params
| Name | Required | Example | Plain meaning |
| --- | --- | --- | --- |
| `country` | Yes | `THA` | Country selected by the user. |
| `gas` | Yes | `CO2` | One selected gas. |
| `year` | Yes | `2020` | One selected year. |

### Example request
```plain text
GET /api/emissions/filter?country=THA&gas=CO2&year=2020
```

### Example response
```json
{
  "data": {
    "country": {
      "code": "THA",
      "name": "Thailand"
    },
    "year": 2020,
    "gas": "CO2",
    "unit": "kt_co2e",
    "value": 257000
  }
}
```

Plain rule:
- this endpoint proves filtering works
- it should reuse the same emissions lookup logic as trend and map
- do not build separate duplicate logic just for this endpoint

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid country, gas, or year. |
| 404 | `NOT_FOUND` | Country does not exist. |

---

# 6. Admin APIs
Admin APIs change data. They require login and admin role.

Plain rule:
- public visitors can read data
- admins can create, update, and delete data

---

## POST `/api/countries`
### What it does
Creates a new country.

### Body
```json
{
  "code": "THA",
  "name": "Thailand",
  "isRegion": false
}
```

### Response
```json
{
  "data": {
    "id": "country_id",
    "code": "THA",
    "name": "Thailand",
    "isRegion": false
  }
}
```

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid body. |
| 401 | `UNAUTHENTICATED` | Not logged in. |
| 403 | `FORBIDDEN` | Not admin. |
| 409 | `CONFLICT` | Country code already exists. |

---

## PATCH `/api/countries/{id}`
### What it does
Updates a country.

### Body
```json
{
  "name": "Thailand",
  "isRegion": false
}
```

### Response
```json
{
  "data": {
    "id": "country_id",
    "code": "THA",
    "name": "Thailand",
    "isRegion": false
  }
}
```

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid id or body. |
| 401 | `UNAUTHENTICATED` | Not logged in. |
| 403 | `FORBIDDEN` | Not admin. |
| 404 | `NOT_FOUND` | Country does not exist. |
| 409 | `CONFLICT` | New country code already exists. |

---

## DELETE `/api/countries/{id}`
### What it does
Deletes a country.
Related annual emissions and sector shares are deleted by cascade.

### Response
```json
{
  "data": {
    "deleted": true,
    "id": "country_id"
  }
}
```

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 401 | `UNAUTHENTICATED` | Not logged in. |
| 403 | `FORBIDDEN` | Not admin. |
| 404 | `NOT_FOUND` | Country does not exist. |

---

## POST `/api/emissions`
### What it does
Creates one yearly emissions record for one country.

Plain rule:
```plain text
One country can have only one annual emissions record per year.
```

### Body
```json
{
  "countryCode": "THA",
  "year": 2020,
  "total": 403000,
  "co2": 257000,
  "ch4": null,
  "n2o": null,
  "hfc": null,
  "pfc": null,
  "sf6": null
}
```

### Response
```json
{
  "data": {
    "id": "annual_emission_id",
    "countryCode": "THA",
    "year": 2020,
    "total": 403000,
    "co2": 257000,
    "ch4": null,
    "n2o": null,
    "hfc": null,
    "pfc": null,
    "sf6": null
  }
}
```

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid body. |
| 401 | `UNAUTHENTICATED` | Not logged in. |
| 403 | `FORBIDDEN` | Not admin. |
| 404 | `NOT_FOUND` | Country code does not exist. |
| 409 | `CONFLICT` | This country already has a record for this year. |

---

## PATCH `/api/emissions/{id}`
### What it does
Updates one yearly emissions record.

Plain rule:
- values can be changed
- year can be changed if it does not create a duplicate
- country is not changed here

### Body
```json
{
  "year": 2020,
  "total": 403000,
  "co2": 257000,
  "ch4": null,
  "n2o": null
}
```

### Response
Same shape as `POST /api/emissions`.

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid id or body. |
| 401 | `UNAUTHENTICATED` | Not logged in. |
| 403 | `FORBIDDEN` | Not admin. |
| 404 | `NOT_FOUND` | Emissions record does not exist. |
| 409 | `CONFLICT` | Updated year would create a duplicate. |

---

## DELETE `/api/emissions/{id}`
### What it does
Deletes one yearly emissions record.

### Response
```json
{
  "data": {
    "deleted": true,
    "id": "annual_emission_id"
  }
}
```

---

## POST `/api/sector-shares`
### What it does
Creates one sector breakdown record for one country and year.

Plain rule:
```plain text
One country can have only one sector breakdown per year.
```

### Body
```json
{
  "countryCode": "THA",
  "year": 2020,
  "transport": 25.4,
  "manufacturing": 18.2,
  "electricity": null,
  "buildings": 7.1,
  "other": 3.4
}
```

### Response
```json
{
  "data": {
    "id": "sector_share_id",
    "countryCode": "THA",
    "year": 2020,
    "transport": 25.4,
    "manufacturing": 18.2,
    "electricity": null,
    "buildings": 7.1,
    "other": 3.4
  }
}
```

### Possible errors
| Status | Code | Plain meaning |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | Invalid body. |
| 401 | `UNAUTHENTICATED` | Not logged in. |
| 403 | `FORBIDDEN` | Not admin. |
| 404 | `NOT_FOUND` | Country code does not exist. |
| 409 | `CONFLICT` | This country already has sector data for this year. |

---

## PATCH `/api/sector-shares/{id}`
### What it does
Updates one sector breakdown record.

### Body
```json
{
  "transport": 25.4,
  "manufacturing": 18.2,
  "electricity": null,
  "buildings": 7.1,
  "other": 3.4
}
```

### Response
Same shape as `POST /api/sector-shares`.

---

## DELETE `/api/sector-shares/{id}`
### What it does
Deletes one sector breakdown record.

### Response
```json
{
  "data": {
    "deleted": true,
    "id": "sector_share_id"
  }
}
```

---

# 7. Documentation APIs
## GET `/api/openapi`
Returns the raw OpenAPI JSON document.

Plain meaning:
- machines and tools can read this
- Scalar uses this document to render the API docs

## GET `/api/docs`
Shows interactive API documentation.

Plain meaning:
- humans can read and test the API here
- this satisfies Swagger-style documentation requirement

---

# 8. Implementation Notes
Keep route handlers thin.

Good pattern:
```plain text
route validates input
route calls service
service reads or writes database
route returns data
```

Avoid this:
```plain text
route contains big Prisma query
route maps gas fields manually
route has duplicated logic from another route
```

Shared service logic needed:
- map selected gas to the right database field
- find country by country code
- preserve null values
- handle missing rows safely
- format response for charts and map

---

# 9. Route Tree Needed
```plain text
src/app/api/countries/route.ts
src/app/api/countries/[id]/route.ts
src/app/api/emissions/route.ts
src/app/api/emissions/[id]/route.ts
src/app/api/emissions/trend/route.ts
src/app/api/emissions/map/route.ts
src/app/api/emissions/sector/route.ts
src/app/api/emissions/filter/route.ts
src/app/api/sector-shares/route.ts
src/app/api/sector-shares/[id]/route.ts
src/app/api/openapi/route.ts
src/app/api/docs/route.ts
```

Plain warning:
The route tree must include both collection routes and id routes.

Example:
- `/api/emissions` creates a record
- `/api/emissions/{id}` updates or deletes a record

---

# 10. Acceptance Criteria
This API contract is ready when:
- all required assignment endpoints are covered
- read endpoints explain params and response shape
- admin endpoints explain body, response shape, and auth requirement
- `/api/emissions/filter` is clearly treated as the single-select filter check endpoint
- error codes are consistent
- `null` handling is explicit
- OpenAPI can be written from this document
- implementation can build Zod schemas from this document
