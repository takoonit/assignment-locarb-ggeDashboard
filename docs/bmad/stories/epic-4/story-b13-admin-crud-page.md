# Story B13 - Admin CRUD Page

**Epic:** 4 - Admin and Delivery  
**Status:** Todo  
**Dependencies:** B7, B8  

## Story

As an admin, I want a protected CRUD page so that I can maintain countries, annual emissions, and sector shares.

## Acceptance Criteria

- `/admin` is protected by `requireAdmin()`.
- Create, edit, and delete flows exist for countries.
- Create, edit, and delete flows exist for annual emissions.
- Create, edit, and delete flows exist for sector shares.
- Destructive actions require confirmation.

## Architecture Context

- Admin UI is separate from public dashboard.
- Mutations invalidate relevant dashboard queries.
