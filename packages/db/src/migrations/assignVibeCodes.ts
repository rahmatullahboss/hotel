/**
 * Migration Script: Assign Vibe Codes to Existing Hotels
 * 
 * This script assigns unique VB codes to all hotels that don't have one yet.
 * It also auto-categorizes hotels based on their lowest price.
 * 
 * Run with: npx dotenv -e .env -- npx tsx packages/db/src/migrations/assignVibeCodes.ts
 */

import { db } from "../index";
import { hotels, rooms } from "../schema";
import { eq, isNull, sql } from "drizzle-orm";
import { generateVibeCode, suggestCategory } from "../utils/vibeBranding";

async function assignVibeCodes() {
    console.log("🚀 Starting Vibe code assignment migration...\n");

    try {
        // Get all hotels without a vibe code
        const hotelsWithoutCode = await db
            .select({
                id: hotels.id,
                name: hotels.name,
                vibeCode: hotels.vibeCode,
                lowestPrice: sql<number>`MIN(${rooms.basePrice})`.as("lowestPrice"),
            })
            .from(hotels)
            .leftJoin(rooms, eq(rooms.hotelId, hotels.id))
            .where(isNull(hotels.vibeCode))
            .groupBy(hotels.id);

        if (hotelsWithoutCode.length === 0) {
            console.log("✅ All hotels already have Vibe codes!");
            process.exit(0);
        }

        console.log(`📊 Found ${hotelsWithoutCode.length} hotels without Vibe codes\n`);

        // Get all existing vibe codes
        const existingCodes = await db
            .select({ vibeCode: hotels.vibeCode })
            .from(hotels)
            .where(sql`${hotels.vibeCode} IS NOT NULL`);

        const codes = existingCodes
            .map(h => h.vibeCode)
            .filter((code): code is string => code !== null);

        // Assign codes to each hotel
        let assigned = 0;
        for (const hotel of hotelsWithoutCode) {
            const newCode = generateVibeCode([...codes]);
            codes.push(newCode); // Add to list to prevent duplicates

            // Determine category based on price
            const category = suggestCategory(hotel.lowestPrice || 3000);

            await db
                .update(hotels)
                .set({
                    vibeCode: newCode,
                    category: category,
                })
                .where(eq(hotels.id, hotel.id));

            assigned++;
            console.log(`  ✓ ${hotel.name}`);
            console.log(`    → Code: ${newCode}, Category: ${category}`);
        }

        console.log(`\n✅ Successfully assigned ${assigned} Vibe codes!`);
        console.log("\n📋 Summary:");
        console.log(`   - Hotels processed: ${assigned}`);
        console.log("   - Code format: VB10001, VB10002, ...");
        console.log("   - Categories auto-assigned based on price:\n");
        console.log("     • CLASSIC: ≤ ৳3,000");
        console.log("     • PREMIUM: ≥ ৳8,000");
        console.log("     • Default to CLASSIC for mid-range\n");

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

assignVibeCodes();
