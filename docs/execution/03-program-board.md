# ZinuRooms Stabilisation Program Board

Baseline: 2026-07-30

This board is the operational queue. Update status, owner, branch, PR and evidence in the same workstream PR.

## P0 — release blockers

| ID | Status | Work item | Acceptance summary | Owner/branch |
|---|---|---|---|---|
| GOV-01 | DONE | Canonical documentation and multi-agent controls | Merged by PR #1 at `957b724811b728b87e06d887582fda8aec9053c9`; canonical rules, audit, architecture, workstreams, DoD, test and operations docs established | `docs/system-audit-2026-07-30` |
| SEC-01 | READY | Remove JWT fallback and harden mobile auth | Missing secret fails closed; central issue/verify; algorithm/issuer/audience/expiry; rate limiting; tests | unassigned |
| PAY-01 | READY | Server-authoritative booking calculation | Client money ignored; persisted calculation breakdown; configurable commission; wallet limits; tests | unassigned |
| PAY-02 | BLOCKED | Stripe idempotency, attempts and webhook | Depends on PAY-01 and DB-01; signed/idempotent webhook and reconciliation | unassigned |
| RSV-01 | READY | Atomic reservation allocation | DB-level no-overlap/atomic allotment; explicit transaction strategy; concurrent test | unassigned |
| CI-01 | IN_PROGRESS | Required monorepo CI | locked install; changed-file zero-warning lint ratchet; full type-check, tests and production build; no suppression; branch checks documented | owner: GPT-5.6; base: `89a1e39dee0d6bd5bec32e42b4d36ce712ae5e68`; branch: `work/CI-01-required-monorepo-ci`; PR #2 |
| CI-02 | READY | Strict Flutter CI | format, strict analyze, tests, Android builds; test failure fails workflow | unassigned |
| OPS-02 | READY | Cron fail-closed hardening | required secret, POST mutations, no `X-No-Auth`, timeout/retry/result checks | unassigned |
| QA-01 | BLOCKED | Critical integration/E2E test platform | Depends on stable SEC/PAY/RSV contracts | unassigned |

## P1 — high-priority stabilisation

| ID | Status | Work item | Acceptance summary | Owner/branch |
|---|---|---|---|---|
| DB-01 | READY | Migration baseline and environment separation | `generate`/`migrate`; committed history; direct migration URL; pooled app URL; clean/upgrade tests | unassigned |
| LINT-01 | READY | Retire historical monorepo lint debt | inventory warnings by app/rule; fix without broad suppression; keep changed-file ratchet green; finish with full `npm run lint` at zero warnings | unassigned |
| SEC-02 | BLOCKED | Tenant/RBAC matrix and enforcement | Explicit permission matrix; negative tests across partner/admin/hotel boundaries | unassigned |
| API-01 | BLOCKED | Versioned mobile API contract | Typed schemas, stable error envelope, contract tests, no guessed response shapes | unassigned |
| RSV-02 | BLOCKED | Booking expiry/cancellation/refund state machine | legal transitions, idempotent jobs, inventory release, wallet/payment reconciliation | unassigned |
| EVT-01 | BLOCKED | Outbox and reliable domain events | transactional outbox, event IDs/versioning, retry/dead-letter/replay | unassigned |
| OPS-01 | READY | Environment/deployment health matrix | complete env registry; `/health`/`/ready`; smoke users/data; Vercel status verified | unassigned |
| OBS-01 | BLOCKED | PII-safe logs, metrics and alerts | correlation IDs, redaction, Sentry/alerts, payment/booking dashboards | unassigned |
| PMS-01 | BLOCKED | Partner/PMS runtime stabilisation | deploy/build green; hotel onboarding→inventory→booking→check-in/out smoke passes | unassigned |
| ADM-01 | BLOCKED | Admin governance runtime stabilisation | roles, hotel approval, commission/payout/promotion operations tested | unassigned |
| MOB-01 | BLOCKED | Flutter repository/service architecture and API alignment | no new screen→Dio coupling; typed models; error states; release logging safe | unassigned |
| WEB-01 | BLOCKED | Customer web critical flow stabilisation | signup/search/details/booking/payment/cancellation/profile E2E | unassigned |

