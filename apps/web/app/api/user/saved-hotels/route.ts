import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { savedHotels, hotels } from "@repo/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

// GET - Fetch all saved hotels for the current user
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const saved = await db
            .select({
                id: savedHotels.id,
                hotelId: savedHotels.hotelId,
                savedAt: savedHotels.createdAt,
                hotel: {
                    id: hotels.id,
                    name: hotels.name,
                    city: hotels.city,
                    coverImage: hotels.coverImage,
                    rating: hotels.rating,
                    reviewCount: hotels.reviewCount,
                    lowestDynamicPrice: hotels.lowestDynamicPrice,
                },
            })
            .from(savedHotels)
            .innerJoin(hotels, eq(savedHotels.hotelId, hotels.id))
            .where(eq(savedHotels.userId, userId))
            .orderBy(desc(savedHotels.createdAt));

        return NextResponse.json({
            savedHotels: saved.map((s) => ({
                id: s.id,
                hotelId: s.hotelId,
                savedAt: s.savedAt,
                hotel: {
                    ...s.hotel,
                    rating: s.hotel.rating ? Number(s.hotel.rating) : null,
                    lowestDynamicPrice: s.hotel.lowestDynamicPrice
                        ? Number(s.hotel.lowestDynamicPrice)
                        : null,
                },
            })),
        });
    } catch (error) {
        console.error("Error getting saved hotels:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - Save a hotel
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { hotelId } = body;

        if (!hotelId) {
            return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
        }

        // Check if hotel exists
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, hotelId),
        });

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        // Check if already saved
        const existing = await db.query.savedHotels.findFirst({
            where: and(
                eq(savedHotels.userId, userId),
                eq(savedHotels.hotelId, hotelId)
            ),
        });

        if (existing) {
            return NextResponse.json({ message: "Hotel already saved", id: existing.id });
        }

        // Save the hotel
        const [saved] = await db
            .insert(savedHotels)
            .values({ userId, hotelId })
            .returning();

        return NextResponse.json({ message: "Hotel saved successfully", id: saved!.id });
    } catch (error) {
        console.error("Error saving hotel:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Unsave a hotel
export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { hotelId } = body;

        if (!hotelId) {
            return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
        }

        await db
            .delete(savedHotels)
            .where(
                and(
                    eq(savedHotels.userId, userId),
                    eq(savedHotels.hotelId, hotelId)
                )
            );

        return NextResponse.json({ message: "Hotel unsaved successfully" });
    } catch (error) {
        console.error("Error unsaving hotel:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
