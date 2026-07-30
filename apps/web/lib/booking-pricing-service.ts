import { db } from "@repo/db";
import { bookings, hotels, roomInventory, rooms } from "@repo/db/schema";
import { and, count, eq, gte, lt, ne } from "drizzle-orm";
import {
    calculateBookingAmounts,
    enumerateStayDates,
    getBookingPricingPolicy,
    type BookingCalculationResult,
    type CustomerPaymentMethod,
    type NightlyRateInput,
} from "./booking-calculation";

export type BookingSource = "WEB" | "MOBILE";

export interface AuthoritativeBookingCalculationInput {
    hotelId: string;
    roomId: string;
    userId: string;
    checkIn: string;
    checkOut: string;
    paymentMethod: CustomerPaymentMethod;
    source: BookingSource;
    walletBalance: string | number;
    useWalletBalance?: boolean;
    requestedWalletAmount?: string | number;
}

export interface AuthoritativeBookingCalculation {
    numberOfNights: number;
    room: {
        id: string;
        hotelId: string;
        name: string;
    };
    hotel: {
        id: string;
        name: string;
        commissionRate: string;
    };
    calculation: BookingCalculationResult;
}

type InventoryRateRow = {
    date: string;
    status: "AVAILABLE" | "OCCUPIED" | "BLOCKED";
    price: string | null;
};

export async function calculateAuthoritativeBooking(
    tx: typeof db,
    input: AuthoritativeBookingCalculationInput,
): Promise<AuthoritativeBookingCalculation> {
    const stayDates = enumerateStayDates(input.checkIn, input.checkOut);

    const [roomHotel] = await tx
        .select({
            roomId: rooms.id,
            roomHotelId: rooms.hotelId,
            roomName: rooms.name,
            basePrice: rooms.basePrice,
            roomIsActive: rooms.isActive,
            hotelId: hotels.id,
            hotelName: hotels.name,
            hotelStatus: hotels.status,
            commissionRate: hotels.commissionRate,
        })
        .from(rooms)
        .innerJoin(hotels, eq(hotels.id, rooms.hotelId))
        .where(and(eq(rooms.id, input.roomId), eq(hotels.id, input.hotelId)))
        .limit(1);

    if (!roomHotel || !roomHotel.roomIsActive || roomHotel.hotelStatus !== "ACTIVE") {
        throw new Error("Room is not available for booking");
    }

    const inventoryRows: InventoryRateRow[] = await tx
        .select({
            date: roomInventory.date,
            status: roomInventory.status,
            price: roomInventory.price,
        })
        .from(roomInventory)
        .where(
            and(
                eq(roomInventory.roomId, input.roomId),
                gte(roomInventory.date, input.checkIn),
                lt(roomInventory.date, input.checkOut),
            ),
        );

    const inventoryByDate = new Map<string, InventoryRateRow>(
        inventoryRows.map((row: InventoryRateRow) => [row.date, row]),
    );
    const nightlyRates: NightlyRateInput[] = stayDates.map((date) => {
        const inventory = inventoryByDate.get(date);
        if (inventory && inventory.status !== "AVAILABLE") {
            throw new Error(`Room is unavailable on ${date}`);
        }
        return {
            date,
            price: inventory?.price ?? roomHotel.basePrice,
            source: inventory?.price ? "INVENTORY_OVERRIDE" : "BASE",
        };
    });

    let firstBookingEligible = false;
    if (input.source === "MOBILE") {
        const [existing] = await tx
            .select({ value: count() })
            .from(bookings)
            .where(
                and(
                    eq(bookings.userId, input.userId),
                    ne(bookings.status, "CANCELLED"),
                ),
            );
        firstBookingEligible = Number(existing?.value ?? 0) === 0;
    }

    const policy = getBookingPricingPolicy();
    const calculation = calculateBookingAmounts({
        nightlyRates,
        commissionRatePercent: roomHotel.commissionRate,
        taxRatePercent: policy.taxRatePercent,
        firstBookingDiscountPercent: firstBookingEligible
            ? policy.firstBookingDiscountPercent
            : 0,
        firstBookingDiscountCap: firstBookingEligible
            ? policy.firstBookingDiscountCap
            : 0,
        paymentMethod: input.paymentMethod,
        walletBalance: input.walletBalance,
        useWalletBalance: input.useWalletBalance,
        requestedWalletAmount: input.requestedWalletAmount,
    });

    return {
        numberOfNights: stayDates.length,
        room: {
            id: roomHotel.roomId,
            hotelId: roomHotel.roomHotelId,
            name: roomHotel.roomName,
        },
        hotel: {
            id: roomHotel.hotelId,
            name: roomHotel.hotelName,
            commissionRate: roomHotel.commissionRate,
        },
        calculation,
    };
}
