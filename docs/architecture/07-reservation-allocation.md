# Reservation Allocation and Concurrency

Status: accepted for `RSV-01`

## Context

The repository models each row in `rooms` as a physical sellable room and each booking stores one non-null physical `roomId`. The customer web flow can pass a list of room IDs for room-type auto-assignment, but request candidates are not a trustworthy inventory source. The previous implementation performed a read-before-insert overlap query inside a default transaction; two concurrent transactions could both observe no booking and insert overlapping reservations.

## Decision

ZinuRooms reserves physical rooms. Room-type booking is a server-side selection policy over active physical rooms that share the requested room's hotel and type.

The requested `roomId` establishes the hotel and room type. Client `roomIds` are compatibility hints only: their values do not expand the server-authorized candidate set and cannot select a different hotel or type.

A stay occupies the half-open date range `[checkIn, checkOut)`. Therefore a checkout date may equal another booking's check-in date without conflict.

## Database invariant

PostgreSQL is the final authority. Migration `0020_atomic_reservation_allocation`:

1. installs the trusted `btree_gist` extension when absent;
2. adds a check constraint requiring `checkIn < checkOut`;
3. adds a partial GiST exclusion constraint preventing rows with the same `roomId` from having overlapping `daterange(checkIn, checkOut, '[)')` values while status is not `CANCELLED`.

`PENDING`, `CONFIRMED`, `CHECKED_IN` and `CHECKED_OUT` rows participate in the constraint. A pending reservation therefore holds inventory until it is cancelled or expired. Expiry state transitions belong to `RSV-02`.

The exclusion constraint protects customer, partner, OTA, import and future write paths even when they do not call the shared allocation service.

## Transaction strategy

Customer allocation occurs before wallet debit and booking insert.

### Exact-room request

- resolve and validate the requested active room from the database;
- start one booking transaction;
- acquire a transaction-scoped advisory lock derived from the physical room ID;
- check booking overlap and blocked/occupied daily inventory;
- continue pricing, wallet and insertion while the lock remains held until commit or rollback.

### Room-type request

- load active rooms from the same hotel and room type on the server;
- prioritize the originally selected room, then use deterministic room ID order;
- execute one fresh transaction per physical candidate;
- acquire that candidate's transaction-scoped advisory lock and check authoritative availability;
- roll back the complete attempt on conflict, then try the next candidate;
- fail when no server-authorized candidate can be allocated.

A fresh transaction per candidate prevents wallet or booking mutations from leaking out of a failed attempt and avoids retaining multiple room locks. The advisory lock removes avoidable collisions between cooperative application writers. The exclusion constraint remains the correctness boundary for every writer.

## Failure and retry behavior

- Allocation occurs before wallet debit.
- Exclusion violations roll back the complete transaction, including wallet and booking writes.
- PostgreSQL SQLSTATE `23P01` (exclusion violation) and the observed simultaneous-insert SQLSTATE `40P01` (deadlock) are classified as reservation conflicts at this boundary.
- Room-type mode may continue with the next candidate after either conflict; exact-room mode returns a stable conflict.
- Callers receive HTTP `409` with `RESERVATION_CONFLICT`, not raw PostgreSQL details.
- The system does not silently switch hotel or room type.

## Verification

`RSV-01` requires:

- unit tests for candidate ordering and PostgreSQL conflict classification;
- source contract tests proving all customer creation uses the allocation service;
- an ephemeral PostgreSQL integration test applying all migrations and proving:
  - two simultaneous overlapping inserts for one room produce exactly one success;
  - adjacent `[)` stays both succeed;
  - a cancelled booking does not block a replacement;
  - invalid zero or negative stays are rejected;
- database migration history, drift and second-run no-op checks;
- customer web type-check and zero-warning lint.

## Compatibility and rollout

The product has no active production booking history. No overlap cleanup or backfill is required before adding the constraints. Seed and test data must satisfy the new invariant.

Existing success response shapes remain unchanged. Conflict responses gain the stable `RESERVATION_CONFLICT` code. A room-type request may persist a different physical `roomId`, as before; the booking record and QR code contain the actual allocated room.

## Follow-ups

- `RSV-02` owns expiry, cancellation, refund and inventory-release state transitions.
- Room-type quantity/allotment inventory would require a separate aggregate inventory model; it is not introduced implicitly in this physical-room workstream.
- PAY-02 may consume the allocated booking ID but must not create an independent reservation.
