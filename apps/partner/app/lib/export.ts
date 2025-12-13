"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ==================
// Types
// ==================

export type ReportType = "bookings" | "earnings" | "analytics";

export interface BookingExportData {
    id: string;
    guestName: string;
    guestPhone: string;
    roomNumber: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalAmount: number;
    paymentStatus: string;
    bookingSource: string;
}

export interface EarningsExportData {
    totalRevenue: number;
    totalCommission: number;
    netEarnings: number;
    totalBookings: number;
    walkInRevenue: number;
    platformRevenue: number;
    transactions: TransactionExportData[];
}

export interface TransactionExportData {
    id: string;
    guestName: string;
    checkIn: string;
    amount: number;
    commission: number;
    net: number;
    status: string;
    paymentStatus: string;
    bookingSource: string;
}

export interface AnalyticsExportData {
    period: string;
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    averageRoomRate: number;
    cancelledBookings: number;
    walkInBookings: number;
    onlineBookings: number;
}

export interface DateRange {
    startDate: string;
    endDate: string;
}

// ==================
// PDF Export Functions
// ==================

function formatCurrency(amount: number): string {
    return `৳${amount.toLocaleString("en-BD")}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function exportBookingsToPDF(
    bookings: BookingExportData[],
    dateRange: DateRange,
    hotelName: string
): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(hotelName, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Booking Report", 14, 28);
    doc.text(`${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, 14, 35);

    // Summary
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "CHECKED_OUT").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Bookings: ${totalBookings}`, 14, 45);
    doc.text(`Confirmed: ${confirmedBookings}`, 80, 45);
    doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 140, 45);

    // Table
    autoTable(doc, {
        startY: 52,
        head: [["Guest", "Room", "Check-in", "Check-out", "Status", "Amount", "Source"]],
        body: bookings.map((b) => [
            b.guestName,
            `${b.roomNumber} - ${b.roomName}`,
            formatDate(b.checkIn),
            formatDate(b.checkOut),
            b.status,
            formatCurrency(b.totalAmount),
            b.bookingSource,
        ]),
        headStyles: {
            fillColor: [79, 70, 229],
            textColor: 255,
            fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 35 },
            5: { halign: "right" },
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Generated on ${new Date().toLocaleString("en-BD")} | Page ${i} of ${pageCount}`,
            14,
            doc.internal.pageSize.height - 10
        );
    }

    doc.save(`bookings-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`);
}

