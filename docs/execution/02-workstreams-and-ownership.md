# Workstreams and Ownership Matrix

## 1. Ownership principles

- Workstream ownership is temporary and recorded in the program board.
- A path may have one active writer unless the coordinator explicitly approves shared ownership.
- Shared contracts are integrated before dependent implementation whenever possible.
- Every workstream includes tests and documentation for its scope.

## 2. Proposed stabilisation workstreams

| ID | Workstream | Primary paths | Shared contracts | Depends on |
|---|---|---|---|---|
| GOV-01 | Documentation and agent governance | `AGENTS.md`, `docs/**`, `.agent/**`, `README.md` | engineering process | none |
| CI-01 | Required web/monorepo CI | `.github/workflows/**`, root scripts/config | test commands, environments | GOV-01 |
| CI-02 | Flutter CI and release gates | Flutter workflow, `apps/mobile-flutter/test`, build config | mobile release policy | GOV-01 |
| SEC-01 | Mobile JWT/auth hardening | `apps/web/app/api/auth/**`, `apps/web/lib/mobile-auth.ts`, Flutter auth/storage | identity/token contract | GOV-01, CI-01 |
| SEC-02 | Tenant/RBAC enforcement | auth/middleware, partner/admin actions/routes, staff schema | permission matrix | SEC-01 |
| PAY-01 | Server-authoritative calculation | booking/pricing/commission/wallet domain, schema | money calculation contract | DB-01, CI-01 |
| PAY-02 | Stripe payment attempts and webhook | Stripe routes/services, payment schema | payment state/events | PAY-01, SEC-01 |
| RSV-01 | Reservation allocation and concurrency | booking/inventory schema and services | booking state, inventory contract | DB-01, PAY-01 |
| RSV-02 | Expiry/cancellation/refund | cron, booking/payment/wallet services | state machine/events | RSV-01, PAY-02 |
| DB-01 | Migration discipline and baseline | `packages/db/**`, migration scripts | migration head, DB URLs | GOV-01 |
| EVT-01 | Durable outbox and realtime events | schema, domain services, `packages/realtime` | event envelopes | DB-01, RSV-01 |
| API-01 | Versioned mobile API contracts | `apps/web/app/api/**`, `packages/api/**` | schemas/errors | SEC-01, PAY-01, RSV-01 |
| MOB-01 | Flutter data-layer refactor | `apps/mobile-flutter/lib/**` | API contract | API-01, CI-02 |
| PMS-01 | Partner/PMS stabilisation | `apps/partner/**` | booking/inventory/RBAC | SEC-02, RSV-01 |
| ADM-01 | Admin governance stabilisation | `apps/admin/**` | platform roles, commissions | SEC-02, PAY-01 |
| WEB-01 | Customer web stabilisation | `apps/web/app/**` excluding owned APIs | booking/API contracts | API-01, RSV-01, PAY-02 |
| OPS-01 | Environment/deployment health | Vercel config, health routes, env docs | environment contract | CI-01, SEC-01 |
| OBS-01 | Logging, metrics and alerts | Sentry/telemetry/logging code and runbooks | correlation/event IDs | CI-01, OPS-01 |
| QA-01 | Playwright/API integration platform | test harness and fixtures | stable API/seed contract | CI-01, API-01 |
| QA-02 | Pilot UAT and release evidence | docs/runbooks/test data | release checklist | all P0 workstreams |

## 3. Default path ownership

### Shared/high-conflict files

Coordinator approval is required before editing:

- root `package.json`, lockfiles, `turbo.json`;
- `packages/db/src/schema/index.ts` and migration metadata;
- shared auth types;
- shared booking/payment status types;
- `.env.example`;
- root/global CI workflows;
- generated localisation files;
- shared UI exports.

### Customer web/API

- Public/customer UI: `WEB-01`.
- Mobile/external API routes: `API-01`.
- Auth routes/helpers: `SEC-01`.
- Stripe routes: `PAY-02`.
- Booking allocation service: `RSV-01`.

Do not let the path location alone determine ownership; domain responsibility wins.

### Partner

`PMS-01` owns partner pages/components/actions after shared domain contracts are established. Partner-specific work may not duplicate pricing, allocation or permission logic.

### Admin

`ADM-01` owns admin pages/components/actions after shared roles and money policy are established. Admin configuration must be consumed by domain services, not remain display-only.

### Flutter

`MOB-01` owns mobile feature code. `CI-02` owns workflow/release/test harness. API changes remain under `API-01`.

## 4. Shared contract owners

| Contract | Primary owner | Required reviewers |
|---|---|---|
| Identity/JWT/session | SEC-01 | SEC-02, API-01, MOB-01 |
| Hotel membership/RBAC | SEC-02 | PMS-01, ADM-01 |
| Booking state machine | RSV-01 | PAY-02, PMS-01, WEB-01, MOB-01 |
| Availability/allocation | RSV-01 | PMS-01, API-01 |
| Pricing/commission/wallet calculation | PAY-01 | ADM-01, RSV-01, PAY-02 |
| Payment attempts/provider events | PAY-02 | PAY-01, RSV-02, OBS-01 |
| Database migration head | DB-01 | affected domain owner |
| Domain/realtime event envelope | EVT-01 | RSV-01, PAY-02, PMS-01 |
| Mobile API schema/error envelope | API-01 | MOB-01, SEC-01 |
| Environment variable registry | OPS-01 | SEC-01, CI owners |
| Test fixtures/seed identities | QA-01 | API/domain owners |

## 5. Parallel-safe waves

### Wave A

Can run concurrently:

- GOV-01
- DB-01 planning/baseline only
- CI-01
- CI-02
- OPS-01 inventory only

### Wave B

After basic CI/governance:

- SEC-01
- PAY-01
- RSV-01 design and database proof
- QA-01 harness scaffolding

Schema edits among PAY-01/RSV-01 must be coordinated by DB-01.

### Wave C

After shared contracts:

- PAY-02
- SEC-02
- API-01
- EVT-01

### Wave D

Consumer integration can run concurrently:

- WEB-01
- PMS-01
- ADM-01
- MOB-01

### Wave E

- RSV-02
- OBS-01
- OPS-01 deployment hardening
- QA-02 UAT/release evidence

## 6. Workstream activation template

```md
### <ID> — <title>

Status: READY
Owner: unassigned
Base SHA: <approved SHA>
Branch: work/<id>-<name>
Paths:
- ...

Objective:
...

Acceptance criteria:
- ...

Contracts affected:
- ...

Dependencies:
- ...

Required verification:
- ...

Handoff evidence:
- ...
```

## 7. Ownership conflict resolution

1. Stop editing the contested file.
2. Both agents state the exact needed change and dependency.
3. Coordinator assigns one writer or creates a separate contract workstream.
4. Dependent agent uses an approved fixture/interface until integration.
5. Board records the decision.

Never resolve ownership conflicts by force-pushing or silently overwriting the other branch.