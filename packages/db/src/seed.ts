/**
 * Demo Data Seed Script
 * 
 * Run with: npx ts-node packages/db/src/seed.ts
 * Or: npm run seed (if added to package.json)
 */

import { db } from "./index";
import { hotels, rooms, users, cities, badges } from "./schema";
import { eq } from "drizzle-orm";

// Default badge data for gamification
const DEMO_BADGES = [
    // Streak badges
    { code: "STREAK_3", name: "Warming Up", nameBn: "শুরু হচ্ছে", description: "Logged in 3 days in a row", descriptionBn: "৩ দিন পরপর লগইন করেছেন", category: "STREAK" as const, icon: "🔥", requirement: 3, points: 10 },
    { code: "STREAK_7", name: "On Fire", nameBn: "আগুনে আছেন", description: "Logged in 7 days in a row", descriptionBn: "৭ দিন পরপর লগইন করেছেন", category: "STREAK" as const, icon: "🔥", requirement: 7, points: 25 },
    { code: "STREAK_14", name: "Dedicated", nameBn: "নিবেদিত", description: "Logged in 14 days in a row", descriptionBn: "১৪ দিন পরপর লগইন করেছেন", category: "STREAK" as const, icon: "⭐", requirement: 14, points: 50 },
    { code: "STREAK_30", name: "Committed", nameBn: "প্রতিশ্রুতিবদ্ধ", description: "Logged in 30 days in a row", descriptionBn: "৩০ দিন পরপর লগইন করেছেন", category: "STREAK" as const, icon: "🏆", requirement: 30, points: 100 },
    { code: "STREAK_60", name: "Streak Master", nameBn: "স্ট্রিক মাস্টার", description: "Logged in 60 days in a row", descriptionBn: "৬০ দিন পরপর লগইন করেছেন", category: "STREAK" as const, icon: "👑", requirement: 60, points: 200 },
    { code: "STREAK_90", name: "Legend", nameBn: "কিংবদন্তি", description: "Logged in 90 days in a row", descriptionBn: "৯০ দিন পরপর লগইন করেছেন", category: "STREAK" as const, icon: "🌟", requirement: 90, points: 300 },
    // Booking badges
    { code: "FIRST_BOOKING", name: "First Adventure", nameBn: "প্রথম অ্যাডভেঞ্চার", description: "Completed your first booking", descriptionBn: "প্রথম বুকিং সম্পন্ন করেছেন", category: "BOOKING" as const, icon: "🎉", requirement: 1, points: 20 },
    { code: "BOOKING_5", name: "Regular Traveler", nameBn: "নিয়মিত ভ্রমণকারী", description: "Completed 5 bookings", descriptionBn: "৫টি বুকিং সম্পন্ন করেছেন", category: "BOOKING" as const, icon: "✈️", requirement: 5, points: 50 },
    { code: "BOOKING_10", name: "Frequent Flyer", nameBn: "ঘন ঘন ভ্রমণকারী", description: "Completed 10 bookings", descriptionBn: "১০টি বুকিং সম্পন্ন করেছেন", category: "BOOKING" as const, icon: "🛫", requirement: 10, points: 100 },
    { code: "BOOKING_25", name: "Road Warrior", nameBn: "রোড ওয়ারিয়র", description: "Completed 25 bookings", descriptionBn: "২৫টি বুকিং সম্পন্ন করেছেন", category: "BOOKING" as const, icon: "🗺️", requirement: 25, points: 250 },
    // Explorer badges
    { code: "EXPLORER_3", name: "City Hopper", nameBn: "শহর ভ্রমণকারী", description: "Visited 3 different cities", descriptionBn: "৩টি ভিন্ন শহর ভ্রমণ করেছেন", category: "EXPLORER" as const, icon: "🏙️", requirement: 3, points: 30 },
    { code: "EXPLORER_5", name: "Explorer", nameBn: "অভিযাত্রী", description: "Visited 5 different cities", descriptionBn: "৫টি ভিন্ন শহর ভ্রমণ করেছেন", category: "EXPLORER" as const, icon: "🧭", requirement: 5, points: 75 },
    // Referral badges
    { code: "REFERRAL_1", name: "Ambassador", nameBn: "অ্যাম্বাসেডর", description: "Referred 1 friend who booked", descriptionBn: "১ জন বন্ধুকে রেফার করেছেন যিনি বুক করেছেন", category: "REFERRAL" as const, icon: "👥", requirement: 1, points: 50 },
    { code: "REFERRAL_5", name: "Super Referrer", nameBn: "সুপার রেফারার", description: "Referred 5 friends who booked", descriptionBn: "৫ জন বন্ধুকে রেফার করেছেন", category: "REFERRAL" as const, icon: "🌟", requirement: 5, points: 150 },
    // Loyalty badges
    { code: "TIER_SILVER", name: "Silver Member", nameBn: "সিলভার সদস্য", description: "Reached Silver loyalty tier", descriptionBn: "সিলভার লয়ালটি টায়ারে পৌঁছেছেন", category: "LOYALTY" as const, icon: "🥈", requirement: 1, points: 50 },
    { code: "TIER_GOLD", name: "Gold Member", nameBn: "গোল্ড সদস্য", description: "Reached Gold loyalty tier", descriptionBn: "গোল্ড লয়ালটি টায়ারে পৌঁছেছেন", category: "LOYALTY" as const, icon: "🥇", requirement: 1, points: 100 },
    { code: "TIER_PLATINUM", name: "Platinum Elite", nameBn: "প্লাটিনাম এলিট", description: "Reached Platinum loyalty tier", descriptionBn: "প্লাটিনাম লয়ালটি টায়ারে পৌঁছেছেন", category: "LOYALTY" as const, icon: "💎", requirement: 1, points: 200 },
    // Reviewer badges
    { code: "FIRST_REVIEW", name: "Voice Heard", nameBn: "প্রথম রিভিউ", description: "Left your first review", descriptionBn: "প্রথম রিভিউ দিয়েছেন", category: "REVIEWER" as const, icon: "📝", requirement: 1, points: 15 },
    { code: "REVIEW_5", name: "Critic", nameBn: "সমালোচক", description: "Left 5 reviews", descriptionBn: "৫টি রিভিউ দিয়েছেন", category: "REVIEWER" as const, icon: "🎭", requirement: 5, points: 50 },
];


