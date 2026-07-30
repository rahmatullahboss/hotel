# Reservation Allocation and Concurrency

Status: accepted for `RSV-01`

## Context

The repository models each row in `rooms` as a physical sellable room and each booking stores one non-null physical `roomId`. The customer web flow can pass a list of room IDs for room-type auto-assignment, but request candidates are not a trustworthy inventory source. The current implementation performs a read-before-insert overlap query inside a default transaction; two concurrent transactions can both observe no booking and insert overlapping reservations.

## Decision

ZinuRooms will reserve physical rooms. Room-type booking is a server-side selection policy over active physical rooms that share the requested room's hotel and type.

The requested `roomId` establishes the hotel and room type. Client `roomIds` are compatibility hints only: their values do not expand the server-authorized candidate set and cannot select a different hotel or type.

A stay occupies the half-open date range `[checkIn, checkOut)`. Therefore a checkout date may equal another booking's check-in date without conflict.

## Database invariant

PostgreSQL is the final authority. Migration `0020_atomic_reservation_allocation` will:

1. install the trusted `btree_gist` extension when absent;
2. add a check constraint requiring `checkIn < checkOut`;
3. add a partial GiST exclusion constraint preventing rows with the same `roomId` from having overlapping `daterange(checkIn, checkOut, '[)')` values while status is not `CANCELLED`.

`PENDING`, `CONFIRMED`, `CHECKED_IN` and `CHECKED_OUT` rows participate in the constraint. A pending reservation therefore holds inventory until it is cancelled/expired. Expiry state transitions belong to `RSV-02`.

The exclusion constraint protects customer, partner, OTA, import and future write paths even when they do not call the shared allocation service.

## Transaction strategy

Customer allocation runs in the existing booking transaction before wallet debit and booking insert.

### Exact-room request

- acquire a transaction-scoped advisory lock derived from the physical room ID;
- check the authoritative overlap predicate;
- return a conflict when occupied;
- continue pricing and insertion while the lock remains held until commit/rollback.

### Room-type request

- load active rooms from the same hotel and room type on the server;
- prioritize the originally selected room, then use deterministic room ID order;
- try a transaction-scoped advisory lock for each candidate without waiting;
- skip a busy or overlapping candidate;
- choose the first locked, available physical room;
- fail when no candidate can be allocated.

The advisory lock avoids avoidable collisions between cooperative application writers. The exclusion constraint remains the correctness boundary and maps PostgreSQL SQLSTATE `23P01` to a stable reservation-conflict response.

## Failure and retry behavior

- No automatic retry occurs after wallet mutation; allocation happens before wallet debit.
- An exclusion violation rolls back the complete transaction, including wallet and booking writes.
- Callers receive a non-sensitive availability error rather than raw PostgreSQL details.
- The system does not silently switch hotel or room type.

## Verification

`RSV-01` requires:

- unit tests for exact-room and room-type candidate policy;
- source contract tests proving all customer creation uses the allocation service;
- an ephemeral PostgreSQL integration test applying all migrations and proving:
  - two concurrent overlapping inserts for one room produce exactly one success;
  - adjacent `[)` stays both succeed;
  - a cancelled booking does not block a replacement;
  - invalid zero/negative stays are rejected;
- database migration history, drift and second-run no-op checks;
- customer web type-check and relevant lint.

## Compatibility and rollout

The product has no active production booking history. No overlap cleanup/backfill is required before adding the constraints. Seed or test data must nevertheless satisfy the new invariant.

Existing booking response shapes remain unchanged. A room-type request may return a different physical `roomId` internally, as before; the booking record and QR code persist the actual allocated room.

## Follow-ups

- `RSV-02` owns expiry, cancellation, refund and inventory-release state transitions.
- Room-type quantity/allotment inventory would require a separate aggregate inventory model; it is not introduced implicitly in this physical-room workstream.
- PAY-02 may consume the allocated booking ID but must not create an independent reservation.
