# Change and Integration Contracts

## 1. Purpose

Parallel work is safe only when shared interfaces change deliberately. This document defines how database, API, auth, money, booking state, event and environment contracts evolve.

## 2. Contract change record

Every shared change must include:

```md
Contract:
Current version/shape:
Proposed version/shape:
Owner:
Consumers:
Backward compatibility:
Migration/deployment order:
Fixtures/simulator:
Verification:
Removal date for compatibility code:
```

## 3. Database contract

### Source of truth

- Drizzle schema under `packages/db/src/schema/`.
- Ordered SQL migration history under the configured migration directory.
- Applied migration log in each environment.

### Rules

- Additive/nullable changes precede consumer rollout.
- Backfill before making a field required when existing rows exist.
- Rename through expand/migrate/contract, not a one-step breaking rename.
- Enum/status changes require all consumers and historical records to be reviewed.
- Monetary columns define unit, currency and rounding.
- Foreign keys, unique constraints and indexes are intentional and reviewed.
- `db:push` is local disposable development only.

### Deployment order

1. backward-compatible migration;
2. code that can read old/new state;
3. data backfill;
4. switch writers;
5. verify;
6. remove old compatibility in a later release.

## 4. API contract

### Envelope

Use a stable error model such as:

```json
{
  "error": {
    "code": "BOOKING_NOT_AVAILABLE",
    "message": "The selected room is no longer available.",
    "requestId": "...",
    "details": {}
  }
}
```

Do not return raw exception text. Validation errors may include safe field details.

### Versioning

- External/mobile APIs are versioned before breaking changes.
- Add fields as optional first.
- Do not change type/meaning of an existing field silently.
- Keep OpenAPI or equivalent machine-readable schemas when API-01 is implemented.
- Generate fixtures used by Flutter contract tests.

### Client authority

Clients may send intent and selections. They may not authoritatively send price, commission, tax, wallet deduction, role, hotel ownership, payment completion or booking status.

## 5. Auth contract

Token/session claims must have one documented schema:

```text
subject/user ID
issuer
audience
role (coarse platform role)
issued time
expiration
unique token/session ID
```

Hotel permissions are loaded/verified server-side; do not rely solely on a stale token role or client-supplied hotel ID.

Any auth claim change requires web, partner, admin, mobile and middleware review.

## 6. Booking state contract

All transitions go through one domain function/service. Direct table updates from unrelated actions are prohibited.

A transition record includes:

- booking ID;
- previous and next state;
- actor/system;
- reason;
- request/idempotency ID;
- occurred time;
- relevant payment/inventory references.

Illegal transitions return stable domain errors and do not partially update inventory/payment.

## 7. Money contract

A persisted booking calculation should include version and exact line items. Example:

```ts
interface BookingCalculationV1 {
  currency: string;
  nights: Array<{ date: string; amountMinor: number }>;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  feeMinor: number;
  totalMinor: number;
  walletAppliedMinor: number;
  externalPayableMinor: number;
  commissionRateBasisPoints: number;
  commissionMinor: number;
  hotelNetMinor: number;
  policyVersion: string;
}
```

The database/provider integration, not UI formatting, owns currency and rounding.

## 8. Payment contract

Recommended entities:

- payment attempt;
- provider event;
- refund;
- settlement/reconciliation record.

Required uniqueness:

- one internal idempotency key per logical attempt;
- provider intent/reference indexed;
- provider webhook event ID unique;
- transition handlers replay-safe.

Provider webhook event data is verified and reconciled against persisted authoritative values before state changes.

## 9. Inventory contract

Availability lookup is advisory. Allocation is authoritative and atomic.

Every channel calls the same allocation operation with:

- inventory unit/rate plan;
- stay range;
- quantity/guests;
- source and external reference;
- idempotency key;
- actor/hotel scope.

Database constraints or atomic inventory rows guarantee capacity cannot go below zero or overlap beyond capacity.

## 10. Realtime/event contract

Envelope:

```ts
interface DomainEvent<T> {
  id: string;
  type: string;
  version: number;
  aggregateId: string;
  hotelId?: string;
  occurredAt: string;
  correlationId: string;
  payload: T;
}
```

Events contain no unnecessary PII. Consumers ignore unknown additive fields and route by type/version. Realtime delivery is at-least-once; consumers deduplicate and refresh durable state.

## 11. Environment contract

Every variable is registered with:

- name;
- owning component;
- server-only/public;
- required/optional;
- environments;
- validation rule;
- rotation owner;
- source/provider.

Application startup/build must fail clearly when required variables are absent. Secret values are never committed.

## 12. Localisation contract

- English and Bengali ARB/translation keys are added together.
- Generated files are produced by the standard generator, not manually edited.
- API/domain error codes are stable; clients map safe messages through localisation.
- Currency/date/number formatting uses locale-aware utilities.

## 13. Compatibility testing

For shared changes, test:

- old client with new server where support is promised;
- new client with current server during staged rollout where relevant;
- migration from current database data;
- replay/retry behaviour;
- multi-app build against the new shared package;
- failure before dependent deployment completes.

## 14. Contract removal

Temporary compatibility code must have:

- owner;
- removal issue/workstream;
- earliest removal release/date;
- telemetry/evidence proving old consumers are gone.

Do not leave indefinite dual behaviour.