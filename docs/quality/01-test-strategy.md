# ZinuRooms Test Strategy

## 1. Objectives

Testing must prove:

- customers cannot manipulate price/payment/wallet values;
- rooms cannot be double-booked;
- tenant and role boundaries cannot be crossed;
- payment retries/webhooks are idempotent;
- booking/payment/inventory states remain consistent;
- web, partner, admin and Flutter agree on API contracts;
- deployments are buildable, observable and recoverable.

## 2. Test layers

### Unit tests

Fast, deterministic tests for:

- pricing, discounts, commission and rounding;
- booking state transitions;
- cancellation/refund/expiry policy;
- permission evaluation;
- API schema parsing and error mapping;
- Flutter view-model/provider/repository logic;
- date, currency and localisation utilities.

### Database/domain integration tests

Run against an isolated PostgreSQL/Neon branch or disposable database.

Cover:

- migrations and constraints;
- transaction rollback;
- concurrent booking allocation;
- concurrent wallet deductions;
- idempotency uniqueness;
- payment webhook replay;
- tenant-scoped queries;
- outbox creation/consumption;
- deletion/foreign-key behaviour.

### API contract tests

For each mobile/external endpoint:

- valid request/response fixture;
- validation failure;
- unauthenticated/forbidden;
- not found/conflict;
- stable error code/envelope;
- no sensitive error leakage;
- old/new compatibility during version transitions.

Flutter decoders run against the same fixtures.

### Component/widget tests

Web components and Flutter widgets cover loading, empty, error and success states, accessibility and key interactions without full environment cost.

### End-to-end tests

Use Playwright for browser flows and Flutter integration tests for mobile critical flows.

## 3. Critical E2E scenarios

### Customer web

1. Register/login/logout and session expiry.
2. Search dates/city/guests.
3. Open hotel and room details.
4. Booking calculation from server.
5. Pay-at-hotel or test-mode Stripe flow.
6. Booking appears in customer and partner views.
7. Cancellation and correct inventory/payment/wallet result.
8. Access another user's booking is denied.

### Partner/PMS

1. Hotel registration and admin approval.
2. Staff invitation/role limitation.
3. Room/rate/inventory creation.
4. Walk-in reservation.
5. Platform reservation visible.
6. Check-in/check-out.
7. Housekeeping/maintenance block affects sellable inventory.
8. Hotel A cannot access Hotel B.
9. Reports match source bookings/calculations.

### Admin

1. Admin authentication and non-admin denial.
2. Hotel approval/suspension.
3. Commission policy change affects new calculations through the domain service.
4. Payout/report totals reconcile to bookings/payments.
5. Promotion validation and limits.
6. Moderation/support operations are audited.

### Flutter

1. Onboarding and authentication.
2. Token restore/expiry/logout.
3. Search/details/booking.
4. Payment sheet test flow and webhook-confirmed status refresh.
5. Bookings/notifications/profile localisation.
6. Network loss, retry and incompatible response handling.
7. Deep links/push navigation where implemented.

## 4. Security negative tests

- forged/expired/wrong-audience JWT;
- missing secrets fail closed;
- brute-force/rate-limit behaviour;
- cross-user booking/payment access;
- cross-hotel partner access;
- non-admin admin action;
- client-supplied price/wallet/commission ignored;
- invalid webhook signature/replayed event;
- missing/invalid cron secret;
- malicious upload type/size/name;
- unsafe redirect/callback parameters;
- sensitive values absent from response/log snapshots.

Use OWASP ASVS/API Security guidance as a review checklist; adapt to the actual architecture.

## 5. Concurrency tests

### Double booking

Submit multiple simultaneous allocations for the same unit/date range. Exactly one succeeds when capacity is one. Verify database state, responses and released inventory on rollback.

### Wallet

Submit simultaneous deductions that together exceed balance. The final balance never becomes negative and ledger equals the accepted deductions.

### Idempotent payment/booking

Repeat the same logical request with the same key before, during and after provider timeout. Exactly one booking/payment attempt is created.

### Webhook replay/order

Deliver duplicate and out-of-order provider events. State remains legal and financial effects occur once.

## 6. Migration tests

CI or a dedicated workflow must:

1. create an empty database;
2. apply all committed migrations;
3. run schema smoke queries;
4. create a copy/branch of current baseline data;
5. apply new migration;
6. run integrity checks/backfill assertions;
7. run affected domain tests.

Do not test production migrations with `drizzle-kit push`.

## 7. CI gates

### Pull requests touching TypeScript/Next.js

Required:

- deterministic dependency install;
- lint;
- type-check;
- affected unit/integration tests;
- affected app/package builds;
- migration check when schema changed;
- secret/dependency scanning when configured.

### Pull requests touching Flutter

Required:

- `dart format --output=none --set-exit-if-changed .`;
- `flutter analyze` with warnings treated according to committed policy, never silently ignored;
- `flutter test`;
- Android debug/release build for release-sensitive changes;
- integration tests for critical flow changes.

### Main/release

Required:

- full monorepo build/test matrix;
- critical Playwright suite;
- Flutter critical integration suite;
- staging deployment and smoke test;
- migration rehearsal;
- release artefact generation only after gates pass.

## 8. No false-green policy

Forbidden in required checks:

```text
|| true
|| echo "skipping"
continue-on-error: true
ignored curl exit/status
catching test errors without rethrow
```

An intentionally optional check must be clearly labelled optional and cannot gate a release claim.

## 9. Test data

Maintain deterministic fixtures for:

- traveller;
- hotel owner/manager/receptionist/housekeeping roles;
- platform admin;
- two isolated hotels;
- rooms/rate plans/inventory;
- promotions/commission policy;
- wallet balance;
- pending/confirmed/cancelled/checked-in bookings;
- payment attempts/events.

No production customer data in automated tests.

## 10. Coverage policy

Coverage percentage is not the sole quality metric. Initially require:

- all P0 business rules have direct tests;
- every fixed defect gets regression coverage;
- every API has auth/validation/contract tests;
- every state transition has positive and negative tests;
- concurrency and idempotency have integration tests.

Introduce numeric thresholds only after the suite is meaningful, then prevent regression for critical packages.

## 11. Evidence in PRs

Record:

- commands;
- environment/database fixture used;
- result and duration;
- relevant test names;
- screenshots/traces only as supplementary evidence;
- known untested paths with follow-up workstream ID.

Reference for Flutter test layers: https://docs.flutter.dev/testing/overview