// Major Bangladesh cities for SEO landing pages
const DEMO_CITIES = [
    {
        name: "Dhaka",
        nameBn: "ঢাকা",
        slug: "dhaka",
        description: "Discover the best hotels in Dhaka, Bangladesh's vibrant capital. From luxury stays in Gulshan to budget-friendly options in Dhanmondi, find your perfect accommodation.",
        descriptionBn: "ঢাকার সেরা হোটেলগুলো খুঁজুন। গুলশানে বিলাসবহুল থেকে ধানমন্ডিতে বাজেট-ফ্রেন্ডলি অপশন।",
        metaTitle: "Hotels in Dhaka - Best Verified Hotels | ZinuRooms",
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
        metaTitle: "Hotels in Cox's Bazar - Beach Resorts & Hotels | ZinuRooms",
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
        metaTitle: "Hotels in Chittagong - Business & Leisure Hotels | ZinuRooms",
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
        metaTitle: "Hotels in Sylhet - Tea Garden Hotels | ZinuRooms",
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
        metaTitle: "Hotels in Rajshahi - Affordable Stays | ZinuRooms",
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
        metaTitle: "Hotels in Khulna - Sundarbans Gateway | ZinuRooms",
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
        metaTitle: "Hotels in Rangpur - Northern Bangladesh | ZinuRooms",
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
        metaTitle: "Hotels in Mymensingh - University City | ZinuRooms",
        metaDescription: "Find hotels in Mymensingh near university and city center. Best prices guaranteed.",
        latitude: "24.7471",
        longitude: "90.4203",
        isPopular: false,
    },
    {
        name: "Barishal",
        nameBn: "বরিশাল",
        slug: "barishal",
        description: "Discover Barishal, the Venice of the East. Beautiful river views and waterways await you in this historic city.",
        descriptionBn: "প্রাচ্যের ভেনিস বরিশাল আবিষ্কার করুন। সুন্দর নদী দৃশ্য এবং জলপথ আপনার জন্য অপেক্ষা করছে।",
        metaTitle: "Hotels in Barishal - River City Bangladesh | ZinuRooms",
        metaDescription: "Book hotels in Barishal, the Venice of East. Riverside hotels and budget stays available.",
        latitude: "22.7010",
        longitude: "90.3535",
        isPopular: false,
    },
];


