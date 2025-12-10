import { z } from "zod";

// Booking validation schemas
export const createBookingSchema = z.object({
    roomId: z.string().uuid(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guestCount: z.number().int().min(1).max(10),
    guestName: z.string().min(2).max(100),
    guestPhone: z.string().min(10).max(20),
    guestEmail: z.string().email().optional(),
    paymentMethod: z.enum(["BKASH", "NAGAD", "CARD", "PAY_AT_HOTEL"]),
    notes: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
    bookingId: z.string().uuid(),
    status: z.enum([
        "PENDING",
        "CONFIRMED",
        "CHECKED_IN",
        "CHECKED_OUT",
        "CANCELLED",
    ]),
});

export const cancelBookingSchema = z.object({
    bookingId: z.string().uuid(),
    reason: z.string().max(500).optional(),
});

// Booking state machine transitions
export const BOOKING_STATUS_TRANSITIONS = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CHECKED_IN", "CANCELLED"],
    CHECKED_IN: ["CHECKED_OUT"],
    CHECKED_OUT: [], // Terminal state
    CANCELLED: [], // Terminal state
} as const;

export type BookingStatus = keyof typeof BOOKING_STATUS_TRANSITIONS;

/**
 * Validates if a booking status transition is allowed
 */
export function isValidStatusTransition(
    currentStatus: BookingStatus,
    newStatus: BookingStatus
): boolean {
    const allowedTransitions = BOOKING_STATUS_TRANSITIONS[currentStatus];
    return (allowedTransitions as readonly string[]).includes(newStatus);
}

/**
 * Calculate commission for a booking
 * @param totalAmount - Total booking amount
 * @param commissionRate - Commission rate as percentage (e.g., 20 for 20%)
 */
export function calculateCommission(
    totalAmount: number,
    commissionRate: number = 20
): number {
    return Number(((totalAmount * commissionRate) / 100).toFixed(2));
}

/**
 * Calculate total nights between check-in and check-out dates
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Type exports
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
