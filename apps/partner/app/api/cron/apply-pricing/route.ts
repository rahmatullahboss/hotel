/**
 * Dynamic Pricing Cron Job
 *
 * Automatically applies dynamic pricing rules to room inventory.
 * Runs daily to update prices for the next 90 days based on:
 * - Day of week (weekend premiums)
 * - Hotel occupancy levels
 * - Lead time (last-minute/early-bird)
 * - Seasonal factors
 *
 * Endpoint: POST /api/cron/apply-pricing
 *
 * Expected CRON_SECRET header for authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, hotels, rooms, roomInventory, bookings, seasonalRules } from "@repo/db";
import { eq, and, gte, lte, count } from "drizzle-orm";
import { calculateDynamicPrice, type SeasonalRule } from "@repo/api";

// Vercel Cron configuration
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");

    if (process.env.NODE_ENV === "production") {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    return applyDynamicPricing();
}

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("authorization");

    if (process.env.NODE_ENV === "production") {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    return applyDynamicPricing();
}

async function applyDynamicPricing() {
    const startTime = Date.now();
    const results: {
        hotelId: string;
        hotelName: string;
        roomsUpdated: number;
        datesUpdated: number;
        error?: string;
    }[] = [];

    try {
        // Get all active hotels
        const activeHotels = await db
            .select({
                id: hotels.id,
                name: hotels.name,
            })
            .from(hotels)
            .where(eq(hotels.status, "ACTIVE"));

        console.log(`[Pricing] Found ${activeHotels.length} active hotels`);

        // Get active seasonal rules
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]!;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 90);
        const endDateStr = endDate.toISOString().split("T")[0]!;

        const activeSeasonalRules = await db
            .select()
            .from(seasonalRules)
            .where(
                and(
                    eq(seasonalRules.isActive, true),
                    lte(seasonalRules.startDate, endDateStr),
                    gte(seasonalRules.endDate, todayStr)
                )
            );

        const seasonalRulesForPricing: SeasonalRule[] = activeSeasonalRules.map((r) => ({
            id: r.id,
            name: r.name,
            startDate: r.startDate,
            endDate: r.endDate,
            multiplier: parseFloat(r.multiplier),
        }));

        // Process each hotel
        for (const hotel of activeHotels) {
            const result: (typeof results)[number] = {
                hotelId: hotel.id,
                hotelName: hotel.name,
                roomsUpdated: 0,
                datesUpdated: 0,
            };

            try {
                // Get hotel's rooms
                const hotelRooms = await db
                    .select({
                        id: rooms.id,
                        basePrice: rooms.basePrice,
                    })
                    .from(rooms)
                    .where(and(eq(rooms.hotelId, hotel.id), eq(rooms.isActive, true)));

                if (hotelRooms.length === 0) {
                    results.push(result);
                    continue;
                }

                // Calculate hotel occupancy for the next week (for dynamic pricing)
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const nextWeekStr = nextWeek.toISOString().split("T")[0]!;

                const [occupancyResult] = await db
                    .select({ count: count() })
                    .from(bookings)
                    .where(
                        and(
                            eq(bookings.hotelId, hotel.id),
                            gte(bookings.checkIn, todayStr),
                            lte(bookings.checkIn, nextWeekStr),
                            eq(bookings.status, "CONFIRMED")
                        )
                    );

                const totalRoomNights = hotelRooms.length * 7;
                const bookedNights = occupancyResult?.count ?? 0;
                const occupancy = totalRoomNights > 0 ? bookedNights / totalRoomNights : 0;

                // Generate prices for next 90 days
                const todayPrices: number[] = [];
                for (const room of hotelRooms) {
                    const basePrice = parseFloat(room.basePrice);

                    for (let i = 0; i < 90; i++) {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const dateStr = date.toISOString().split("T")[0]!;

                        const nextDay = new Date(date);
                        nextDay.setDate(nextDay.getDate() + 1);
                        const nextDayStr = nextDay.toISOString().split("T")[0]!;

                        // Calculate dynamic price
                        const priceBreakdown = calculateDynamicPrice({
                            basePrice,
                            checkIn: dateStr,
                            checkOut: nextDayStr,
                            hotelOccupancy: occupancy,
                            seasonalRules: seasonalRulesForPricing,
                        });

                        // Track today's prices for hotel-level cache
                        if (i === 0) {
                            todayPrices.push(priceBreakdown.finalPrice);
                        }

                        // Upsert into roomInventory
                        await db
                            .insert(roomInventory)
                            .values({
                                roomId: room.id,
                                date: dateStr,
                                price: priceBreakdown.finalPrice.toFixed(2),
                                status: "AVAILABLE",
                            })
                            .onConflictDoUpdate({
                                target: [roomInventory.roomId, roomInventory.date],
                                set: {
                                    price: priceBreakdown.finalPrice.toFixed(2),
                                    updatedAt: new Date(),
                                },
                            });

                        result.datesUpdated++;
                    }

                    result.roomsUpdated++;
                }

                // Update hotel's cached lowest price (single source of truth for listings)
                if (todayPrices.length > 0) {
                    const lowestPrice = Math.min(...todayPrices);
                    await db
                        .update(hotels)
                        .set({
                            lowestDynamicPrice: lowestPrice.toFixed(2),
                            lowestDynamicPriceUpdatedAt: new Date(),
                        })
                        .where(eq(hotels.id, hotel.id));
                    console.log(`[Pricing] Hotel ${hotel.name}: lowestDynamicPrice = ৳${lowestPrice}`);
                }
            } catch (error) {
                console.error(`[Pricing] Error for hotel ${hotel.name}:`, error);
                result.error = error instanceof Error ? error.message : "Unknown error";
            }

            results.push(result);
        }

        const duration = Date.now() - startTime;
        const totalRooms = results.reduce((sum, r) => sum + r.roomsUpdated, 0);
        const totalDates = results.reduce((sum, r) => sum + r.datesUpdated, 0);
        const failedHotels = results.filter((r) => r.error).length;

        console.log(
            `[Pricing] Completed in ${duration}ms - ${totalRooms} rooms, ${totalDates} date entries updated, ${failedHotels} failures`
        );

        return NextResponse.json({
            success: true,
            summary: {
                hotelsProcessed: results.length,
                roomsUpdated: totalRooms,
                datesUpdated: totalDates,
                failedHotels,
                durationMs: duration,
            },
            results,
        });
    } catch (error) {
        console.error("[Pricing] Cron job error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