const DEMO_HOTELS = [
    {
        name: "Zinu City Center",
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
        name: "Zinu Beach Resort",
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
        name: "Zinu Budget Stay",
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
    {
        name: "Radisson Blu Chittagong",
        description: "Luxury business hotel in Chittagong's commercial hub. World-class amenities and stunning hill views.",
        address: "O.R. Nizam Road, Chittagong",
        city: "Chittagong",
        latitude: "22.3569",
        longitude: "91.7832",
        amenities: ["WiFi", "AC", "Pool", "Gym", "Spa", "Restaurant", "Business Center", "Conference Room"],
        coverImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        rating: "4.6",
        reviewCount: 312,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "301", name: "Superior Room", type: "SINGLE" as const, basePrice: "5500", maxGuests: 1 },
            { roomNumber: "302", name: "Deluxe Room", type: "DOUBLE" as const, basePrice: "7200", maxGuests: 2 },
            { roomNumber: "401", name: "Business Suite", type: "SUITE" as const, basePrice: "12000", maxGuests: 3 },
            { roomNumber: "501", name: "Presidential Suite", type: "SUITE" as const, basePrice: "25000", maxGuests: 4 },
        ],
    },
    {
        name: "Grand Sylhet Resort",
        description: "Nature retreat surrounded by lush tea gardens. Perfect for peaceful getaways and nature lovers.",
        address: "Jaintapur Road, Sylhet",
        city: "Sylhet",
        latitude: "24.8949",
        longitude: "91.8687",
        amenities: ["WiFi", "AC", "Garden", "Restaurant", "Room Service", "Parking", "Tea Lounge"],
        coverImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        rating: "4.4",
        reviewCount: 186,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "G1", name: "Garden View Single", type: "SINGLE" as const, basePrice: "3000", maxGuests: 1 },
            { roomNumber: "G2", name: "Garden View Double", type: "DOUBLE" as const, basePrice: "4800", maxGuests: 2 },
            { roomNumber: "T1", name: "Tea Garden Suite", type: "SUITE" as const, basePrice: "8500", maxGuests: 4 },
        ],
    },
    {
        name: "Rajshahi Heritage Inn",
        description: "Heritage-style hotel near Padma River with traditional architecture and modern comforts.",
        address: "Shaheb Bazar, Rajshahi",
        city: "Rajshahi",
        latitude: "24.3745",
        longitude: "88.6042",
        amenities: ["WiFi", "AC", "TV", "Restaurant", "Parking", "River View"],
        coverImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        rating: "4.3",
        reviewCount: 92,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "H1", name: "Heritage Single", type: "SINGLE" as const, basePrice: "1800", maxGuests: 1 },
            { roomNumber: "H2", name: "Heritage Double", type: "DOUBLE" as const, basePrice: "3200", maxGuests: 2 },
            { roomNumber: "R1", name: "River View Suite", type: "SUITE" as const, basePrice: "5500", maxGuests: 4 },
        ],
    },
    {
        name: "Khulna Sundarbans Gateway",
        description: "Adventure base camp for Sundarbans expeditions. Rustic charm with modern facilities.",
        address: "Khan Jahan Ali Road, Khulna",
        city: "Khulna",
        latitude: "22.8456",
        longitude: "89.5403",
        amenities: ["WiFi", "AC", "Restaurant", "Tour Desk", "Parking", "Boat Rental"],
        coverImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        rating: "4.2",
        reviewCount: 78,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "S1", name: "Safari Single", type: "SINGLE" as const, basePrice: "1500", maxGuests: 1 },
            { roomNumber: "S2", name: "Safari Double", type: "DOUBLE" as const, basePrice: "2800", maxGuests: 2 },
            { roomNumber: "J1", name: "Jungle Cottage", type: "SUITE" as const, basePrice: "4500", maxGuests: 4 },
        ],
    },
    {
        name: "Long Beach Hotel Cox's Bazar",
        description: "Premium beachfront property with direct beach access. Luxury ocean-view rooms and rooftop restaurant.",
        address: "Kolatoli Road, Cox's Bazar",
        city: "Cox's Bazar",
        latitude: "21.4350",
        longitude: "92.0000",
        amenities: ["WiFi", "AC", "Beach Access", "Pool", "Rooftop Restaurant", "Spa", "Gym"],
        coverImage: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
        rating: "4.8",
        reviewCount: 425,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "L1", name: "Sea View Standard", type: "SINGLE" as const, basePrice: "4000", maxGuests: 1 },
            { roomNumber: "L2", name: "Sea View Deluxe", type: "DOUBLE" as const, basePrice: "6800", maxGuests: 2 },
            { roomNumber: "P1", name: "Penthouse Suite", type: "SUITE" as const, basePrice: "15000", maxGuests: 4 },
        ],
    },
    // ============ ADDITIONAL 22 HOTELS ============
    // Dhaka Hotels (4 more = 6 total)
    {
        name: "Pan Pacific Sonargaon",
        description: "Iconic 5-star luxury hotel in Dhaka. Premium hospitality with world-class dining and spa facilities.",
        address: "107 Kazi Nazrul Islam Avenue, Dhaka",
        city: "Dhaka",
        latitude: "23.7508",
        longitude: "90.3929",
        amenities: ["WiFi", "AC", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Conference"],
        coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        rating: "4.9",
        reviewCount: 892,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "P101", name: "Deluxe Room", type: "DOUBLE" as const, basePrice: "15000", maxGuests: 2 },
            { roomNumber: "P201", name: "Executive Suite", type: "SUITE" as const, basePrice: "28000", maxGuests: 3 },
        ],
    },
    {
        name: "The Westin Dhaka",
        description: "Contemporary luxury in Gulshan. Heavenly beds and signature wellness programs.",
        address: "Main Road, Gulshan-2, Dhaka",
        city: "Dhaka",
        latitude: "23.7925",
        longitude: "90.4139",
        amenities: ["WiFi", "AC", "Pool", "Spa", "Gym", "Restaurant", "Room Service"],
        coverImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
        rating: "4.8",
        reviewCount: 654,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "W101", name: "Traditional Room", type: "DOUBLE" as const, basePrice: "12000", maxGuests: 2 },
            { roomNumber: "W201", name: "Renewal Suite", type: "SUITE" as const, basePrice: "22000", maxGuests: 3 },
        ],
    },
    {
        name: "Hotel Amari Dhaka",
        description: "Boutique business hotel in Gulshan. Perfect blend of comfort and convenience.",
        address: "House 47, Road 41, Gulshan-2, Dhaka",
        city: "Dhaka",
        latitude: "23.7934",
        longitude: "90.4078",
        amenities: ["WiFi", "AC", "Restaurant", "Business Center", "Parking"],
        coverImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        rating: "4.3",
        reviewCount: 234,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "A101", name: "Standard Room", type: "SINGLE" as const, basePrice: "4500", maxGuests: 1 },
            { roomNumber: "A102", name: "Superior Room", type: "DOUBLE" as const, basePrice: "6000", maxGuests: 2 },
        ],
    },
    {
        name: "Hotel 71 Dhaka",
        description: "Modern budget-friendly hotel near Motijheel. Ideal for business travelers.",
        address: "71 Motijheel C/A, Dhaka",
        city: "Dhaka",
        latitude: "23.7296",
        longitude: "90.4193",
        amenities: ["WiFi", "AC", "TV", "Restaurant"],
        coverImage: "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?w=800",
        rating: "3.9",
        reviewCount: 156,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "701", name: "Economy Single", type: "SINGLE" as const, basePrice: "1800", maxGuests: 1 },
            { roomNumber: "702", name: "Economy Double", type: "DOUBLE" as const, basePrice: "2500", maxGuests: 2 },
        ],
    },
    // Cox's Bazar Hotels (3 more = 5 total)
    {
        name: "Seagull Hotel Cox's Bazar",
        description: "Beachfront hotel with panoramic sea views. Popular family destination.",
        address: "Hotel Motel Zone, Cox's Bazar",
        city: "Cox's Bazar",
        latitude: "21.4285",
        longitude: "92.0075",
        amenities: ["WiFi", "AC", "Beach Access", "Pool", "Restaurant", "Kids Play Area"],
        coverImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        rating: "4.4",
        reviewCount: 345,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "SG1", name: "Sea Facing Room", type: "DOUBLE" as const, basePrice: "4500", maxGuests: 2 },
            { roomNumber: "SG2", name: "Family Suite", type: "SUITE" as const, basePrice: "8000", maxGuests: 5 },
        ],
    },
    {
        name: "Hotel The Cox Today",
        description: "Modern hotel near Laboni Beach. Great value for money with excellent service.",
        address: "Laboni Point, Cox's Bazar",
        city: "Cox's Bazar",
        latitude: "21.4301",
        longitude: "92.0052",
        amenities: ["WiFi", "AC", "Restaurant", "Room Service", "Parking"],
        coverImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        rating: "4.1",
        reviewCount: 189,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "CT1", name: "Standard Room", type: "SINGLE" as const, basePrice: "2200", maxGuests: 1 },
            { roomNumber: "CT2", name: "Deluxe Room", type: "DOUBLE" as const, basePrice: "3500", maxGuests: 2 },
        ],
    },
    {
        name: "Mermaid Beach Resort",
        description: "Eco-friendly resort away from crowds. Private beach access and organic dining.",
        address: "Pechardwip, Cox's Bazar",
        city: "Cox's Bazar",
        latitude: "21.3892",
        longitude: "91.9845",
        amenities: ["WiFi", "Beach Access", "Restaurant", "Nature Trails", "Bird Watching"],
        coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        rating: "4.6",
        reviewCount: 267,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "MR1", name: "Cottage Room", type: "DOUBLE" as const, basePrice: "5500", maxGuests: 2 },
            { roomNumber: "MR2", name: "Beach Villa", type: "SUITE" as const, basePrice: "12000", maxGuests: 4 },
        ],
    },
    // Chittagong Hotels (3 more = 4 total)
    {
        name: "Hotel Agrabad",
        description: "Historic hotel in Chittagong's commercial district. Trusted name since 1962.",
        address: "Agrabad C/A, Chittagong",
        city: "Chittagong",
        latitude: "22.3245",
        longitude: "91.8123",
        amenities: ["WiFi", "AC", "Restaurant", "Conference", "Parking"],
        coverImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        rating: "4.0",
        reviewCount: 423,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "AG1", name: "Classic Room", type: "SINGLE" as const, basePrice: "3000", maxGuests: 1 },
            { roomNumber: "AG2", name: "Deluxe Room", type: "DOUBLE" as const, basePrice: "4500", maxGuests: 2 },
        ],
    },
    {
        name: "Peninsula Chittagong",
        description: "Waterfront hotel with stunning views of Karnaphuli River. Modern amenities.",
        address: "Bulbul Center, Chittagong",
        city: "Chittagong",
        latitude: "22.3356",
        longitude: "91.8267",
        amenities: ["WiFi", "AC", "Pool", "Gym", "Restaurant", "River View"],
        coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        rating: "4.5",
        reviewCount: 287,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "PN1", name: "River View Room", type: "DOUBLE" as const, basePrice: "6500", maxGuests: 2 },
            { roomNumber: "PN2", name: "Premium Suite", type: "SUITE" as const, basePrice: "11000", maxGuests: 3 },
        ],
    },
    {
        name: "Rose View Hotel CTG",
        description: "Budget-friendly hotel in GEC Circle. Popular among backpackers.",
        address: "GEC Circle, Chittagong",
        city: "Chittagong",
        latitude: "22.3598",
        longitude: "91.8215",
        amenities: ["WiFi", "AC", "TV", "Room Service"],
        coverImage: "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?w=800",
        rating: "3.8",
        reviewCount: 134,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "RV1", name: "Economy Room", type: "SINGLE" as const, basePrice: "1200", maxGuests: 1 },
            { roomNumber: "RV2", name: "Standard Double", type: "DOUBLE" as const, basePrice: "2000", maxGuests: 2 },
        ],
    },
    // Sylhet Hotels (3 more = 4 total)
    {
        name: "Rose View Hotel Sylhet",
        description: "Comfortable hotel near Hazrat Shahjalal Shrine. Popular pilgrimage stay.",
        address: "Dargah Road, Sylhet",
        city: "Sylhet",
        latitude: "24.8963",
        longitude: "91.8714",
        amenities: ["WiFi", "AC", "Restaurant", "Prayer Room", "Parking"],
        coverImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
        rating: "4.2",
        reviewCount: 312,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "RS1", name: "Standard Room", type: "SINGLE" as const, basePrice: "2000", maxGuests: 1 },
            { roomNumber: "RS2", name: "Family Room", type: "DOUBLE" as const, basePrice: "3500", maxGuests: 4 },
        ],
    },
    {
        name: "Nirvana Inn Sylhet",
        description: "Boutique hotel with tea garden views. Peaceful retreat for nature lovers.",
        address: "Sreemangal Road, Sylhet",
        city: "Sylhet",
        latitude: "24.8767",
        longitude: "91.8523",
        amenities: ["WiFi", "AC", "Garden", "Restaurant", "Tea Tasting"],
        coverImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        rating: "4.5",
        reviewCount: 178,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "NI1", name: "Garden View", type: "DOUBLE" as const, basePrice: "4000", maxGuests: 2 },
            { roomNumber: "NI2", name: "Tea Garden Suite", type: "SUITE" as const, basePrice: "7500", maxGuests: 3 },
        ],
    },
    {
        name: "Hotel Star Pacific Sylhet",
        description: "Modern city hotel near Osmani Airport. Convenient for business travelers.",
        address: "Zinda Bazar, Sylhet",
        city: "Sylhet",
        latitude: "24.8934",
        longitude: "91.8698",
        amenities: ["WiFi", "AC", "Restaurant", "Airport Shuttle", "Business Center"],
        coverImage: "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?w=800",
        rating: "4.1",
        reviewCount: 145,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "SP1", name: "Business Room", type: "SINGLE" as const, basePrice: "2800", maxGuests: 1 },
            { roomNumber: "SP2", name: "Executive Room", type: "DOUBLE" as const, basePrice: "4200", maxGuests: 2 },
        ],
    },
    // Rajshahi Hotels (2 more = 3 total)
    {
        name: "Hotel Naz Garden Rajshahi",
        description: "Garden hotel near Rajshahi University. Popular for events and conferences.",
        address: "Rajshahi University Road, Rajshahi",
        city: "Rajshahi",
        latitude: "24.3678",
        longitude: "88.6234",
        amenities: ["WiFi", "AC", "Garden", "Restaurant", "Conference Hall"],
        coverImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        rating: "4.0",
        reviewCount: 89,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "NG1", name: "Garden Room", type: "DOUBLE" as const, basePrice: "2500", maxGuests: 2 },
            { roomNumber: "NG2", name: "VIP Suite", type: "SUITE" as const, basePrice: "4500", maxGuests: 4 },
        ],
    },
    {
        name: "Hotel Mukta International",
        description: "Central hotel near Shaheb Bazar. Walking distance to major attractions.",
        address: "New Market, Rajshahi",
        city: "Rajshahi",
        latitude: "24.3712",
        longitude: "88.5978",
        amenities: ["WiFi", "AC", "Restaurant", "Room Service"],
        coverImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        rating: "3.7",
        reviewCount: 67,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "MK1", name: "Standard Single", type: "SINGLE" as const, basePrice: "1500", maxGuests: 1 },
            { roomNumber: "MK2", name: "Deluxe Double", type: "DOUBLE" as const, basePrice: "2200", maxGuests: 2 },
        ],
    },
    // Khulna Hotels (2 more = 3 total)
    {
        name: "Hotel Royal International Khulna",
        description: "Premier hotel in Khulna city. Modern facilities with traditional hospitality.",
        address: "Khan-A-Sabur Road, Khulna",
        city: "Khulna",
        latitude: "22.8167",
        longitude: "89.5500",
        amenities: ["WiFi", "AC", "Pool", "Restaurant", "Gym"],
        coverImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        rating: "4.3",
        reviewCount: 123,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "RY1", name: "Superior Room", type: "DOUBLE" as const, basePrice: "3800", maxGuests: 2 },
            { roomNumber: "RY2", name: "Royal Suite", type: "SUITE" as const, basePrice: "6500", maxGuests: 3 },
        ],
    },
    {
        name: "Hotel Tiger Garden",
        description: "Sundarbans-themed hotel. Tour packages available for mangrove forest.",
        address: "Shibbari More, Khulna",
        city: "Khulna",
        latitude: "22.8234",
        longitude: "89.5456",
        amenities: ["WiFi", "AC", "Restaurant", "Tour Desk", "Souvenir Shop"],
        coverImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        rating: "4.0",
        reviewCount: 95,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "TG1", name: "Jungle Room", type: "SINGLE" as const, basePrice: "1800", maxGuests: 1 },
            { roomNumber: "TG2", name: "Safari Suite", type: "SUITE" as const, basePrice: "4000", maxGuests: 4 },
        ],
    },
    // Rangpur Hotels (2 new)
    {
        name: "Hotel North View Rangpur",
        description: "Best hotel in northern Bangladesh. Gateway to Kantanagar Temple.",
        address: "Station Road, Rangpur",
        city: "Rangpur",
        latitude: "25.7450",
        longitude: "89.2500",
        amenities: ["WiFi", "AC", "Restaurant", "Parking", "Tour Guide"],
        coverImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
        rating: "4.1",
        reviewCount: 78,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "NV1", name: "Standard Room", type: "SINGLE" as const, basePrice: "1600", maxGuests: 1 },
            { roomNumber: "NV2", name: "Deluxe Room", type: "DOUBLE" as const, basePrice: "2800", maxGuests: 2 },
        ],
    },
    {
        name: "Hotel Parjatan Rangpur",
        description: "Government tourist hotel with clean rooms. Budget-friendly option.",
        address: "Parjatan Motel, Rangpur",
        city: "Rangpur",
        latitude: "25.7512",
        longitude: "89.2534",
        amenities: ["WiFi", "AC", "Restaurant", "Garden"],
        coverImage: "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?w=800",
        rating: "3.6",
        reviewCount: 45,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "PR1", name: "Single Room", type: "SINGLE" as const, basePrice: "1000", maxGuests: 1 },
            { roomNumber: "PR2", name: "Double Room", type: "DOUBLE" as const, basePrice: "1500", maxGuests: 2 },
        ],
    },
    // Mymensingh Hotels (2 new)
    {
        name: "Hotel Shilpacharya Mymensingh",
        description: "Modern hotel near Bangladesh Agricultural University. Academic visitors welcome.",
        address: "BAU Gate, Mymensingh",
        city: "Mymensingh",
        latitude: "24.7234",
        longitude: "90.4345",
        amenities: ["WiFi", "AC", "Restaurant", "Library Corner", "Parking"],
        coverImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        rating: "4.0",
        reviewCount: 67,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "SC1", name: "Academic Room", type: "SINGLE" as const, basePrice: "1400", maxGuests: 1 },
            { roomNumber: "SC2", name: "Faculty Suite", type: "DOUBLE" as const, basePrice: "2500", maxGuests: 2 },
        ],
    },
    {
        name: "Hotel Greenland Mymensingh",
        description: "Eco-friendly hotel with green initiatives. Near Brahmaputra River.",
        address: "Botanical Garden Road, Mymensingh",
        city: "Mymensingh",
        latitude: "24.7567",
        longitude: "90.4123",
        amenities: ["WiFi", "AC", "Garden", "Restaurant", "River View"],
        coverImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        rating: "3.9",
        reviewCount: 52,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "GL1", name: "River View Room", type: "DOUBLE" as const, basePrice: "2200", maxGuests: 2 },
            { roomNumber: "GL2", name: "Green Suite", type: "SUITE" as const, basePrice: "3800", maxGuests: 4 },
        ],
    },
    // Barishal Hotels (3 new)
    {
        name: "Hotel Grand Palace Barishal",
        description: "Premium hotel in the heart of Barishal. Experience the Venice of the East with river views.",
        address: "Sadar Road, Barishal",
        city: "Barishal",
        latitude: "22.7010",
        longitude: "90.3535",
        amenities: ["WiFi", "AC", "Restaurant", "River View", "Conference Hall", "Room Service"],
        coverImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        rating: "4.3",
        reviewCount: 156,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "GP1", name: "Standard Room", type: "SINGLE" as const, basePrice: "2000", maxGuests: 1 },
            { roomNumber: "GP2", name: "Deluxe River View", type: "DOUBLE" as const, basePrice: "3500", maxGuests: 2 },
            { roomNumber: "GP3", name: "Presidential Suite", type: "SUITE" as const, basePrice: "6000", maxGuests: 4 },
        ],
    },
    {
        name: "Hotel Athena International",
        description: "Modern comfort in Barishal city center. Close to launch ghat and main attractions.",
        address: "Band Road, Barishal",
        city: "Barishal",
        latitude: "22.6985",
        longitude: "90.3510",
        amenities: ["WiFi", "AC", "Restaurant", "Parking", "24/7 Reception"],
        coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        rating: "4.0",
        reviewCount: 98,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "AT1", name: "Economy Room", type: "SINGLE" as const, basePrice: "1500", maxGuests: 1 },
            { roomNumber: "AT2", name: "Superior Room", type: "DOUBLE" as const, basePrice: "2800", maxGuests: 2 },
        ],
    },
    {
        name: "Rose Garden Resort Barishal",
        description: "Countryside retreat near Barishal. Beautiful gardens and peaceful environment.",
        address: "Kawnia Road, Barishal",
        city: "Barishal",
        latitude: "22.7120",
        longitude: "90.3680",
        amenities: ["WiFi", "AC", "Garden", "Restaurant", "Playground", "BBQ Area"],
        coverImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        rating: "4.2",
        reviewCount: 67,
        status: "ACTIVE" as const,
        rooms: [
            { roomNumber: "RG1", name: "Garden View", type: "DOUBLE" as const, basePrice: "2500", maxGuests: 2 },
            { roomNumber: "RG2", name: "Family Cottage", type: "SUITE" as const, basePrice: "4500", maxGuests: 5 },
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

    // Seed badges for gamification
    console.log("🏆 Seeding badges...");
    for (const badgeData of DEMO_BADGES) {
        const existingBadge = await db.query.badges.findFirst({
            where: eq(badges.code, badgeData.code),
        });

        if (existingBadge) {
            console.log(`  ⏭️  Badge "${badgeData.name}" already exists, skipping...`);
            continue;
        }

        await db.insert(badges).values(badgeData);
        console.log(`  ✓ Created badge: ${badgeData.name}`);
    }
    console.log("");

    // First, ensure we have a demo partner user
    let demoPartner = await db.query.users.findFirst({
        where: eq(users.email, "demo-partner@zinurooms.com"),
    });

    if (!demoPartner) {
        console.log("Creating demo partner user...");
        const [newPartner] = await db.insert(users).values({
            name: "Demo Partner",
            email: "demo-partner@zinurooms.com",
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

/**
 * Seed a multi-hotel owner with 15+ hotels across multiple locations
 * For testing the Hotel Switcher feature
 */
async function seedMultiHotelPartner() {
    console.log("🏨 Seeding multi-hotel partner...\n");

    // Create or find the multi-hotel partner
    let multiPartner = await db.query.users.findFirst({
        where: eq(users.email, "multi-hotel-owner@zinurooms.com"),
    });

    if (!multiPartner) {
        console.log("Creating multi-hotel partner user...");
        const [newPartner] = await db.insert(users).values({
            name: "Multi Hotel Owner",
            email: "multi-hotel-owner@zinurooms.com",
            phone: "+8801700000001",
            role: "PARTNER",
        }).returning();
        multiPartner = newPartner;
    }

    if (!multiPartner) {
        throw new Error("Failed to create multi-hotel partner");
    }

    console.log(`✓ Multi-hotel partner: ${multiPartner.email}\n`);

    // Define 18 hotels across 6 cities (3 per city)
    const MULTI_HOTEL_CHAIN = [
        // Dhaka (5 hotels)
        { name: "ZinuChain Gulshan", city: "Dhaka", address: "Gulshan-1, Dhaka", lat: "23.7925", lng: "90.4139" },
        { name: "ZinuChain Dhanmondi", city: "Dhaka", address: "Dhanmondi Road 27, Dhaka", lat: "23.7465", lng: "90.3760" },
        { name: "ZinuChain Uttara", city: "Dhaka", address: "Sector 7, Uttara, Dhaka", lat: "23.8759", lng: "90.3795" },
        { name: "ZinuChain Banani", city: "Dhaka", address: "Road 11, Banani, Dhaka", lat: "23.7937", lng: "90.4066" },
        { name: "ZinuChain Motijheel", city: "Dhaka", address: "Motijheel C/A, Dhaka", lat: "23.7296", lng: "90.4193" },
        // Cox's Bazar (3 hotels)
        { name: "ZinuChain Sea View", city: "Cox's Bazar", address: "Marine Drive, Cox's Bazar", lat: "21.4272", lng: "92.0058" },
        { name: "ZinuChain Kolatoli", city: "Cox's Bazar", address: "Kolatoli Road, Cox's Bazar", lat: "21.4350", lng: "92.0000" },
        { name: "ZinuChain Beach Resort", city: "Cox's Bazar", address: "Laboni Beach, Cox's Bazar", lat: "21.4301", lng: "92.0052" },
        // Chittagong (3 hotels)
        { name: "ZinuChain CTG Central", city: "Chittagong", address: "GEC Circle, Chittagong", lat: "22.3598", lng: "91.8215" },
        { name: "ZinuChain Port City", city: "Chittagong", address: "Agrabad C/A, Chittagong", lat: "22.3245", lng: "91.8123" },
        { name: "ZinuChain Hill View", city: "Chittagong", address: "Khulshi, Chittagong", lat: "22.3456", lng: "91.7890" },
        // Sylhet (3 hotels)
        { name: "ZinuChain Tea Garden", city: "Sylhet", address: "Sreemangal Road, Sylhet", lat: "24.8767", lng: "91.8523" },
        { name: "ZinuChain Shrine View", city: "Sylhet", address: "Dargah Road, Sylhet", lat: "24.8963", lng: "91.8714" },
        { name: "ZinuChain Jaflong", city: "Sylhet", address: "Jaflong Road, Sylhet", lat: "25.1520", lng: "92.0156" },
        // Rajshahi (2 hotels)
        { name: "ZinuChain Padma View", city: "Rajshahi", address: "Shaheb Bazar, Rajshahi", lat: "24.3745", lng: "88.6042" },
        { name: "ZinuChain University", city: "Rajshahi", address: "RU Gate, Rajshahi", lat: "24.3651", lng: "88.6285" },
        // Khulna (2 hotels)
        { name: "ZinuChain Sundarbans", city: "Khulna", address: "Khan Jahan Ali Road, Khulna", lat: "22.8456", lng: "89.5403" },
        { name: "ZinuChain Rupsha", city: "Khulna", address: "Rupsha Bridge, Khulna", lat: "22.8234", lng: "89.5456" },
    ];

    for (const hotelDef of MULTI_HOTEL_CHAIN) {
        // Check if hotel exists
        const existing = await db.query.hotels.findFirst({
            where: eq(hotels.name, hotelDef.name),
        });

        if (existing) {
            console.log(`  ⏭️ "${hotelDef.name}" exists, skipping...`);
            continue;
        }

        // Create hotel
        const [newHotel] = await db.insert(hotels).values({
            name: hotelDef.name,
            description: `Part of ZinuChain hotel network in ${hotelDef.city}. Modern amenities with consistent quality.`,
            address: hotelDef.address,
            city: hotelDef.city,
            latitude: hotelDef.lat,
            longitude: hotelDef.lng,
            ownerId: multiPartner.id,
            amenities: ["WiFi", "AC", "TV", "Room Service", "Parking"],
            coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            rating: (Math.random() * 1 + 3.8).toFixed(1), // 3.8 - 4.8
            reviewCount: Math.floor(Math.random() * 200) + 50,
            status: "ACTIVE",
        }).returning();

        if (!newHotel) continue;

        // Create 3-5 rooms per hotel
        const roomCount = Math.floor(Math.random() * 3) + 3;
        const roomTypes = [
            { name: "Standard Single", type: "SINGLE" as const, price: 1500, guests: 1 },
            { name: "Deluxe Double", type: "DOUBLE" as const, price: 2500, guests: 2 },
            { name: "Family Room", type: "DOUBLE" as const, price: 3500, guests: 4 },
            { name: "Executive Suite", type: "SUITE" as const, price: 5000, guests: 3 },
            { name: "Presidential Suite", type: "SUITE" as const, price: 8000, guests: 4 },
        ];

        for (let i = 0; i < roomCount; i++) {
            const roomType = roomTypes[i % roomTypes.length]!;
            await db.insert(rooms).values({
                roomNumber: `${i + 1}0${i + 1}`,
                name: roomType.name,
                type: roomType.type,
                basePrice: String(roomType.price + Math.floor(Math.random() * 500)),
                maxGuests: roomType.guests,
                hotelId: newHotel.id,
                amenities: ["WiFi", "AC", "TV"],
            });
        }

        console.log(`  ✓ Created "${hotelDef.name}" with ${roomCount} rooms`);
    }

    console.log(`\n✅ Multi-hotel partner seed complete!`);
    console.log(`   Email: multi-hotel-owner@zinurooms.com`);
    console.log(`   Hotels: ${MULTI_HOTEL_CHAIN.length} across 6 cities\n`);
}

// Run if executed directly
seed()
    .then(() => seedMultiHotelPartner())
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    });
