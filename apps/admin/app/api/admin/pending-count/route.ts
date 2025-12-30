import { db } from "@repo/db";
import { hotels } from "@repo/db/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await db
            .select({ count: count() })
            .from(hotels)
            .where(eq(hotels.status, "PENDING"));
        
        return NextResponse.json({
            pendingCount: result[0]?.count || 0
        });
    } catch (error) {
        console.error("Error fetching pending count:", error);
        return NextResponse.json({ pendingCount: 0 });
    }
}
