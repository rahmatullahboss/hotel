"use client";

import { ExportButton } from "./ExportButton";
import {
    exportAnalyticsToPDF,
    exportAnalyticsToExcel,
    type AnalyticsExportData,
} from "../lib/export";

interface AnalyticsExportClientProps {
    analytics: {
        totalBookings: number;
        totalRevenue: number;
        occupancyRate: number;
        avgBookingValue: number;
        platformBookings: number;
        walkInBookings: number;
    };
    hotelName: string;
    period: string;
}

export function AnalyticsExportClient({
    analytics,
    hotelName,
    period,
}: AnalyticsExportClientProps) {
    const exportData: AnalyticsExportData = {
        period: period,
        totalBookings: analytics.totalBookings,
        totalRevenue: analytics.totalRevenue,
        occupancyRate: analytics.occupancyRate,
        averageRoomRate: analytics.avgBookingValue,
        cancelledBookings: 0, // Not tracked in current analytics
        walkInBookings: analytics.walkInBookings,
        onlineBookings: analytics.platformBookings,
    };

    const handleExportPDF = () => {
        exportAnalyticsToPDF(exportData, hotelName);
    };

    const handleExportExcel = () => {
        exportAnalyticsToExcel(exportData, hotelName);
    };

    return (
        <ExportButton
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
        />
    );
}

export default AnalyticsExportClient;
