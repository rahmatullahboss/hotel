"use client";

import { ExportButton } from "./ExportButton";
import {
    exportEarningsToPDF,
    exportEarningsToExcel,
    type EarningsExportData,
    type TransactionExportData,
} from "../lib/export";

interface EarningsExportClientProps {
    earnings: EarningsExportData;
    hotelName: string;
    period: string;
}

export function EarningsExportClient({
    earnings,
    hotelName,
    period,
}: EarningsExportClientProps) {
    const handleExportPDF = () => {
        const dateRange = {
            startDate: new Date().toISOString().split("T")[0]!,
            endDate: new Date().toISOString().split("T")[0]!,
        };
        exportEarningsToPDF(earnings, dateRange, hotelName, period);
    };

    const handleExportExcel = () => {
        exportEarningsToExcel(earnings, hotelName, period);
    };

    return (
        <ExportButton
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
        />
    );
}

export default EarningsExportClient;
