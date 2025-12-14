"use server";

import { db } from "@repo/db";
import { cities, hotels } from "@repo/db/schema";
import { eq, and, desc, sql, ilike } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export interface CityWithStats {
    id: string;
    name: string;
    nameBn: string;
    slug: string;
    description: string | null;
    descriptionBn: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    coverImage: string | null;
    latitude: number | null;
    longitude: number | null;
    hotelCount: number;
    isPopular: boolean;
}

/**
 * Get all active cities for navigation/selection
 */
async function _getCities(): Promise<CityWithStats[]> {
    const result = await db.query.cities.findMany({
        where: eq(cities.isActive, true),
        orderBy: [desc(cities.isPopular), desc(cities.hotelCount)],
    });

    return result.map((city) => ({
        ...city,
        latitude: city.latitude ? Number(city.latitude) : null,
        longitude: city.longitude ? Number(city.longitude) : null,
    }));
}

export const getCities = unstable_cache(_getCities, ["cities"], {
    tags: ["cities"],
    revalidate: 300, // 5 minutes
});

/**
 * Get popular cities for homepage
 */
async function _getPopularCities(limit: number = 8): Promise<CityWithStats[]> {
    const result = await db.query.cities.findMany({
        where: and(eq(cities.isActive, true), eq(cities.isPopular, true)),
        orderBy: [desc(cities.hotelCount)],
        limit,
    });

    return result.map((city) => ({
        ...city,
        latitude: city.latitude ? Number(city.latitude) : null,
        longitude: city.longitude ? Number(city.longitude) : null,
    }));
}

export const getPopularCities = unstable_cache(
    _getPopularCities,
    ["popular-cities"],
    {
        tags: ["cities"],
        revalidate: 300,
    }
);

/**
 * Get city by slug for city page
 */
async function _getCityBySlug(slug: string): Promise<CityWithStats | null> {
    const city = await db.query.cities.findFirst({
        where: and(eq(cities.slug, slug), eq(cities.isActive, true)),
    });

    if (!city) return null;

    // Get actual hotel count from hotels table
    const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(hotels)
        .where(
            and(
                ilike(hotels.city, `%${city.name}%`),
                eq(hotels.status, "ACTIVE")
            )
        );

    return {
        ...city,
        latitude: city.latitude ? Number(city.latitude) : null,
        longitude: city.longitude ? Number(city.longitude) : null,
        hotelCount: Number(countResult?.count || 0),
    };
}

export const getCityBySlug = unstable_cache(
    _getCityBySlug,
    ["city-by-slug"],
    {
        tags: ["cities", "hotels"],
        revalidate: 60,
    }
);

/**
 * Get all city slugs for static generation
 * Returns empty array if table doesn't exist (for first deployment)
 */
export async function getAllCitySlugs(): Promise<string[]> {
    try {
        const result = await db
            .select({ slug: cities.slug })
            .from(cities)
            .where(eq(cities.isActive, true));

        return result.map((c) => c.slug);
    } catch (error) {
        // Table may not exist yet during first build
        console.warn("Cities table not found, returning empty array for static params");
        return [];
    }
}
