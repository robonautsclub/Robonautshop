# Task 140 — Product questions and answers

- [ ] Implemented

## Goal

Customers ask questions on product pages; admins answer them.

## Prerequisites

- Task 85

## Locked rules

- Logged-in customers only; rate limited
- Questions are hidden until answered/approved
- Escape all user text (XSS)

## In scope

- `product_questions` table + migration
- Ask form and answered Q&A list on product pages
- Admin list to answer or hide questions

## Out of scope

- Community answers by other customers

## Files likely touched

- lib/db/schema/
- migrations/
- app/(store)/products/[slug]/page.tsx
- app/admin/

## Acceptance and validation

- Answered question shows on the product page
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
