"use client";

import { ExportButton } from "./ExportButton";
import {
    exportBookingsToPDF,
    exportBookingsToExcel,
    type BookingExportData,
    type DateRange,
} from "../lib/export";

interface BookingsExportClientProps {
    bookings: BookingExportData[];
    hotelName: string;
    dateRange: DateRange;
}

export function BookingsExportClient({
    bookings,
    hotelName,
    dateRange,
}: BookingsExportClientProps) {
    const handleExportPDF = () => {
        exportBookingsToPDF(bookings, dateRange, hotelName);
    };

    const handleExportExcel = () => {
        exportBookingsToExcel(bookings, dateRange, hotelName);
    };

    return (
        <ExportButton
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={bookings.length === 0}
        />
    );
}

export default BookingsExportClient;
