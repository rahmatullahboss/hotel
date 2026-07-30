import { db } from "@repo/db";
import { bookings, roomInventory, rooms } from "@repo/db/schema";
import { and, asc, eq, gt, gte, lt, ne, sql } from "drizzle-orm";

export const RESERVATION_CONFLICT_CODE = "RESERVATION_CONFLICT";
const POSTGRES_EXCLUSION_VIOLATION = "23P01";

export class ReservationConflictError extends Error {
    readonly code = RESERVATION_CONFLICT_CODE;

    constructor(message = "No room is available for the selected dates.") {
        super(message);
        this.name = "ReservationConflictError";
    }
}

interface ReservationCandidateInput {
    hotelId: string;
    requestedRoomId: string;
    allowRoomTypeAllocation: boolean;
}

interface LockReservationInput {
    roomId: string;
    checkIn: string;
    checkOut: string;
}

interface PostgresErrorLike {
    code?: unknown;
    cause?: unknown;
}

function postgresErrorCode(error: unknown): string | undefined {
    let current: unknown = error;
    const seen = new Set<unknown>();

    while (current && typeof current === "object" && !seen.has(current)) {
        seen.add(current);
        const candidate = current as PostgresErrorLike;
        if (typeof candidate.code === "string") return candidate.code;
        current = candidate.cause;
    }

    return undefined;
}

export function isReservationConflict(error: unknown): boolean {
    return (
        error instanceof ReservationConflictError ||
        postgresErrorCode(error) === POSTGRES_EXCLUSION_VIOLATION
    );
}

export function orderReservationCandidates(
    requestedRoomId: string,
    candidateRoomIds: readonly string[],
): string[] {
    const unique = [...new Set(candidateRoomIds)].sort((left, right) =>
        left.localeCompare(right),
    );
    return [requestedRoomId, ...unique.filter((roomId) => roomId !== requestedRoomId)];
}

/**
 * Resolve reservation candidates from database-owned hotel/type membership.
 * Client roomIds only express room-type allocation intent; their values are not trusted.
 */
export async function loadReservationCandidates(
    database: typeof db,
    input: ReservationCandidateInput,
): Promise<string[]> {
    const [requestedRoom] = await database
        .select({
            id: rooms.id,
            hotelId: rooms.hotelId,
            type: rooms.type,
            isActive: rooms.isActive,
        })
        .from(rooms)
        .where(
            and(
                eq(rooms.id, input.requestedRoomId),
                eq(rooms.hotelId, input.hotelId),
                eq(rooms.isActive, true),
            ),
        )
        .limit(1);

    if (!requestedRoom) {
        throw new ReservationConflictError("The selected room is not reservable.");
    }

    if (!input.allowRoomTypeAllocation) {
        return [requestedRoom.id];
    }

    const roomTypeCandidates = await database
        .select({ id: rooms.id })
        .from(rooms)
        .where(
            and(
                eq(rooms.hotelId, requestedRoom.hotelId),
                eq(rooms.type, requestedRoom.type),
                eq(rooms.isActive, true),
            ),
        )
        .orderBy(asc(rooms.id));

    return orderReservationCandidates(
        requestedRoom.id,
        roomTypeCandidates.map((candidate) => candidate.id),
    );
}

/**
 * Serialize cooperative writers for one physical room, then perform the same
 * half-open overlap predicate enforced by the PostgreSQL exclusion constraint.
 */
export async function lockAndAssertRoomAvailable(
    tx: typeof db,
    input: LockReservationInput,
): Promise<void> {
    await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${`reservation-room:${input.roomId}`}, 0))`,
    );

    const existingBooking = await tx.query.bookings.findFirst({
        columns: { id: true },
        where: and(
            eq(bookings.roomId, input.roomId),
            ne(bookings.status, "CANCELLED"),
            lt(bookings.checkIn, input.checkOut),
            gt(bookings.checkOut, input.checkIn),
        ),
    });

    if (existingBooking) {
        throw new ReservationConflictError();
    }

    const unavailableInventory = await tx.query.roomInventory.findFirst({
        columns: { id: true },
        where: and(
            eq(roomInventory.roomId, input.roomId),
            gte(roomInventory.date, input.checkIn),
            lt(roomInventory.date, input.checkOut),
            ne(roomInventory.status, "AVAILABLE"),
        ),
    });

    if (unavailableInventory) {
        throw new ReservationConflictError();
    }
}
