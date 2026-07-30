import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Client } from "pg";

const connectionString =
  process.env.DATABASE_DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/zinurooms_rsv_ci";

const ownerId = `rsv-owner-${randomUUID()}`;
const hotelId = `rsv-hotel-${randomUUID()}`;
const rooms = {
  overlap: `rsv-room-overlap-${randomUUID()}`,
  adjacent: `rsv-room-adjacent-${randomUUID()}`,
  cancelled: `rsv-room-cancelled-${randomUUID()}`,
  invalid: `rsv-room-invalid-${randomUUID()}`,
};

const admin = new Client({ connectionString });

async function insertBooking(client, { id, roomId, checkIn, checkOut, status = "PENDING" }) {
  await client.query(
    `INSERT INTO "bookings" (
      "id", "hotelId", "roomId", "checkIn", "checkOut",
      "guestName", "guestPhone", "status",
      "totalAmount", "commissionAmount", "netAmount"
    ) VALUES ($1, $2, $3, $4, $5, 'RSV-01 Guest', '01700000000', $6, '100.00', '10.00', '90.00')`,
    [id, hotelId, roomId, checkIn, checkOut, status],
  );
}

test.before(async () => {
  await admin.connect();
  await admin.query(
    `INSERT INTO "users" ("id", "name", "email", "role")
     VALUES ($1, 'RSV-01 Owner', $2, 'HOTEL_OWNER')`,
    [ownerId, `${ownerId}@example.test`],
  );
  await admin.query(
    `INSERT INTO "hotels" (
      "id", "ownerId", "name", "address", "city", "status"
     ) VALUES ($1, $2, 'RSV-01 Hotel', 'Test Road', 'Test City', 'ACTIVE')`,
    [hotelId, ownerId],
  );

  let roomNumber = 1;
  for (const roomId of Object.values(rooms)) {
    await admin.query(
      `INSERT INTO "rooms" (
        "id", "hotelId", "roomNumber", "name", "type", "basePrice", "isActive"
       ) VALUES ($1, $2, $3, $4, 'DOUBLE', '100.00', true)`,
      [roomId, hotelId, String(roomNumber), `Room ${roomNumber}`],
    );
    roomNumber += 1;
  }
});

test.after(async () => {
  await admin.query(`DELETE FROM "hotels" WHERE "id" = $1`, [hotelId]);
  await admin.query(`DELETE FROM "users" WHERE "id" = $1`, [ownerId]);
  await admin.end();
});

test("two concurrent overlapping inserts produce exactly one reservation", async () => {
  const first = new Client({ connectionString });
  const second = new Client({ connectionString });
  await Promise.all([first.connect(), second.connect()]);

  try {
    const results = await Promise.allSettled([
      insertBooking(first, {
        id: `rsv-overlap-a-${randomUUID()}`,
        roomId: rooms.overlap,
        checkIn: "2030-01-10",
        checkOut: "2030-01-12",
      }),
      insertBooking(second, {
        id: `rsv-overlap-b-${randomUUID()}`,
        roomId: rooms.overlap,
        checkIn: "2030-01-11",
        checkOut: "2030-01-13",
      }),
    ]);

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(
      ["23P01", "40P01"].includes(rejected[0].reason?.code),
      `unexpected PostgreSQL conflict code: ${rejected[0].reason?.code}`,
    );
  } finally {
    await Promise.all([first.end(), second.end()]);
  }
});

test("adjacent half-open stays can share a checkout/check-in date", async () => {
  await insertBooking(admin, {
    id: `rsv-adjacent-a-${randomUUID()}`,
    roomId: rooms.adjacent,
    checkIn: "2030-02-01",
    checkOut: "2030-02-03",
  });
  await insertBooking(admin, {
    id: `rsv-adjacent-b-${randomUUID()}`,
    roomId: rooms.adjacent,
    checkIn: "2030-02-03",
    checkOut: "2030-02-05",
  });

  const { rows } = await admin.query(
    `SELECT count(*)::int AS count FROM "bookings" WHERE "roomId" = $1`,
    [rooms.adjacent],
  );
  assert.equal(rows[0].count, 2);
});

test("a cancelled booking does not block a replacement stay", async () => {
  await insertBooking(admin, {
    id: `rsv-cancelled-a-${randomUUID()}`,
    roomId: rooms.cancelled,
    checkIn: "2030-03-01",
    checkOut: "2030-03-05",
    status: "CANCELLED",
  });
  await insertBooking(admin, {
    id: `rsv-cancelled-b-${randomUUID()}`,
    roomId: rooms.cancelled,
    checkIn: "2030-03-02",
    checkOut: "2030-03-04",
  });

  const { rows } = await admin.query(
    `SELECT count(*)::int AS count FROM "bookings" WHERE "roomId" = $1`,
    [rooms.cancelled],
  );
  assert.equal(rows[0].count, 2);
});

test("zero-length and reverse stays are rejected by PostgreSQL", async () => {
  for (const [checkIn, checkOut] of [
    ["2030-04-01", "2030-04-01"],
    ["2030-04-02", "2030-04-01"],
  ]) {
    await assert.rejects(
      () =>
        insertBooking(admin, {
          id: `rsv-invalid-${randomUUID()}`,
          roomId: rooms.invalid,
          checkIn,
          checkOut,
        }),
      (error) => error?.code === "23514",
    );
  }
});
