import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

const allocation = await import(
  "../../apps/web/lib/reservation-allocation-policy.ts"
);

test("candidate ordering keeps the requested room first and is deterministic", () => {
  assert.deepEqual(
    allocation.orderReservationCandidates("room-b", [
      "room-c",
      "room-a",
      "room-b",
      "room-c",
    ]),
    ["room-b", "room-a", "room-c"],
  );
});

test("reservation conflict detection handles domain and PostgreSQL race errors", () => {
  assert.equal(
    allocation.isReservationConflict(new allocation.ReservationConflictError()),
    true,
  );
  assert.equal(
    allocation.isReservationConflict({ cause: { code: "23P01" } }),
    true,
  );
  assert.equal(allocation.isReservationConflict({ code: "40P01" }), true);
  assert.equal(allocation.isReservationConflict({ code: "23514" }), false);
});

test("customer creation resolves candidates on the server and locks before wallet mutation", async () => {
  const creation = await read("apps/web/lib/booking-creation-service.ts");
  const reservation = await read("apps/web/lib/reservation-allocation.ts");

  assert.match(creation, /loadReservationCandidates\(db,/);
  assert.match(creation, /allowRoomTypeAllocation: Boolean\(input\.roomIds\?\.length\)/);
  assert.doesNotMatch(creation, /for \(const candidateRoomId of \[\.\.\.new Set\(input\.roomIds\)/);
  assert.match(reservation, /eq\(rooms\.hotelId, requestedRoom\.hotelId\)/);
  assert.match(reservation, /eq\(rooms\.type, requestedRoom\.type\)/);

  const allocationIndex = creation.indexOf("await lockAndAssertRoomAvailable");
  const walletIndex = creation.indexOf("booking-wallet:");
  const insertIndex = creation.indexOf(".insert(bookings)");
  assert.ok(allocationIndex >= 0, "allocation lock must exist");
  assert.ok(walletIndex > allocationIndex, "room allocation must precede wallet mutation");
  assert.ok(insertIndex > walletIndex, "booking insert must follow allocation and wallet locks");
});

test("room-type attempts use independent transactions and stable conflict responses", async () => {
  const creation = await read("apps/web/lib/booking-creation-service.ts");
  const api = await read("apps/web/app/api/bookings/route.ts");

  assert.match(creation, /for \(const candidateRoomId of candidates\)/);
  assert.match(creation, /result = await createBookingAttempt\(candidateRoomId\)/);
  assert.match(creation, /return db\.transaction\(async \(tx:/);
  assert.match(creation, /errorCode: reservationConflict \? "RESERVATION_CONFLICT"/);
  assert.match(api, /status: reservationConflict \? 409 : 400/);
  assert.match(api, /code: result\.errorCode/);
});

test("schema and migration express half-open physical-room invariants", async () => {
  const schema = await read("packages/db/src/schema/business.ts");
  const migration = await read(
    "packages/db/drizzle/0020_atomic_reservation_allocation.sql",
  );

  assert.match(schema, /check\("bookings_valid_stay"/);
  assert.match(migration, /CREATE EXTENSION IF NOT EXISTS "btree_gist"/);
  assert.match(migration, /bookings_room_stay_no_overlap/);
  assert.match(migration, /daterange\("checkIn", "checkOut", '\[\)'\) WITH &&/);
  assert.match(migration, /WHERE \("status" <> 'CANCELLED'\)/);
});

test("temporary RSV-01 workflows are absent", async () => {
  for (const workflow of [
    ".github/workflows/rsv01-generate-migration.yml",
    ".github/workflows/rsv01-source-snapshot.yml",
    ".github/workflows/rsv01-patch.yml",
    ".github/workflows/rsv01-minimize-schema-diff.yml",
  ]) {
    assert.equal(await exists(workflow), false, `${workflow} must be absent`);
  }
});
