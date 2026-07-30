# ZinuRooms System Context and Architecture

## 1. System purpose

ZinuRooms serves three operational audiences:

1. travellers searching and booking accommodation;
2. hotel organisations managing properties and day-to-day operations;
3. ZinuRooms platform administrators governing hotels, users, commissions, payouts, promotions and support.

The active mobile client is Flutter. The web platform is a TypeScript/Turborepo modular monolith split into independently deployable applications with shared database/domain packages.

## 2. Runtime components

```text
Traveller browser ───────► apps/web (Next.js)
Flutter Android/iOS ─────► apps/web Route Handlers (mobile API)
Hotel staff browser ─────► apps/partner (Next.js)
Platform admin browser ──► apps/admin (Next.js)

web / partner / admin ───► packages/db ───► Neon PostgreSQL
web / partner / admin ───► Stripe / Firebase / email / object storage
web / partner ───────────► packages/realtime ─► Cloudflare Worker + Durable Objects
GitHub schedules ────────► authenticated cron Route Handlers
```

Current deployment baseline:

- customer web, partner and admin: Vercel;
- PostgreSQL: Neon;
- realtime WebSocket: Cloudflare Worker/Durable Objects;
- mobile push: Firebase Cloud Messaging;
- payment: Stripe, with legacy/config placeholders for other gateways;
- media: current Vercel Blob coupling in partner dependencies.

## 3. Application boundaries

### `apps/web`

Owns:

- public hotel discovery and SEO pages;
- traveller identity/session and mobile JWT endpoints;
- customer booking/profile/wallet flows;
- external/mobile Route Handlers;
- payment provider integration and webhook endpoints;
- customer-facing notifications.

Must not own hotel-internal permission decisions without checking partner membership data.

### `apps/partner`

Owns:

- property onboarding and configuration;
- room/rate/inventory operations;
- reservations, walk-ins, check-in/out and guest service;
- hotel-scoped staff/RBAC;
- housekeeping, maintenance and internal reports;
- OTA/channel controls and hotel revenue views.

Every operation is tenant-scoped by hotel ID and verified membership/permission.

### `apps/admin`

Owns:

- platform-level roles;
- hotel review/approval/suspension;
- user and content governance;
- commission/payout/promotion policies;
- support/moderation/platform analytics;
- system-wide configuration.

Admin access must never be inferred from route location or UI visibility alone.

### `apps/mobile-flutter`

Owns presentation, local state, secure credential storage and calling the published customer API.

It does not own business truth for price, availability, wallet, promotion, payment or booking state.

### `packages/db`

Owns schema, database client, committed migrations and persistence contracts.

It must not contain app-specific UI or HTTP concerns.

### `packages/api`

Preferred home for reusable domain policies and typed contracts used by more than one application. New cross-app business rules should not be copied into separate server actions.

### `packages/realtime`

Transports committed domain events to connected clients. It must not become the source of truth; clients recover current state from PostgreSQL/API after reconnect.

## 4. Core domain invariants

### Hotel and tenant

- A hotel belongs to an owner/organisation.
- Staff access is explicit and role/permission-based.
- A user with access to Hotel A has no implied access to Hotel B.
- Platform admin privileges are separate from hotel staff privileges.

### Room and inventory

- A physical room or room-type allotment must have one canonical allocation model.
- Active reservations may not overlap the same inventory unit.
- Blocked/maintenance inventory cannot be sold.
- Platform, walk-in and OTA reservations use the same availability/allocation service.

### Booking state

Recommended canonical state machine:

```text
HOLD/PENDING_PAYMENT
  ├─ payment confirmed ─► CONFIRMED
  ├─ hold expired ──────► EXPIRED
  └─ cancelled ─────────► CANCELLED

CONFIRMED
  ├─ guest arrives ─────► CHECKED_IN
  ├─ cancelled/refund ──► CANCELLED
  └─ no-show policy ────► NO_SHOW

CHECKED_IN ── checkout ─► CHECKED_OUT
```

Transitions must be validated centrally and auditable. Do not let pages/actions update arbitrary status strings independently.

### Money

Persist an immutable calculation breakdown for every booking/payment attempt:

- currency;
- nightly lines;
- taxes/fees;
- promotion discount;
- wallet use;
- customer payable;
- commission rate and amount;
- hotel net amount;
- provider reference and settlement state.

Money is represented in a fixed smallest unit or an exact decimal policy; never floating-point business calculations.

### Payment

- provider intent is created from persisted server calculation;
- each request has an idempotency identity;
- provider webhook is authoritative for asynchronous success/failure;
- processed provider events are unique and replay-safe;
- refunds and disputes are separate auditable operations;
- booking and payment states cannot silently diverge.

### Wallet

- wallet entries form an immutable ledger;
- balance is derived or updated atomically with ledger insertion;
- concurrent deductions cannot overspend;
- reversals create new entries rather than deleting history.

## 5. Trust boundaries

Treat all of these as untrusted input:

- browser and mobile request bodies;
- URL/search parameters;
- cookies and bearer tokens until verified;
- uploaded media/documents;
- OTA and payment webhooks until signature/credential validation;
- scheduled HTTP calls;
- realtime push requests;
- environment variables until startup validation.

Server-side validation order:

1. parse and validate shape;
2. authenticate actor/system;
3. authorise action and tenant scope;
4. load current server state;
5. calculate authoritative values;
6. execute transaction/idempotent side effect;
7. write audit/outbox records;
8. return a stable response contract.

## 6. API contract rules

- External/mobile endpoints use Route Handlers and versioned typed schemas.
- Same-app forms may use Server Actions.
- Response envelopes and error codes are stable and documented.
- Clients do not implement multiple guessed response shapes.
- Contract changes are additive first; removal/breaking changes require versioning and migration period.
- Sensitive server exceptions are logged with correlation IDs but not returned verbatim.

## 7. Event model

Recommended domain events:

- `booking.created`
- `booking.confirmed`
- `booking.expired`
- `booking.cancelled`
- `guest.checked_in`
- `guest.checked_out`
- `payment.intent_created`
- `payment.succeeded`
- `payment.failed`
- `refund.created`
- `inventory.changed`
- `hotel.status_changed`

Events include version, event ID, aggregate ID, hotel ID where applicable, occurred time and minimal non-sensitive payload. Persist them through an outbox in the same database transaction as state changes.

## 8. Caching and rendering

- Server Components are the default for Next.js pages.
- Dynamic rendering is intentional, not applied globally without need.
- Cache invalidation follows domain writes and documented tags/paths.
- Realtime messages prompt refresh/invalidation; they do not replace durable state.
- If the platform later runs multiple self-hosted Next.js instances, configure shared cache coordination and a stable Server Action encryption key.

Reference: https://nextjs.org/docs/app/guides/self-hosting

## 9. Portability position

The stack does not require Vercel. Portability work should preserve:

- standard Next.js `build`/`start` and standalone output;
- provider-neutral storage interface;
- explicit environment contract;
- Neon kept external or replaceable PostgreSQL;
- Docker images for web/partner/admin;
- Cloudflare DNS/CDN optional in front of Vercel or future containers.

No framework rewrite is planned solely for hosting cost concerns.