# Task 150 — Server error logging

- [ ] Implemented

## Goal

Make server errors consistently logged with useful context and safe user messages.

## Prerequisites

- None

## Locked rules

- No new monitoring vendor unless the owner asks
- Never log secrets, tokens or full card/phone data
- Users see a safe message

## In scope

- One structured logger helper (JSON to console, visible in Cloudflare logs)
- Use it in API routes, server actions and the bKash callback
- Request ID in logs

## Out of scope

- Alerting and uptime monitoring setup

## Files likely touched

- lib/ (logger)
- lib/api/app.ts
- app/api/

## Acceptance and validation

- A forced error shows a structured log line and a safe message
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
