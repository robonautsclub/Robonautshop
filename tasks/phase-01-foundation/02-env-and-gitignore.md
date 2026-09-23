# Task 02 — Environment and gitignore

- [x] Implemented

## Goal

Add a secret-safe environment template and a typecheck script.

## In scope

- `.env.example` with placeholder values only
- `.gitignore` ignores `.env`, `.env.local`, and `.env*.local`
- `package.json` script: `"typecheck": "tsc --noEmit"`

## Out of scope

- Real secrets, database clients, auth libraries, or payment SDKs
- Wiring any variable into application code

## Placeholders

```text
DATABASE_URL=
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
RESEND_API_KEY=
PAYMENT_API_KEY=
```

## Steps

1. Inspect existing `.gitignore` and `package.json`.
2. Add only the items above. Do not commit secrets.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Stop. Do not start task 03.

## Done when

- `.env.example` exists with empty placeholders
- Local env files are gitignored
- Lint and typecheck pass
