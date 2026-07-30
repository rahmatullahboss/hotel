---
trigger: always_on
---

# ZinuRooms Agent Rules

The canonical repository instructions are in [`../../AGENTS.md`](../../AGENTS.md). Read that file before making any change. This file is intentionally short so that always-on guidance cannot drift from the canonical contract.

## Mandatory startup

1. Read `AGENTS.md`.
2. Read `docs/README.md`.
3. Read `docs/audit/2026-07-30-static-system-audit.md`.
4. Check `docs/execution/03-program-board.md` and claim one workstream.
5. List the paths and shared contracts you will modify before implementation.
6. Preserve all existing dirty or unrecognised work; never reset, clean, discard or overwrite it.

## Current architecture facts

- `apps/web` is the customer web application and hosts customer/mobile/external Route Handlers.
- `apps/partner` is the hotel partner/PMS application.
- `apps/admin` is the platform administration application.
- `apps/mobile-flutter` is the only active mobile application.
- Expo/React Native guidance and `apps/mobile` references are legacy; do not add new Expo code.
- `packages/db` uses Neon PostgreSQL and Drizzle ORM.
- `packages/realtime` is the Cloudflare Worker/Durable Object realtime service.

## Non-negotiable engineering rules

- Use Server Components by default. Route Handlers are valid for mobile APIs, webhooks, cron and external integrations; Server Actions are appropriate for same-application mutations.
- Validate, authenticate and authorise every server boundary. Hotel/tenant scope must be checked server-side.
- The server calculates authoritative room prices, discounts, taxes, commissions, wallet deductions, payment amounts and booking state. Never trust money or role values from clients.
- Payment, booking, wallet and inventory operations must be transactional, idempotent where retried, and protected against concurrency at the database level.
- Required secrets fail closed. No hardcoded production fallback secret and no unauthenticated cron fallback.
- Shared staging/production database changes use committed Drizzle migrations. `db:push` is restricted to disposable local development.
- Do not suppress failing tests, analysis, builds or HTTP checks.
- Use Flutter ARB localisation for all new user-visible mobile text and secure storage for credentials.
- Avoid new large inline-style systems; improve existing styles incrementally without broad unrelated rewrites.
- One agent works in one branch/worktree and one primary workstream. Shared files require coordination.

## Verification and completion

Run the relevant checks in `AGENTS.md` and satisfy `docs/execution/04-definition-of-done.md`. A work item is not `DONE` until tests, documentation, handoff evidence and integration/merge status are recorded on the program board.

Do not duplicate or expand the canonical rules here. Update `AGENTS.md` and linked documents instead.