export function exportEarningsToPDF(
    earnings: EarningsExportData,
    dateRange: DateRange,
    hotelName: string,
    period: string
): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(hotelName, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Earnings Report", 14, 28);
    doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 14, 35);

    // Summary Cards
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 42, 55, 25, 3, 3, "F");
    doc.roundedRect(75, 42, 55, 25, 3, 3, "F");
    doc.roundedRect(136, 42, 55, 25, 3, 3, "F");

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Total Revenue", 20, 50);
    doc.text("Commission", 81, 50);
    doc.text("Net Earnings", 142, 50);

    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(formatCurrency(earnings.totalRevenue), 20, 60);
    doc.text(formatCurrency(earnings.totalCommission), 81, 60);
    doc.setTextColor(16, 185, 129);
    doc.text(formatCurrency(earnings.netEarnings), 142, 60);

    // Revenue Breakdown
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text("Revenue Breakdown", 14, 80);

    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Platform Bookings: ${formatCurrency(earnings.platformRevenue)}`, 14, 88);
    doc.text(`Walk-in Bookings: ${formatCurrency(earnings.walkInRevenue)}`, 14, 95);
    doc.text(`Total Bookings: ${earnings.totalBookings}`, 14, 102);

    // Transactions Table
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text("Transaction Details", 14, 115);

    autoTable(doc, {
        startY: 120,
        head: [["Date", "Guest", "Amount", "Commission", "Net", "Source", "Status"]],
        body: earnings.transactions.map((t) => [
            formatDate(t.checkIn),
            t.guestName,
            formatCurrency(t.amount),
            formatCurrency(t.commission),
            formatCurrency(t.net),
            t.bookingSource,
            t.status,
        ]),
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: 255,
            fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Generated on ${new Date().toLocaleString("en-BD")} | Page ${i} of ${pageCount}`,
            14,
            doc.internal.pageSize.height - 10
        );
    }

    doc.save(`earnings-report-${period}-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportAnalyticsToPDF(
    analytics: AnalyticsExportData,
    hotelName: string
): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(hotelName, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Analytics Report", 14, 28);
    doc.text(`Period: ${analytics.period}`, 14, 35);

    // Stats Grid
    const stats = [
        { label: "Total Bookings", value: analytics.totalBookings.toString() },
        { label: "Total Revenue", value: formatCurrency(analytics.totalRevenue) },
        { label: "Occupancy Rate", value: `${analytics.occupancyRate.toFixed(1)}%` },
        { label: "Avg Room Rate", value: formatCurrency(analytics.averageRoomRate) },
        { label: "Cancelled", value: analytics.cancelledBookings.toString() },
        { label: "Walk-in", value: analytics.walkInBookings.toString() },
        { label: "Online", value: analytics.onlineBookings.toString() },
    ];

    let yPos = 50;
    let xPos = 14;

    stats.forEach((stat, index) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xPos, yPos, 55, 22, 3, 3, "F");

        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(stat.label, xPos + 5, yPos + 8);

        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text(stat.value, xPos + 5, yPos + 17);

        xPos += 60;
        if ((index + 1) % 3 === 0) {
            xPos = 14;
            yPos += 28;
        }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
        `Generated on ${new Date().toLocaleString("en-BD")}`,
        14,
        doc.internal.pageSize.height - 10
    );

    doc.save(`analytics-report-${analytics.period.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

// ==================
// Excel Export Functions
// ==================

export function exportBookingsToExcel(
    bookings: BookingExportData[],
    dateRange: DateRange,
    hotelName: string
): void {
    const worksheetData = [
        // Header row
        ["ID", "Guest Name", "Phone", "Room Number", "Room Name", "Check-in", "Check-out", "Status", "Amount", "Payment Status", "Source"],
        // Data rows
        ...bookings.map((b) => [
            b.id,
            b.guestName,
            b.guestPhone,
            b.roomNumber,
            b.roomName,
            b.checkIn,
            b.checkOut,
            b.status,
            b.totalAmount,
            b.paymentStatus,
            b.bookingSource,
        ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet["!cols"] = [
        { wch: 36 }, // ID
        { wch: 20 }, // Guest Name
        { wch: 15 }, // Phone
        { wch: 10 }, // Room Number
        { wch: 20 }, // Room Name
        { wch: 12 }, // Check-in
        { wch: 12 }, // Check-out
        { wch: 12 }, // Status
        { wch: 12 }, // Amount
        { wch: 15 }, // Payment Status
        { wch: 12 }, // Source
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    // Add summary sheet
    const summaryData = [
        ["Hotel", hotelName],
        ["Report Period", `${dateRange.startDate} to ${dateRange.endDate}`],
        ["Total Bookings", bookings.length],
        ["Total Revenue", bookings.reduce((sum, b) => sum + b.totalAmount, 0)],
        ["Generated On", new Date().toLocaleString("en-BD")],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    XLSX.writeFile(workbook, `bookings-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`);
}

export function exportEarningsToExcel(
    earnings: EarningsExportData,
    hotelName: string,
    period: string
): void {
    // Summary sheet
    const summaryData = [
        ["Hotel", hotelName],
        ["Period", period],
        [""],
        ["Total Revenue", earnings.totalRevenue],
        ["Total Commission", earnings.totalCommission],
        ["Net Earnings", earnings.netEarnings],
        [""],
        ["Platform Revenue", earnings.platformRevenue],
        ["Walk-in Revenue", earnings.walkInRevenue],
        ["Total Bookings", earnings.totalBookings],
        [""],
        ["Generated On", new Date().toLocaleString("en-BD")],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Transactions sheet
    const transactionsData = [
        ["ID", "Guest Name", "Check-in", "Amount", "Commission", "Net", "Status", "Payment Status", "Source"],
        ...earnings.transactions.map((t) => [
            t.id,
            t.guestName,
            t.checkIn,
            t.amount,
            t.commission,
            t.net,
            t.status,
            t.paymentStatus,
            t.bookingSource,
        ]),
    ];
    const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);

    // Set column widths
    transactionsSheet["!cols"] = [
        { wch: 36 }, // ID
        { wch: 20 }, // Guest Name
        { wch: 12 }, // Check-in
        { wch: 12 }, // Amount
        { wch: 12 }, // Commission
        { wch: 12 }, // Net
        { wch: 12 }, // Status
        { wch: 15 }, // Payment Status
        { wch: 12 }, // Source
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");

    XLSX.writeFile(workbook, `earnings-${period.toLowerCase()}-${new Date().toISOString().split("T")[0]}.xlsx`);
}

export function exportAnalyticsToExcel(
    analytics: AnalyticsExportData,
    hotelName: string
): void {
    const data = [
        ["Hotel", hotelName],
        ["Period", analytics.period],
        ["Generated On", new Date().toLocaleString("en-BD")],
        [""],
        ["Metric", "Value"],
        ["Total Bookings", analytics.totalBookings],
        ["Total Revenue", analytics.totalRevenue],
        ["Occupancy Rate", `${analytics.occupancyRate.toFixed(1)}%`],
        ["Average Room Rate", analytics.averageRoomRate],
        ["Cancelled Bookings", analytics.cancelledBookings],
        ["Walk-in Bookings", analytics.walkInBookings],
        ["Online Bookings", analytics.onlineBookings],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [{ wch: 20 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");

    XLSX.writeFile(workbook, `analytics-${analytics.period.toLowerCase().replace(/\s+/g, "-")}.xlsx`);
}
