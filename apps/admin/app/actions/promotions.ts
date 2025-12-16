"use server";

import { db, type Promotion } from "@repo/db";
import { promotions } from "@repo/db/schema";
import { eq, desc, and, gte, lte, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface PromotionData {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    hotelId: string | null;
    minBookingAmount: number | null;
    maxDiscountAmount: number | null;
    maxUses: number | null;
    currentUses: number;
    validFrom: string | null;
    validTo: string | null;
    isActive: boolean;
    createdAt: Date;
}

/**
 * Get all promotions
 */
export async function getPromotions(): Promise<PromotionData[]> {
    try {
        const allPromotions = await db.query.promotions.findMany({
            orderBy: [desc(promotions.createdAt)],
        });

        return allPromotions.map((p: Promotion) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description,
            type: p.type as "PERCENTAGE" | "FIXED",
            value: Number(p.value) || 0,
            hotelId: p.hotelId,
            minBookingAmount: p.minBookingAmount ? Number(p.minBookingAmount) : null,
            maxDiscountAmount: p.maxDiscountAmount ? Number(p.maxDiscountAmount) : null,
            maxUses: p.maxUses,
            currentUses: p.currentUses,
            validFrom: p.validFrom,
            validTo: p.validTo,
            isActive: p.isActive,
            createdAt: p.createdAt,
        }));
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return [];
    }
}

/**
 * Get active valid promotions
 */
export async function getActivePromotions(): Promise<PromotionData[]> {
    try {
        const today = new Date().toISOString().split("T")[0]!;

        const activePromotions = await db.query.promotions.findMany({
            where: and(
                eq(promotions.isActive, true),
                or(
                    eq(promotions.validFrom, null as unknown as string),
                    lte(promotions.validFrom, today)
                )
            ),
            orderBy: [desc(promotions.createdAt)],
        });

        // Filter by validTo and maxUses in memory for more control
        return activePromotions
            .filter((p: Promotion) => {
                if (p.validTo && p.validTo < today) return false;
                if (p.maxUses && p.currentUses >= p.maxUses) return false;
                return true;
            })
            .map((p: Promotion) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                description: p.description,
                type: p.type as "PERCENTAGE" | "FIXED",
                value: Number(p.value) || 0,
                hotelId: p.hotelId,
                minBookingAmount: p.minBookingAmount ? Number(p.minBookingAmount) : null,
                maxDiscountAmount: p.maxDiscountAmount ? Number(p.maxDiscountAmount) : null,
                maxUses: p.maxUses,
                currentUses: p.currentUses,
                validFrom: p.validFrom,
                validTo: p.validTo,
                isActive: p.isActive,
                createdAt: p.createdAt,
            }));
    } catch (error) {
        console.error("Error fetching active promotions:", error);
        return [];
    }
}

export interface CreatePromotionInput {
    code: string;
    name: string;
    description?: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    hotelId?: string;
    minBookingAmount?: number;
    maxDiscountAmount?: number;
    maxUses?: number;
    validFrom?: string;
    validTo?: string;
}

/**
 * Create a new promotion
 */
export async function createPromotion(
    input: CreatePromotionInput
): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
        // Check if code already exists
        const existing = await db.query.promotions.findFirst({
            where: eq(promotions.code, input.code.toUpperCase()),
        });

        if (existing) {
            return { success: false, error: "Promo code already exists" };
        }

        const [newPromo] = await db
            .insert(promotions)
            .values({
                code: input.code.toUpperCase(),
                name: input.name,
                description: input.description,
                type: input.type,
                value: input.value.toString(),
                hotelId: input.hotelId || null,
                minBookingAmount: input.minBookingAmount?.toString(),
                maxDiscountAmount: input.maxDiscountAmount?.toString(),
                maxUses: input.maxUses,
                validFrom: input.validFrom,
                validTo: input.validTo,
            })
            .returning({ id: promotions.id });

        revalidatePath("/promotions");
        return { success: true, id: newPromo?.id };
    } catch (error) {
        console.error("Error creating promotion:", error);
        return { success: false, error: "Failed to create promotion" };
    }
}

/**
 * Toggle promotion active status
 */
