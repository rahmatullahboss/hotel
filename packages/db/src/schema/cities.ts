import {
    pgTable,
    text,
    timestamp,
    decimal,
    integer,
    boolean,
} from "drizzle-orm/pg-core";

// ====================
// CITIES (For SEO landing pages)
// ====================

export const cities = pgTable("cities", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(), // English name
    nameBn: text("nameBn").notNull(), // Bengali name
    slug: text("slug").notNull().unique(), // URL-friendly slug (e.g., "cox-bazar")
    description: text("description"), // English description for SEO
    descriptionBn: text("descriptionBn"), // Bengali description
    metaTitle: text("metaTitle"), // SEO meta title
    metaDescription: text("metaDescription"), // SEO meta description
    coverImage: text("coverImage"), // Hero image URL
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    hotelCount: integer("hotelCount").default(0).notNull(), // Cached count for display
    isPopular: boolean("isPopular").default(false).notNull(), // Featured on homepage
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Type exports
export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
