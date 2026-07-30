# ZinuRooms — Canonical Agent Contract

This file is the highest-priority repository instruction for every human or AI agent.

## 1. Instruction precedence

Read and follow, in order:

1. `AGENTS.md`
2. `docs/README.md`
3. the relevant architecture, execution, quality, and operations documents
4. the workstream/issue/PR assigned to the agent
5. local notes under `.agent/`

If lower-level guidance conflicts with this file, this file wins. Never invent missing requirements; record an assumption or blocker in the handoff.

## 2. Product and repository boundaries

ZinuRooms is a hotel booking and property-operations platform.

| Area | Path | Responsibility |
|---|---|---|
| Customer web and public/mobile API | `apps/web` | Search, hotel/room details, authentication, booking, payments, customer profile |
| Hotel partner/PMS | `apps/partner` | Hotel onboarding, inventory, reservations, front desk, staff, housekeeping, revenue and reports |
| Platform administration | `apps/admin` | Hotel approval, users, commissions, payouts, promotions, moderation, support and platform analytics |
| Customer mobile app | `apps/mobile-flutter` | Flutter Android/iOS client; this is the only active mobile implementation |
| Shared database | `packages/db` | Neon PostgreSQL client, Drizzle schema and migrations |
| Shared domain/API code | `packages/api` | Reusable server-side contracts and domain services where applicable |
| Realtime service | `packages/realtime` | Cloudflare Worker/Durable Object WebSocket service |
| Shared UI/config | `packages/ui`, `packages/*config*` | Shared components and build/lint/type configuration |

`apps/mobile`/Expo guidance is legacy. Do not add new Expo code.

## 3. Mandatory startup checklist

Before changing code:

1. Inspect the current branch, latest commit and uncommitted state. Never reset, discard or overwrite work you did not create.
2. Read `docs/audit/2026-07-30-static-system-audit.md` and the current `docs/execution/03-program-board.md`.
3. Claim exactly one workstream and list the paths you intend to modify.
4. Identify shared contracts touched: database schema, API payloads, auth, money, booking state, realtime events, localisation or environment variables.
5. Search for existing implementations before creating new abstractions.
6. Define verification commands before implementation.

## 4. Multi-agent isolation and ownership

- One agent = one branch/worktree = one primary workstream.
- Branch format: `work/<workstream-id>-<short-name>`.
- Do not edit files owned by another active workstream unless the board explicitly lists shared ownership.
- Shared files (`package.json`, lockfiles, schema exports, root configs, shared UI, localisation files) require a coordination note in the program board before modification.
- Never import unmerged implementation from another branch. Use agreed interfaces, fixtures or simulators.
- Keep commits small and coherent. Do not mix documentation cleanup, refactoring and feature behaviour in one commit.

## 5. Architectural rules

### Next.js applications

- Server Components are the default. Use Client Components only for browser state or interaction.
- Server Actions are appropriate for same-application form mutations. Route Handlers are appropriate for mobile clients, webhooks, cron endpoints and external integrations.
- Validate every external payload at the server boundary with a shared schema.
- Authorisation must be enforced in the server action/route/domain service, not only in middleware or UI.
- Do not call an internal Route Handler from a Server Component when the server can call the domain/database layer directly.
- Avoid new page-level inline style objects. Reuse tokens/components; migrate existing inline styles incrementally rather than rewriting unrelated pages.

### Flutter application

- Keep views free of business logic.
- Preferred feature flow: `view -> controller/view-model/provider -> repository -> service/API`.
- Do not call Dio directly from new screens. Existing direct-provider calls should be migrated when the feature is touched.
- Store tokens only in secure storage. Never log tokens, passwords, payment secrets, guest identity data or full API bodies in release builds.
- All user-visible text must use ARB localisation.

### Database

- Drizzle TypeScript schema and committed SQL migrations are the source of truth.
- Production/staging changes use `drizzle-kit generate` plus `drizzle-kit migrate`; do not use `db:push` against shared environments.
- Use a direct Neon connection for migrations and a pooled connection for application traffic.
- Money, wallet, commission, booking and inventory changes must be transactional and protected against concurrent writes at the database level.
- Schema changes require forward migration, compatibility/rollback notes, indexes/constraints review and data backfill plan when relevant.

## 6. Security and financial invariants

These rules are non-negotiable:

- Application startup must fail when required secrets are absent. No fallback production secrets.
- The server calculates room price, discounts, taxes, commission, wallet deduction, payment amount and currency. Never trust these values from a client.
- Payment creation and webhook processing must be idempotent. Verify provider signatures and persist processed event IDs.
- A booking can only reserve inventory once. Enforce overlap/concurrency protection in PostgreSQL, not only with application pre-checks.
- Every hotel-scoped operation must verify hotel membership and permission.
- Cron and internal endpoints fail closed when their secret is absent or invalid.
- Mutating operations must not use `GET`.
- Logs and analytics must not contain passwords, tokens, government IDs, full card/payment data or unnecessary guest PII.

## 7. Required verification

Run the smallest relevant set, then the complete workstream gate.

### Web monorepo

```bash
npm install
npm run lint
npm run check-types
npm run build
```

Add and run unit/integration tests for changed domain behaviour. Critical customer and partner flows also require Playwright coverage once the test harness is introduced.

### Flutter

```bash
cd apps/mobile-flutter
flutter pub get
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test
```

A failing test may never be converted into a successful CI result with `|| true`, `continue-on-error`, or equivalent suppression.

## 8. Definition of done

A work item is complete only when:

- acceptance criteria are satisfied;
- lint, type-check, build and relevant tests pass;
- auth/tenant/money/concurrency/error paths are reviewed;
- migrations and environment changes are documented;
- no temporary/mock/fallback data is silently used in production paths;
- documentation and the program board are updated;
- commits are pushed and a PR contains verification evidence, risks and rollback notes.

See `docs/execution/04-definition-of-done.md` for the full checklist.

## 9. Prohibited actions

Do not:

- force-push shared branches;
- reset or delete unknown changes;
- commit `.env`, private keys, keystores, generated Wrangler temp output or production credentials;
- change API response shapes, booking/payment states or database columns without documenting the contract impact;
- mark work complete based only on UI screenshots;
- bypass failing checks;
- perform broad redesigns while fixing an unrelated defect.

## 10. Required handoff format

Every agent handoff/PR must state:

1. workstream ID and objective;
2. files changed;
3. contracts/migrations/environment variables changed;
4. commands run and exact results;
5. security, money and concurrency checks performed;
6. known limitations and follow-up items;
7. commit SHA and PR link.

Start from `docs/execution/01-multi-agent-operating-model.md` and `docs/execution/02-workstreams-and-ownership.md`.