"use server";

import { db, hotels, bookings, users, payoutRequests, reviews } from "@repo/db";
import { eq, desc, and, gte, lte, sql, count, sum } from "drizzle-orm";

// ==================
// Types
// ==================

interface ReportData {
    period: string;
    totalBookings: number;
    totalRevenue: number;
    totalCommission: number;
    avgBookingValue: number;
    totalPayouts: number;
    newHotels: number;
    newUsers: number;
}

// ==================
// Report Functions
// ==================

/**
 * Get booking report data
 */
export async function getBookingReport(
    startDate?: string,
    endDate?: string
): Promise<ReportData> {
    const allBookings = await db.query.bookings.findMany({
        where: startDate && endDate
            ? and(
                gte(bookings.createdAt, new Date(startDate)),
                lte(bookings.createdAt, new Date(endDate))
            )
            : undefined,
    });

    const confirmedBookings = allBookings.filter(
        (b) => b.status !== "CANCELLED" && b.status !== "PENDING"
    );

    const totalRevenue = confirmedBookings.reduce(
        (sum, b) => sum + parseFloat(b.totalAmount), 0
    );
    const totalCommission = confirmedBookings.reduce(
        (sum, b) => sum + parseFloat(b.commissionAmount), 0
    );

    return {
        period: startDate && endDate ? `${startDate} to ${endDate}` : "All Time",
        totalBookings: confirmedBookings.length,
        totalRevenue: Math.round(totalRevenue),
        totalCommission: Math.round(totalCommission),
        avgBookingValue: confirmedBookings.length > 0
            ? Math.round(totalRevenue / confirmedBookings.length)
            : 0,
        totalPayouts: 0, // Would calculate from payouts
        newHotels: 0,
        newUsers: 0,
    };
}

/**
 * Get revenue by hotel report
 */
export async function getRevenueByHotelReport(
    startDate?: string,
    endDate?: string
) {
    const allHotels = await db.query.hotels.findMany({
        with: {
            bookings: true,
        },
    });

    const hotelsWithRevenue = allHotels.map((hotel) => {
        const relevantBookings = hotel.bookings.filter((b) => {
            if (b.status === "CANCELLED" || b.status === "PENDING") return false;
            if (!startDate || !endDate) return true;
            const bookingDate = new Date(b.createdAt);
            return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
        });

        const revenue = relevantBookings.reduce(
            (sum, b) => sum + parseFloat(b.totalAmount), 0
        );
        const commission = relevantBookings.reduce(
            (sum, b) => sum + parseFloat(b.commissionAmount), 0
        );

        return {
            hotelId: hotel.id,
            hotelName: hotel.name,
            city: hotel.city,
            bookingCount: relevantBookings.length,
            revenue: Math.round(revenue),
            commission: Math.round(commission),
            netRevenue: Math.round(revenue - commission),
        };
    });

    return hotelsWithRevenue.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Get monthly trend data
 */
export async function getMonthlyTrend(year: number = new Date().getFullYear()) {
    const allBookings = await db.query.bookings.findMany({
        where: and(
            gte(bookings.createdAt, new Date(`${year}-01-01`)),
            lte(bookings.createdAt, new Date(`${year}-12-31`))
        ),
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(year, i).toLocaleString('default', { month: 'short' }),
        bookings: 0,
        revenue: 0,
        commission: 0,
    }));

    allBookings.forEach((booking) => {
        if (booking.status !== "CANCELLED" && booking.status !== "PENDING") {
            const monthIndex = new Date(booking.createdAt).getMonth();
            const month = months[monthIndex];
            if (month) {
                month.bookings++;
                month.revenue += parseFloat(booking.totalAmount);
                month.commission += parseFloat(booking.commissionAmount);
            }
        }
    });

    return months.map((m) => ({
        ...m,
        revenue: Math.round(m.revenue),
        commission: Math.round(m.commission),
    }));
}

/**
 * Generate CSV export data
 */
export async function generateExportData(
    reportType: "bookings" | "revenue-by-hotel" | "payouts",
    startDate?: string,
    endDate?: string
): Promise<string> {
    if (reportType === "bookings") {
        const allBookings = await db.query.bookings.findMany({
            where: startDate && endDate
                ? and(
                    gte(bookings.createdAt, new Date(startDate)),
                    lte(bookings.createdAt, new Date(endDate))
                )
                : undefined,
            with: {
                hotel: true,
                room: true,
            },
            orderBy: desc(bookings.createdAt),
        });

        const headers = ["Date", "Hotel", "Room", "Guest", "Check-In", "Check-Out", "Status", "Amount", "Commission"];
        const rows = allBookings.map((b) => [
            new Date(b.createdAt).toLocaleDateString(),
            b.hotel?.name || "",
            b.room?.name || "",
            b.guestName,
            b.checkIn,
            b.checkOut,
            b.status,
            b.totalAmount,
            b.commissionAmount,
        ]);

        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    if (reportType === "revenue-by-hotel") {
        const data = await getRevenueByHotelReport(startDate, endDate);
        const headers = ["Hotel", "City", "Bookings", "Revenue", "Commission", "Net Revenue"];
        const rows = data.map((h) => [
            h.hotelName,
            h.city,
            h.bookingCount,
            h.revenue,
            h.commission,
            h.netRevenue,
        ]);

        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    if (reportType === "payouts") {
        const allPayouts = await db.query.payoutRequests.findMany({
            where: startDate && endDate
                ? and(
                    gte(payoutRequests.createdAt, new Date(startDate)),
                    lte(payoutRequests.createdAt, new Date(endDate))
                )
                : undefined,
            with: {
                hotel: true,
            },
            orderBy: desc(payoutRequests.createdAt),
        });

        const headers = ["Date", "Hotel", "Amount", "Method", "Status", "Transaction Ref"];
        const rows = allPayouts.map((p) => [
            new Date(p.createdAt).toLocaleDateString(),
            p.hotel?.name || "",
            p.amount,
            p.paymentMethod,
            p.status,
            p.transactionReference || "",
        ]);

        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    return "";
}
