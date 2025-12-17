/**
 * Migration Script: Assign Zino Codes to Existing Hotels
 * 
 * This script assigns unique ZR codes to all hotels that don't have one yet.
 * It also auto-categorizes hotels based on their lowest price.
 * 
 * Run with: npx dotenv -e .env -- npx tsx packages/db/src/migrations/assignZinoCodes.ts
 */

import { db } from "../index";
import { hotels, rooms } from "../schema";
import { eq, isNull, sql } from "drizzle-orm";
import { generateZinoCode, suggestCategory } from "../utils/zinoBranding";

async function assignZinoCodes() {
    console.log("🚀 Starting Zino code assignment migration...\n");

    try {
        // Get all hotels without a zino code
        const hotelsWithoutCode = await db
            .select({
                id: hotels.id,
                name: hotels.name,
                zinoCode: hotels.zinoCode,
                lowestPrice: sql<number>`MIN(${rooms.basePrice})`.as("lowestPrice"),
            })
            .from(hotels)
            .leftJoin(rooms, eq(rooms.hotelId, hotels.id))
            .where(isNull(hotels.zinoCode))
            .groupBy(hotels.id);

        if (hotelsWithoutCode.length === 0) {
            console.log("✅ All hotels already have Zino codes!");
            process.exit(0);
        }

        console.log(`📊 Found ${hotelsWithoutCode.length} hotels without Zino codes\n`);

        // Get all existing zino codes
        const existingCodes = await db
            .select({ zinoCode: hotels.zinoCode })
            .from(hotels)
            .where(sql`${hotels.zinoCode} IS NOT NULL`);

        const codes = existingCodes
            .map((h: { zinoCode: string | null }) => h.zinoCode)
            .filter((code: string | null): code is string => code !== null);

        // Assign codes to each hotel
        let assigned = 0;
        for (const hotel of hotelsWithoutCode) {
            const newCode = generateZinoCode([...codes]);
            codes.push(newCode); // Add to list to prevent duplicates

            // Determine category based on price
            const category = suggestCategory(hotel.lowestPrice || 3000);

            await db
                .update(hotels)
                .set({
                    zinoCode: newCode,
                    category: category,
                })
                .where(eq(hotels.id, hotel.id));

            assigned++;
            console.log(`  ✓ ${hotel.name}`);
            console.log(`    → Code: ${newCode}, Category: ${category}`);
        }

        console.log(`\n✅ Successfully assigned ${assigned} Zino codes!`);
        console.log("\n📋 Summary:");
        console.log(`   - Hotels processed: ${assigned}`);
        console.log("   - Code format: ZR10001, ZR10002, ...");
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

assignZinoCodes();
