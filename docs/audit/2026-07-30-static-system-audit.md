# ZinuRooms Static System Audit — 2026-07-30

## 1. Scope and confidence

This audit reviews the repository structure, current application configuration, selected critical code paths, workflows, database schema, deployment status evidence and existing agent documentation.

It is a **static audit**. It does not claim that every production endpoint, environment secret, migration, external provider or user flow has been executed successfully. Runtime verification is a required follow-up workstream.

### Areas reviewed

- root monorepo configuration and documentation;
- customer web and mobile API;
- partner/PMS and admin feature surface;
- Flutter application structure and release workflow;
- booking, room availability, wallet, commission and Stripe paths;
- mobile JWT authentication;
- Neon/Drizzle database configuration;
- scheduled workflows and realtime deployment;
- CI/test posture;
- deployment portability and operations documentation;
- multi-agent governance.

## 2. Executive conclusion

The repository contains a substantial product implementation, not a prototype shell. Customer booking, hotel partner operations, platform administration, Flutter mobile, PostgreSQL domain models, realtime updates and multiple integrations are present.

However, the system should currently be classified as **feature-rich development software requiring stabilisation**, not production-ready financial/reservation infrastructure.

The largest risk is not missing screens. The largest risk is inconsistency across auth, money, booking concurrency, deployment workflows, tests and agent instructions.

### Approximate readiness by dimension

| Dimension | Assessment | Confidence |
|---|---:|---:|
| Feature surface | 70–80% | Medium |
| Architecture foundation | 65–75% | Medium |
| Security hardening | 35–45% | Medium-high for reviewed paths |
| Booking/payment correctness | 35–45% | High for reviewed paths |
| Automated quality evidence | 20–30% | High |
| Operational readiness | 35–45% | Medium |
| Multi-agent readiness before this documentation | 15–25% | High |
| Overall unrestricted production readiness | 45–55% | Medium |

Percentages are directional planning estimates, not measured completion metrics.

## 3. Strengths to preserve

1. Clear monorepo separation for customer, partner, admin, mobile, database and realtime components.
2. Feature-based Flutter structure with Riverpod, go_router, Dio and secure storage.
3. Rich hotel/PMS feature surface: inventory, reservations, front desk, housekeeping, maintenance, staff, channels, revenue, reports and messaging.
4. Shared Drizzle schema covers hotels, rooms, date inventory, bookings, payment state, commission, promotions, staff, support and operational modules.
5. Booking creation attempts to use a transaction and checks overlapping dates.
6. Vercel, Neon and Cloudflare components are separable; the stack is portable without a framework rewrite.
7. Flutter Android release workflow and signing structure exist.
8. Server-side auth checks are present in several mobile API routes.

These foundations should be hardened incrementally rather than replaced wholesale.

## 4. Critical findings — P0

P0 items must be addressed before pilot hotels process real customer money or rely on the system as the source of truth.

### AUD-P0-01 — Mobile JWT falls back to a public hardcoded secret

**Evidence**

- `apps/web/app/api/auth/mobile-login/route.ts`
- `apps/web/app/api/auth/mobile-register/route.ts`

Both use:

```ts
const JWT_SECRET = process.env.AUTH_SECRET || "your-secret-key";
```

**Risk**

If `AUTH_SECRET` is missing in any environment, attackers can mint valid tokens using the known fallback. A deployment configuration error becomes an authentication bypass.

**Required correction**

- fail startup/request handling when the secret is absent;
- centralise token issue/verify logic;
- explicitly set and verify algorithm, issuer and audience;
- require expiration and add token/session revocation strategy;
- add login/register rate limiting and security events;
- rotate any environment that may have run with the fallback.

### AUD-P0-02 — Stripe PaymentIntent accepts client-controlled amount and currency

**Evidence**

- `apps/web/app/api/payment/stripe/create-intent/route.ts`

The endpoint accepts optional `amount` and `currency`, uses a hardcoded exchange rate, and creates the intent from those values.

**Risk**

A modified client can request a lower amount, select an unintended currency or create inconsistent booking/payment records. Hardcoded FX creates accounting and refund discrepancies.

**Required correction**