## P2 — product and operational quality

| ID | Status | Work item | Acceptance summary | Owner/branch |
|---|---|---|---|---|
| UI-01 | NOT_STARTED | Consolidate web design tokens/components | incremental removal of duplicated page styles; visual regression coverage | unassigned |
| I18N-01 | NOT_STARTED | Localisation/currency/content audit | no hardcoded user text/currency; factual marketing claims; EN/BN parity | unassigned |
| PERF-01 | NOT_STARTED | Next.js/mobile performance baseline | Core Web Vitals, bundle analysis, query timing, image/cache policy | unassigned |
| STO-01 | NOT_STARTED | Provider-neutral media storage | storage interface, validation, access policy, R2/S3 migration option | unassigned |
| OTA-01 | DEFERRED | Real OTA integration certification | provider contracts, signed webhooks, mapping, replay and reconciliation | unassigned |
| OPS-03 | NOT_STARTED | Backup/restore and incident runbooks | restore rehearsal, RPO/RTO, reconciliation and incident ownership | unassigned |
| PORT-01 | NOT_STARTED | Docker/VPS portability staging | standalone builds, images, compose, staging smoke; Vercel remains production baseline | unassigned |
| IOS-01 | NOT_STARTED | iOS release pipeline | signing, TestFlight build, store metadata/privacy checklist | unassigned |
| QA-02 | BLOCKED | Pilot hotel UAT | representative hotels/data; acceptance sign-off; release report | unassigned |

## Activation details

### SEC-01 — Mobile auth hardening

Paths:

- `apps/web/app/api/auth/mobile-login/route.ts`
- `apps/web/app/api/auth/mobile-register/route.ts`
- `apps/web/app/api/mobile/google-auth/route.ts` or current equivalent
- `apps/web/lib/mobile-auth.ts`
- Flutter auth/secure storage integration

Required tests:

- startup/request fails without secret;
- invalid signature/algorithm/issuer/audience/expired token rejected;
- rate limit behaviour;
- login/register success and generic credential errors;
- logout/revocation strategy behaviour.

### PAY-01 — Calculation authority

Must deliver a single calculation service used by web, mobile, partner and admin reporting. It must load room/date pricing and platform/hotel policy from the database and persist the exact breakdown.

Negative tests include client tampering with total, wallet and commission values.

### RSV-01 — Reservation allocation

Must first write a decision record choosing physical-room vs room-type allotment semantics. Implement database-enforced concurrency and stress with simultaneous requests.

### PAY-02 — Stripe

Must introduce payment attempts and processed provider events with unique keys. Client success is not authoritative. Use provider test clocks/events where useful.

### CI-01/CI-02

No check may transform a failure into success. Required checks become branch protection gates after workflow validation.

CI-01 uses a zero-warning changed-file lint ratchet while `LINT-01` removes untouched historical warnings. Full type-check, CI tests and production build remain repository-wide gates.

### LINT-01 — Historical lint cleanup

Inventory warnings by workspace and rule. Fix them in bounded app/package batches without increasing warning counts, weakening shared rules or combining unrelated behaviour changes. Completion requires `npm run lint` to pass with zero warnings, after which CI-01 can replace the ratchet with full-repository lint.

## Board update rules

A status change to `IN_PROGRESS` requires owner, base SHA and branch.

A status change to `IN_REVIEW` requires PR, commits, commands/results and documented risks.

A status change to `DONE` requires merged SHA and integration/runtime evidence. Code written but not integrated is not `DONE`.

## Current next action

After GOV-01 review, activate in parallel:

1. CI-01
2. CI-02
3. DB-01
4. SEC-01
5. PAY-01 design/tests
6. RSV-01 design/database proof
7. OPS-01 environment inventory

The coordinator must prevent PAY-01 and RSV-01 from generating conflicting database migrations.
