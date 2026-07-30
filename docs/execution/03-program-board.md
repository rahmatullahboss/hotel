# ZinuRooms Stabilisation Program Board

Baseline: 2026-07-30

This board is the operational queue. Update status, owner, branch, PR and evidence in the same workstream PR.

## P0 — release blockers

| ID | Status | Work item | Acceptance summary | Owner/branch |
|---|---|---|---|---|
| GOV-01 | DONE | Canonical documentation and multi-agent controls | Merged by PR #1 at `957b724811b728b87e06d887582fda8aec9053c9`; canonical rules, audit, architecture, workstreams, DoD, test and operations docs established | `docs/system-audit-2026-07-30` |
| SEC-01 | DONE | Remove JWT fallback and harden mobile auth | PR #6 merged at `1df23f4b28be5860dc9c689802fb260f37d0ac0a`; security run `30534550766`, Flutter run `30534550238` and database run `30534550247` green; revocable sessions, strict JWT/Google verification, shared rate limits, Flutter logout and executable gates delivered | `work/SEC-01-mobile-auth-hardening` |
| PAY-01 | IN_REVIEW | Server-authoritative booking calculation | PR #7; implementation head `dc78134478267a5b0f408b702c3739278b6818a5`; booking run `30540978346`, database run `30540978440`, security run `30540978334` and Flutter run `30540978340` green; debug APK artifact `8758885570`; fresh-start/no-backfill decision recorded | owner: GPT-5.6; branch: `work/PAY-01-server-authoritative-calculation`; booking money schema ownership releases only after merge |
| PAY-02 | BLOCKED | Stripe idempotency, attempts and webhook | Depends on PAY-01 and DB-01; signed/idempotent webhook and reconciliation | unassigned |
| RSV-01 | BLOCKED_OWNERSHIP | Atomic reservation allocation | DB-level no-overlap/atomic allotment; explicit transaction strategy; concurrent test | Wait for PAY-01 to release booking schema/migration ownership |
| CI-01 | BLOCKED_CONFIG | Required monorepo CI | Quality gate green in PR #2; production build requires GitHub Actions secret `CI_DATABASE_URL` from isolated Neon branch `br-bitter-bonus-a1ih1ip8`; tracked by issue #3 | `work/CI-01-required-monorepo-ci`; PR #2 |
| CI-02 | DONE | Strict Flutter CI | PR #4 merged at `fe0976db95a8bd26706f87d0108d5820606ba7a1`; run `30528984233` passed format, strict analyze, tests, coverage and debug APK build; artifacts verified | `work/CI-02-strict-flutter-ci` |
| OPS-02 | READY | Cron fail-closed hardening | required secret, POST mutations, no `X-No-Auth`, timeout/retry/result checks | unassigned |
| QA-01 | BLOCKED | Critical integration/E2E test platform | Depends on stable SEC/PAY/RSV contracts | unassigned |

## P1 — high-priority stabilisation

| ID | Status | Work item | Acceptance summary | Owner/branch |
|---|---|---|---|---|
| DB-01 | DONE | Migration baseline and environment separation | PR #5 merged at `8c8a4e696b6f7705496518670f65184072b0042f`; run `30532072176` passed 19-migration validation, clean PostgreSQL install, schema-drift check, exact timestamp/hash verification and second-run no-op; live adoption remains separately blocked pending isolated semantic schema equivalence | `work/DB-01-migration-baseline` |
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

CI-02 requires ordinary pull requests to pass format, strict analyze, executable tests and an unsigned debug APK build. Signed release jobs are limited to tags/manual dispatch and fail closed when signing credentials or expected artifacts are absent.

CI-01 may move from `BLOCKED_CONFIG` only after issue #3 is resolved and its production-build check has executed successfully against the isolated Neon CI branch.

### DB-01 — Migration baseline

Shared environments use committed Drizzle migrations with `DATABASE_DIRECT_URL`; application traffic uses pooled `DATABASE_URL`. The existing production environment has application tables but no Drizzle migration log, so migration execution there remains prohibited until clean-history CI and isolated semantic schema comparison approve a controlled adoption plan.

## Board update rules

A status change to `IN_PROGRESS` requires owner, base SHA and branch.

A status change to `IN_REVIEW` requires PR, commits, commands/results and documented risks.

A status change to `DONE` requires merged SHA and integration/runtime evidence. Code written but not integrated is not `DONE`.

## Current next action

1. Merge PAY-01 after final evidence review and release booking/money migration ownership.
2. Activate RSV-01 from the PAY-01 integration head and write the reservation-allocation decision record.
3. Resolve CI-01 issue #3 and rerun the production build.
4. Activate OPS-01 environment/deployment health inventory.
5. Plan a separate, reviewed live migration-adoption workstream only if a shared environment later contains legacy data.

The coordinator must prevent PAY-01 and RSV-01 from generating conflicting database migrations.
