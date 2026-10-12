# Task 103 — Scope: bKash only, couriers deferred

- [x] Implemented

## Goal

Record the current scope decision in the project docs: bKash is the only payment method, and courier integrations are deferred until the store registers with a courier.

## Prerequisites

- None

## Locked rules

- Docs and config only. No code changes
- Do not remove existing bKash code or env vars

## In scope

- AGENTS.md §17 Payments: say bKash is the only supported method for now. Mark Nagad, SSLCOMMERZ and other providers as future work, not current scope
- AGENTS.md §18 Shipping: say courier integrations (Pathao, Steadfast, RedX) are deferred. Shipping stays a flat or estimated charge
- AGENTS.md §46: match the above
- `.env.example`: remove the unused `PAYMENT_API_KEY` (check it's unused with grep first)

## Out of scope

- Building a PaymentProvider or ShippingProvider abstraction
- Any checkout UI change

## Files likely touched

- AGENTS.md
- .env.example

## Acceptance and validation

- AGENTS.md and `.env.example` reflect bKash-only scope
- `grep -rn PAYMENT_API_KEY` finds nothing outside docs
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