- request only `bookingId` and an idempotency token from the client;
- calculate payable amount and supported currency on the server from persisted booking/payment policy;
- reject expired, cancelled, already-paid or unauthorised bookings;
- require ownership rather than checking ownership only when a user ID happens to be present;
- use Stripe idempotency keys tied to booking/payment attempt;
- store a payment-attempt record before provider calls;
- return stable public error codes, not internal exception messages.

Reference: https://docs.stripe.com/api/idempotent_requests

### AUD-P0-03 — Stripe webhook completion path is not evidenced

A PaymentIntent creation path was found, but a reviewed, signature-verified, idempotent Stripe webhook path that finalises the booking was not established during this audit.

**Risk**

Client-side success cannot be the authority for payment. Missing or weak webhook processing can leave paid bookings pending, mark unpaid bookings paid, process events twice or fail refunds/reconciliation.

**Required correction**

- implement/verify a raw-body webhook endpoint;
- validate `Stripe-Signature` with the correct endpoint secret;
- store provider event ID with a unique constraint;
- process each event once in a transaction;
- reconcile PaymentIntent amount/currency/metadata against the payment attempt and booking;
- update booking/payment state through an explicit state machine;
- support replay and recovery of undelivered events.

References:

- https://docs.stripe.com/webhooks
- https://docs.stripe.com/webhooks/signature

### AUD-P0-04 — Booking and wallet amounts are trusted from the client

**Evidence**

- `apps/mobile-flutter/lib/features/bookings/providers/booking_provider.dart`
- `apps/web/app/api/bookings/route.ts`
- `apps/web/app/actions/bookings.ts`

The Flutter client sends `totalAmount`; the API passes `totalAmount`, `walletAmount` and payment method into the domain action; the action uses those values for commission, net amount, wallet deduction and booking persistence.

**Risk**

A modified client can underprice a booking, manipulate wallet deduction, commission or payable amount.

**Required correction**

The server must derive:

- room/hotel relationship;
- nightly price for each date;
- promotion eligibility;
- taxes/fees;
- commission policy;
- wallet maximum usable amount;
- total payable and payment split.

The client may submit dates, guest count, room/rate-plan identifier, promotion code and selected payment method, but never authoritative money values.

### AUD-P0-05 — Double-booking protection is not guaranteed

**Evidence**

`apps/web/app/actions/bookings.ts` says it uses a serializable transaction and `FOR UPDATE`, but the reviewed transaction call does not declare serializable isolation and the room query is a normal Drizzle query without an explicit row lock. Availability is checked, then a booking is inserted.

**Risk**

Two concurrent requests can both observe no overlapping booking and both insert. Application checks alone are insufficient for reservation inventory.

**Required correction**

- choose a canonical inventory model: per physical room or room-type allotment;
- enforce non-overlap at PostgreSQL level, preferably with a date/timestamp range and exclusion constraint for active statuses, or an atomic date-inventory allocation table;
- use an explicit transaction isolation/locking strategy and retry serialization conflicts;
- add concurrency integration tests that submit simultaneous bookings;
- treat OTA sync, partner bookings, walk-ins and customer bookings through the same allocation service.

### AUD-P0-06 — Commission and booking-fee policy is contradictory

**Evidence**

- hotel schema includes configurable commission rate;
- booking creation hardcodes a 20% commission;
- comments describe a 20% Pay-at-Hotel advance, while `calculateBookingFee()` returns zero for Pay at Hotel;
- later branches contain logic that still refers to covering a 20% advance.

**Risk**

Revenue, payout, wallet and customer payment records can disagree. UI/admin settings may not affect actual calculations.

**Required correction**

Create one versioned pricing/settlement policy service that returns a persisted calculation breakdown. No other module may independently calculate commission or booking fee.

### AUD-P0-07 — Cron workflows can fail open

**Evidence**

- `.github/workflows/apply-pricing.yml`
- `.github/workflows/sync-channels.yml`

When `CRON_SECRET` is absent, workflows send `X-No-Auth: true` rather than stopping.

**Risk**

If endpoints honour this mode, missing configuration can expose privileged operations. Even if endpoints currently ignore it, the workflow communicates unsafe intent.

**Required correction**

