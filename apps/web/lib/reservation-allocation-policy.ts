export const RESERVATION_CONFLICT_CODE = "RESERVATION_CONFLICT";
const POSTGRES_EXCLUSION_VIOLATION = "23P01";

export class ReservationConflictError extends Error {
    readonly code = RESERVATION_CONFLICT_CODE;

    constructor(message = "No room is available for the selected dates.") {
        super(message);
        this.name = "ReservationConflictError";
    }
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
