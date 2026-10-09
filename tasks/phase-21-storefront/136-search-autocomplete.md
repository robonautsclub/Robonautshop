# Task 136 — Search autocomplete

- [ ] Implemented

## Goal

Show product suggestions while typing in the navbar search.

## Prerequisites

- Task 89

## Locked rules

- Debounce input; small server query returning few fields
- Accessible combobox (keyboard and screen reader)
- Rate limit the suggestion endpoint

## In scope

- Suggestion API returning top ~6 products (name, slug, image, price)
- Dropdown in the navbar search and mobile search

## Out of scope

- Typo tolerance / external search engine

## Files likely touched

- components/layout/navbar.tsx
- components/layout/mobile-nav-sheet.tsx
- lib/catalog/

## Acceptance and validation

- Typing "nano" suggests Arduino Nano; arrow keys and Enter work
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
