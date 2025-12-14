/**
 * Demo Data Seed Script
 * 
 * Run with: npx ts-node packages/db/src/seed.ts
 * Or: npm run seed (if added to package.json)
 */

import { db } from "./index";
import { hotels, rooms, users, cities } from "./schema";
import { eq } from "drizzle-orm";

// Major Bangladesh cities for SEO landing pages
const DEMO_CITIES = [
    {
        name: "Dhaka",
        nameBn: "ঢাকা",
        slug: "dhaka",
        description: "Discover the best hotels in Dhaka, Bangladesh's vibrant capital. From luxury stays in Gulshan to budget-friendly options in Dhanmondi, find your perfect accommodation.",
        descriptionBn: "ঢাকার সেরা হোটেলগুলো খুঁজুন। গুলশানে বিলাসবহুল থেকে ধানমন্ডিতে বাজেট-ফ্রেন্ডলি অপশন।",
        metaTitle: "Hotels in Dhaka - Best Verified Hotels | Vibe Hotels",
        metaDescription: "Book verified hotels in Dhaka with free cancellation. Pay at hotel option available. Best prices guaranteed.",
        latitude: "23.8103",
        longitude: "90.4125",
        isPopular: true,
    },
    {
        name: "Cox's Bazar",
        nameBn: "কক্সবাজার",
        slug: "cox-bazar",
        description: "Experience the world's longest natural sea beach. Book hotels in Cox's Bazar for an unforgettable beach vacation with stunning ocean views.",
        descriptionBn: "বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকতে থাকার জন্য কক্সবাজারের হোটেল বুক করুন।",
        metaTitle: "Hotels in Cox's Bazar - Beach Resorts & Hotels | Vibe Hotels",
        metaDescription: "Book beach hotels and resorts in Cox's Bazar. Ocean view rooms, best prices, and free cancellation.",
        latitude: "21.4272",
        longitude: "92.0058",
        isPopular: true,
    },
    {
        name: "Chittagong",
        nameBn: "চট্টগ্রাম",
        slug: "chittagong",
        description: "Find the best hotels in Chittagong, Bangladesh's port city. Perfect for business travelers and tourists exploring the hill tracts.",
        descriptionBn: "চট্টগ্রামের সেরা হোটেল খুঁজুন। ব্যবসায়িক ভ্রমণকারী এবং পর্যটকদের জন্য আদর্শ।",
        metaTitle: "Hotels in Chittagong - Business & Leisure Hotels | Vibe Hotels",
        metaDescription: "Book verified hotels in Chittagong. Business hotels, hill view stays, and budget options available.",
        latitude: "22.3569",
        longitude: "91.7832",
        isPopular: true,
    },
    {
        name: "Sylhet",
        nameBn: "সিলেট",
        slug: "sylhet",
        description: "Explore Sylhet's tea gardens and natural beauty. Book hotels near Ratargul, Jaflong, and the city center.",
        descriptionBn: "সিলেটের চা বাগান এবং প্রাকৃতিক সৌন্দর্য উপভোগ করুন। রাতারগুল, জাফলং এর কাছে হোটেল।",
        metaTitle: "Hotels in Sylhet - Tea Garden Hotels | Vibe Hotels",
        metaDescription: "Book hotels in Sylhet near tea gardens and tourist spots. Best prices and verified properties.",
        latitude: "24.8949",
        longitude: "91.8687",
        isPopular: true,
    },
    {
        name: "Rajshahi",
        nameBn: "রাজশাহী",
        slug: "rajshahi",
        description: "Stay in Rajshahi, the city of education and mangoes. Hotels near Varendra Museum, Padma River, and university area.",
        descriptionBn: "শিক্ষা ও আমের শহর রাজশাহীতে থাকুন। বরেন্দ্র জাদুঘর এবং পদ্মা নদীর কাছে হোটেল।",
        metaTitle: "Hotels in Rajshahi - Affordable Stays | Vibe Hotels",
        metaDescription: "Find affordable hotels in Rajshahi. Near university, Padma River, and tourist attractions.",
        latitude: "24.3745",
        longitude: "88.6042",
        isPopular: false,
    },
    {
        name: "Khulna",
        nameBn: "খুলনা",
        slug: "khulna",
        description: "Gateway to the Sundarbans. Book hotels in Khulna for your next adventure to the world's largest mangrove forest.",
        descriptionBn: "সুন্দরবনের প্রবেশদ্বার। বিশ্বের বৃহত্তম ম্যানগ্রোভ বনে অ্যাডভেঞ্চারের জন্য হোটেল বুক করুন।",
        metaTitle: "Hotels in Khulna - Sundarbans Gateway | Vibe Hotels",
        metaDescription: "Book hotels in Khulna near Sundarbans. Perfect base for mangrove forest tours.",
        latitude: "22.8456",
        longitude: "89.5403",
        isPopular: false,
    },
    {
        name: "Rangpur",
        nameBn: "রংপুর",
        slug: "rangpur",
        description: "Discover Rangpur in northern Bangladesh. Hotels for business and leisure travelers exploring the region.",
        descriptionBn: "উত্তর বাংলাদেশের রংপুর আবিষ্কার করুন। ব্যবসা ও অবসর ভ্রমণকারীদের জন্য হোটেল।",
        metaTitle: "Hotels in Rangpur - Northern Bangladesh | Vibe Hotels",
        metaDescription: "Book verified hotels in Rangpur. Affordable stays in northern Bangladesh.",
        latitude: "25.7439",
        longitude: "89.2752",
        isPopular: false,
    },
    {
        name: "Mymensingh",
        nameBn: "ময়মনসিংহ",
        slug: "mymensingh",
        description: "Stay in Mymensingh, home to Bangladesh Agricultural University. Hotels near the city center and university campus.",
        descriptionBn: "বাংলাদেশ কৃষি বিশ্ববিদ্যালয়ের শহর ময়মনসিংহে থাকুন।",
        metaTitle: "Hotels in Mymensingh - University City | Vibe Hotels",
        metaDescription: "Find hotels in Mymensingh near university and city center. Best prices guaranteed.",
        latitude: "24.7471",
        longitude: "90.4203",
        isPopular: false,
    },
];


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

    // Seed cities for SEO landing pages
    console.log("📍 Seeding cities...");
    for (const cityData of DEMO_CITIES) {
        const existingCity = await db.query.cities.findFirst({
            where: eq(cities.slug, cityData.slug),
        });

        if (existingCity) {
            console.log(`  ⏭️  City "${cityData.name}" already exists, skipping...`);
            continue;
        }

        await db.insert(cities).values(cityData);
        console.log(`  ✓ Created city: ${cityData.name}`);
    }
    console.log("");

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
        let hotel = await db.query.hotels.findFirst({
            where: eq(hotels.name, hotelFields.name),
        });

        if (hotel) {
            // Check if rooms exist for this hotel
            const existingRooms = await db.query.rooms.findMany({
                where: eq(rooms.hotelId, hotel.id),
            });

            if (existingRooms.length > 0) {
                console.log(`⏭️  Hotel "${hotelFields.name}" already has ${existingRooms.length} rooms, skipping...`);
                continue;
            }

            console.log(`📝 Hotel "${hotelFields.name}" exists but has no rooms. Creating rooms...`);
        } else {
            console.log(`Creating hotel: ${hotelFields.name}`);

            const [newHotel] = await db.insert(hotels).values({
                ...hotelFields,
                ownerId: demoPartner.id,
            }).returning();

            hotel = newHotel;
        }

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