- fail the workflow when any required secret is missing;
- fail the endpoint when the secret is absent or invalid;
- remove user-supplied secret override fields;
- use POST for mutation, bounded timeouts, retry policy and response validation;
- record execution ID, duration and affected row counts;
- move to Vercel Cron or a dedicated scheduler later if reliability requirements exceed GitHub scheduled workflow guarantees.

### AUD-P0-08 — CI can report success despite failed Flutter tests

**Evidence**

`.github/workflows/flutter-release.yml` uses non-fatal analysis flags and:

```bash
flutter test --coverage || echo "No tests found, skipping..."
```

**Risk**

A real test failure is indistinguishable from no tests. Releases may be built from broken code.

**Required correction**

- allow no failure suppression;
- create an actual test suite;
- run format, strict analyze, test and build as required jobs;
- make release depend on all gates;
- add web/admin/partner/API CI, which is currently not evidenced as a complete required pipeline.

## 5. High-priority findings — P1

### AUD-P1-01 — Root README is the Turborepo starter

The README documents apps that do not represent the product and omits environment, migrations, deployments, tests and operational flows. This is a primary cause of agent confusion.

### AUD-P1-02 — Agent instructions conflict with the codebase

Examples:

- active Flutter app exists, but substantial Expo instructions remain;
- dependency versions in instructions are stale;
- “no API routes” conflicts with mobile/webhook/cron requirements and existing Route Handlers;
- “strictly no inline styles” conflicts with many current pages;
- `db:push` is presented as a normal migration path for shared environments;
- multiple duplicated instruction files can drift.

`AGENTS.md` is now the canonical contract. Legacy files should point to it.

### AUD-P1-03 — Environment documentation is incomplete and stale

`.env.example` includes bKash/Nagad and Vercel Blob fields but omits or incompletely documents Stripe, Firebase, realtime auth, cron, application URLs, webhook secrets and environment-specific database URLs.

Required environment variables must be classified as public/server-only, required/optional and local/preview/staging/production.

### AUD-P1-04 — Migration workflow favours schema push

`packages/db` exposes `db:push` but no clearly established `db:migrate` script. Production-grade teamwork needs committed SQL migration history, review and one-time application per environment.

References:

- https://orm.drizzle.team/docs/migrations
- https://orm.drizzle.team/docs/drizzle-kit-migrate

### AUD-P1-05 — Neon connection roles are not separated

Application and migration configuration use `DATABASE_URL`. Serverless application traffic should use a pooled endpoint; migrations/administrative operations should use a direct endpoint.

Reference: https://neon.com/docs/connect/connection-pooling

### AUD-P1-06 — Mobile API layer is tolerant of incompatible responses

The Flutter booking provider accepts several response shapes, converts parsing failures into empty lists and may treat an error response containing a booking ID as success. Debug logging prints request and response bodies.

Required correction:

- publish a versioned API contract;
- validate typed responses;
- distinguish empty state, incompatible response, network error and server error;
- remove sensitive release logging;
- introduce service/repository layers and contract tests.

### AUD-P1-07 — Authentication is fragmented

NextAuth sessions and custom JWTs share a secret but use separate issue/validation paths. Admin, partner, customer web and mobile roles require a documented identity and authorisation model, including account linking, token lifetime, revocation and tenant membership checks.

### AUD-P1-08 — No complete automated test strategy is present

Package scripts principally expose build/lint/type-check. The Flutter workflow explicitly allows no tests. Critical booking/payment/tenant workflows need integration and end-to-end coverage.

### AUD-P1-09 — Side effects lack a durable outbox

Notifications and realtime events are triggered after booking commit with best-effort asynchronous calls. Failures can leave external systems out of sync with the database.

Adopt an outbox/job model for booking confirmation, cancellation, payment, inventory and notification events.

### AUD-P1-10 — Realtime security and lifecycle need review

The realtime Worker design previously exposed broad CORS and optional push authentication. Current source, deployed secrets, Durable Object hibernation/lifecycle behaviour, origin policy and replay semantics must be verified.

### AUD-P1-11 — Demo/fallback production data exists

Dashboard and marketing surfaces contain hardcoded/fallback metrics and claims. Production must not silently substitute sample revenue, occupancy, rankings or customer counts when queries fail or data is empty.

### AUD-P1-12 — Deployment status needs an explicit health matrix

