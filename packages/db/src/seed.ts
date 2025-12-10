/**
 * Demo Data Seed Script
 * 
 * Run with: npx ts-node packages/db/src/seed.ts
 * Or: npm run seed (if added to package.json)
 */

import { db } from "./index";
import { hotels, rooms, users } from "./schema";
import { eq } from "drizzle-orm";

const DEMO_HOTELS = [
    {
        name: "Vibe City Center",
        description: "Modern hotel in the heart of Dhaka with all amenities. Perfect for business travelers and tourists alike.",
        address: "123 Gulshan Avenue, Gulshan-2",
        city: "Dhaka",
        latitude: "23.7937",
        longitude: "90.4066",
        amenities: ["WiFi", "AC", "TV", "Room Service", "Parking", "Restaurant"],
        coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        rating: "4.5",
        reviewCount: 128,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "101", name: "Standard Single", type: "SINGLE" as const, basePrice: "1500", maxGuests: 1 },
            { roomNumber: "102", name: "Deluxe Double", type: "DOUBLE" as const, basePrice: "2500", maxGuests: 2 },
            { roomNumber: "201", name: "Executive Suite", type: "SUITE" as const, basePrice: "5000", maxGuests: 4 },
            { roomNumber: "202", name: "Family Room", type: "DOUBLE" as const, basePrice: "3500", maxGuests: 4 },
        ],
    },
    {
        name: "Vibe Beach Resort",
        description: "Relaxing beachside resort with stunning ocean views. Ideal for vacations and romantic getaways.",
        address: "Marine Drive, Cox's Bazar",
        city: "Cox's Bazar",
        latitude: "21.4272",
        longitude: "92.0058",
        amenities: ["WiFi", "AC", "Beach Access", "Pool", "Spa", "Restaurant", "Bar"],
        coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        rating: "4.7",
        reviewCount: 256,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "A1", name: "Ocean View Single", type: "SINGLE" as const, basePrice: "2000", maxGuests: 1 },
            { roomNumber: "A2", name: "Ocean View Double", type: "DOUBLE" as const, basePrice: "3500", maxGuests: 2 },
            { roomNumber: "B1", name: "Beach Suite", type: "SUITE" as const, basePrice: "7500", maxGuests: 4 },
            { roomNumber: "B2", name: "Honeymoon Suite", type: "SUITE" as const, basePrice: "10000", maxGuests: 2 },
        ],
    },
    {
        name: "Vibe Budget Stay",
        description: "Clean and affordable accommodation for budget-conscious travelers. Great location and value.",
        address: "45 Dhanmondi Road 27",
        city: "Dhaka",
        latitude: "23.7465",
        longitude: "90.3760",
        amenities: ["WiFi", "AC", "TV"],
        coverImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        rating: "4.0",
        reviewCount: 89,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "1", name: "Economy Single", type: "SINGLE" as const, basePrice: "800", maxGuests: 1 },
            { roomNumber: "2", name: "Economy Double", type: "DOUBLE" as const, basePrice: "1200", maxGuests: 2 },
            { roomNumber: "3", name: "Economy Triple", type: "DOUBLE" as const, basePrice: "1500", maxGuests: 3 },
            { roomNumber: "D1", name: "Dormitory (4 beds)", type: "DORMITORY" as const, basePrice: "500", maxGuests: 1 },
        ],
    },
];

async function seed() {
    console.log("🌱 Starting database seed...\n");

    // First, ensure we have a demo partner user
    let demoPartner = await db.query.users.findFirst({
        where: eq(users.email, "demo-partner@vibehotel.com"),
    });

    if (!demoPartner) {
        console.log("Creating demo partner user...");
        const [newPartner] = await db.insert(users).values({
            name: "Demo Partner",
            email: "demo-partner@vibehotel.com",
            role: "PARTNER",
        }).returning();
        demoPartner = newPartner;
    }

    if (!demoPartner) {
        throw new Error("Failed to create demo partner");
    }

    console.log(`✓ Demo partner: ${demoPartner.email}\n`);

    // Create demo hotels
    for (const hotelData of DEMO_HOTELS) {
        const { rooms: roomsData, ...hotelFields } = hotelData;

        // Check if hotel already exists
        const existing = await db.query.hotels.findFirst({
            where: eq(hotels.name, hotelFields.name),
        });

        if (existing) {
            console.log(`⏭️  Hotel "${hotelFields.name}" already exists, skipping...`);
            continue;
        }

        console.log(`Creating hotel: ${hotelFields.name}`);

        const [hotel] = await db.insert(hotels).values({
            ...hotelFields,
            ownerId: demoPartner.id,
        }).returning();

        if (!hotel) continue;

        // Create rooms for this hotel
        for (const roomData of roomsData) {
            await db.insert(rooms).values({
                ...roomData,
                hotelId: hotel.id,
                amenities: ["WiFi", "AC", "TV"],
            });
        }

        console.log(`  ✓ Created ${roomsData.length} rooms\n`);
    }

    console.log("✅ Seed complete!");
}

// Run if executed directly
seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    });
