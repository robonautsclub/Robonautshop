# Task 77d — Split login UIs (admin `/login`, customer `/user/login`)

- [ ] Implemented

## Goal

Provide **separate** login pages for admins and customers. Do not share one
login form for both audiences.

## Routes

| Audience | Path | Methods |
| --- | --- | --- |
| Admin | `/login` | Email + password **only** |
| Customer | `/user/login` | Email + password, Google, Microsoft |
| Customer register | `/register` (keep customer-only) | Customer signup |

## Locked rules

- Store navbar / mobile nav “Sign in” must go to **`/user/login`**, not `/login`
- Admin staff navigate manually to `/login`
- After admin credential login → `/admin` (or admin `callbackUrl`)
- After customer login → `/account` or `callbackUrl` (e.g. `/checkout`)
- **No** Google / Microsoft buttons on `/login`
- Customer `/user/login` may show Google + Microsoft + email/password
- Separate URLs are UX; role checks come in later tasks — still do not expose
  admin OAuth controls on the admin page

## In scope

- This task only
- Move/adapt current store login UI to `/user/login`
- Rebuild `/login` as admin-only email/password (no OAuth, no public signup CTA)
- Wire forms to real Better Auth APIs (no fake success)
- Update links in navbar, mobile nav, account empty states, auth form shell,
  etc.
- Reuse shared field/layout components; do not duplicate form markup needlessly

## Out of scope

- Server-side `/admin` or `/account` guards (78a, 79a)
- Guest cart merge (78b)
- First admin bootstrap script (79b)
- Order persistence

## Steps

1. Inspect current `/login`, `/register`, and auth form components.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- `/login` is admin email/password only
- `/user/login` is the customer sign-in page with social + credentials
- Store “Sign in” links point to `/user/login`
- Lint and typecheck pass
- The report lists completed work, files changed, and next task **78a**