export async function togglePromotionStatus(
    promotionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const promo = await db.query.promotions.findFirst({
            where: eq(promotions.id, promotionId),
        });

        if (!promo) {
            return { success: false, error: "Promotion not found" };
        }

        await db
            .update(promotions)
            .set({ isActive: !promo.isActive, updatedAt: new Date() })
            .where(eq(promotions.id, promotionId));

        revalidatePath("/promotions");
        return { success: true };
    } catch (error) {
        console.error("Error toggling promotion status:", error);
        return { success: false, error: "Failed to toggle status" };
    }
}

/**
 * Delete a promotion
 */
export async function deletePromotion(
    promotionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db.delete(promotions).where(eq(promotions.id, promotionId));
        revalidatePath("/promotions");
        return { success: true };
    } catch (error) {
        console.error("Error deleting promotion:", error);
        return { success: false, error: "Failed to delete promotion" };
    }
}

/**
 * Validate and apply a promo code
 */
export async function validatePromoCode(
    code: string,
    bookingAmount: number,
    hotelId?: string
): Promise<{
    valid: boolean;
    error?: string;
    discount?: number;
    promotion?: PromotionData;
}> {
    try {
        const today = new Date().toISOString().split("T")[0]!;

        const promo = await db.query.promotions.findFirst({
            where: eq(promotions.code, code.toUpperCase()),
        });

        if (!promo) {
            return { valid: false, error: "Invalid promo code" };
        }

        if (!promo.isActive) {
            return { valid: false, error: "This promo code is no longer active" };
        }

        if (promo.validFrom && promo.validFrom > today) {
            return { valid: false, error: "This promo code is not yet valid" };
        }

        if (promo.validTo && promo.validTo < today) {
            return { valid: false, error: "This promo code has expired" };
        }

        if (promo.maxUses && promo.currentUses >= promo.maxUses) {
            return { valid: false, error: "This promo code has reached its usage limit" };
        }

        if (promo.hotelId && promo.hotelId !== hotelId) {
            return { valid: false, error: "This promo code is not valid for this hotel" };
        }

        const minAmount = promo.minBookingAmount ? Number(promo.minBookingAmount) : 0;
        if (bookingAmount < minAmount) {
            return {
                valid: false,
                error: `Minimum booking amount is ৳${minAmount}`,
            };
        }

        // Calculate discount
        let discount = 0;
        if (promo.type === "PERCENTAGE") {
            discount = Math.round((bookingAmount * Number(promo.value)) / 100);
        } else {
            discount = Number(promo.value);
        }

        // Apply max discount cap if set
        const maxDiscount = promo.maxDiscountAmount ? Number(promo.maxDiscountAmount) : Infinity;
        discount = Math.min(discount, maxDiscount, bookingAmount);

        return {
            valid: true,
            discount,
            promotion: {
                id: promo.id,
                code: promo.code,
                name: promo.name,
                description: promo.description,
                type: promo.type as "PERCENTAGE" | "FIXED",
                value: Number(promo.value),
                hotelId: promo.hotelId,
                minBookingAmount: promo.minBookingAmount ? Number(promo.minBookingAmount) : null,
                maxDiscountAmount: promo.maxDiscountAmount ? Number(promo.maxDiscountAmount) : null,
                maxUses: promo.maxUses,
                currentUses: promo.currentUses,
                validFrom: promo.validFrom,
                validTo: promo.validTo,
                isActive: promo.isActive,
                createdAt: promo.createdAt,
            },
        };
    } catch (error) {
        console.error("Error validating promo code:", error);
        return { valid: false, error: "Failed to validate promo code" };
    }
}

/**
 * Increment promo usage count
 */
export async function incrementPromoUsage(
    promotionId: string
): Promise<{ success: boolean }> {
    try {
        const promo = await db.query.promotions.findFirst({
            where: eq(promotions.id, promotionId),
        });

        if (promo) {
            await db
                .update(promotions)
                .set({ currentUses: promo.currentUses + 1, updatedAt: new Date() })
                .where(eq(promotions.id, promotionId));
        }

        return { success: true };
    } catch (error) {
        console.error("Error incrementing promo usage:", error);
        return { success: false };
    }
}
