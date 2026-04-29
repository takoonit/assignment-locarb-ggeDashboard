# Story B16 - Deploy + Smoke Test

**Epic:** 6 - Delivery  
**Status:** Todo  
**Dependencies:** B15  

## Story

As a reviewer, I want a public deployed URL so that I can evaluate the completed dashboard and API without local setup.

## Acceptance Criteria

- Vercel deployment succeeds.
- Production env vars are configured.
- Dashboard loads at the live URL.
- Public APIs return expected data.
- API docs load.
- Auth and admin paths are smoke tested.

## Architecture Context

- Vercel is the deployment target.
- Neon is the production database target.