Vercel statuses and live URLs need revalidation for web, partner and admin. Each application needs `/health` and `/ready` semantics, environment/version display for administrators, and a documented smoke-test account/data set.

## 6. Medium-priority findings — P2

1. Large page files and repeated inline style systems increase review and regression risk.
2. Shared domain/API logic is inconsistently placed between application actions and `packages/api`.
3. Hardcoded localisation and currency strings remain in Flutter and web surfaces.
4. Mobile supports many features but architecture is provider-to-Dio rather than a fully separated data layer.
5. Vercel Blob is a portability coupling; introduce a storage interface before migration is needed.
6. Generated and temporary files require stronger repository hygiene checks.
7. Existing `as any` and broad dynamic response handling reduce contract safety.
8. Observability exists as dependencies/configuration but service-level objectives, alert routes and runbooks are not documented.
9. Backup, restore rehearsal and reconciliation procedures are absent from repository documentation.
10. iOS release automation, store metadata and signing runbook are incomplete.

## 7. Recommended execution sequence

### Wave 0 — Documentation and controls

- canonical agent contract and document index;
- workstream ownership and program board;
- CI rules that cannot be bypassed;
- environment inventory and secret validation;
- runtime health matrix.

### Wave 1 — Security and money

- mobile auth secret/token hardening;
- server-authoritative pricing/commission/wallet calculation;
- Stripe payment-attempt model, idempotency and webhook processing;
- cron fail-closed changes;
- PII-safe logging.

### Wave 2 — Reservation correctness

- canonical inventory allocation service;
- PostgreSQL concurrency constraint/atomic allocation;
- booking state machine;
- cancellation/refund/expiry reconciliation;
- OTA/walk-in/platform integration through the same service.

### Wave 3 — Test platform

- unit and domain integration harness;
- isolated Neon test database/branch strategy;
- Playwright customer/partner/admin flows;
- Flutter unit/widget/integration tests;
- contract tests between Flutter and web API;
- required CI checks and coverage thresholds for critical modules.

### Wave 4 — Product stabilisation

- remove demo fallbacks and false marketing claims;
- complete RBAC matrix;
- consolidate styles/components incrementally;
- accessibility, performance, localisation and SEO review;
- pilot hotel UAT.

### Wave 5 — Operations and scale

- backup/restore drill;
- incident and reconciliation runbooks;
- outbox/jobs and observability;
- Docker portability and VPS staging;
- multi-instance caching strategy if/when Vercel is replaced.

## 8. Production entry criteria

Do not label the system production-ready until all are true:

- all P0 items closed with tests;
- payment webhooks and reconciliation proven in provider test mode;
- concurrent booking tests prove no double allocation;
- tenant/RBAC negative tests pass;
- migrations apply from an empty database and from the current production baseline;
- backup restore is rehearsed;
- web, partner, admin and mobile critical E2E paths pass;
- monitoring and alert ownership are defined;
- no CI failure suppression;
- staging UAT completed with representative hotels and bookings.

## 9. External best-practice baseline

The remediation plan is aligned with current official guidance:

- Next.js production checklist: https://nextjs.org/docs/app/guides/production-checklist
- Next.js self-hosting: https://nextjs.org/docs/app/guides/self-hosting
- Stripe idempotency: https://docs.stripe.com/api/idempotent_requests
- Stripe webhooks: https://docs.stripe.com/webhooks
- Drizzle migrations: https://orm.drizzle.team/docs/migrations
- Drizzle transactions: https://orm.drizzle.team/docs/transactions
- Neon pooling: https://neon.com/docs/connect/connection-pooling
- Flutter architecture: https://docs.flutter.dev/app-architecture/guide
- Flutter testing: https://docs.flutter.dev/testing/overview
- GitHub deployment environments: https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- GitHub OIDC hardening: https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments

## 10. Audit limitations and next evidence collection

The next audit pass must collect:

- current Vercel project settings, aliases, environment variables and deployment logs;
- Neon branches, migration history, indexes, constraints and query plans;
- Stripe webhook configuration and test events;
- Firebase project/configuration and notification delivery evidence;
- Cloudflare Worker deployment and secret configuration;
- actual test accounts and full runtime smoke results;
- dependency and secret scanning results;
- repository branch protection and required-check settings.

Findings should be updated rather than duplicated when new evidence becomes available.