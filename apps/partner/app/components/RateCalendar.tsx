"use client";

import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface RateData {
    date: string;
    basePrice: number;
    adjustedPrice: number;
    occupancy?: number;
    isWeekend?: boolean;
    isHoliday?: boolean;
}

interface RateCalendarProps {
    roomId: string;
    roomName: string;
    basePrice: number;
    rates: RateData[];
    onRateChange?: (date: string, newPrice: number) => void;
}

export function RateCalendar({
    roomName,
    basePrice,
    rates,
}: RateCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add padding for days before month starts
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    }, [currentMonth]);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const getRateForDate = (date: Date): RateData | undefined => {
        const dateStr = formatDate(date);
        return rates.find((r) => r.date === dateStr);
    };

    const getPriceColor = (rate: RateData | undefined) => {
        if (!rate) return "var(--color-text-muted)";

        const diff = ((rate.adjustedPrice - rate.basePrice) / rate.basePrice) * 100;
        if (diff > 10) return "#10B981"; // Higher price - green
        if (diff < -10) return "#EF4444"; // Lower price - red
        if (diff !== 0) return "#F59E0B"; // Slight change - yellow
        return "var(--color-text-primary)";
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const navigateMonth = (direction: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    const monthName = currentMonth.toLocaleDateString("en", {
        month: "long",
        year: "numeric",
    });

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="glass-card animate-slide-up" style={{ overflow: "hidden" }}>
            {/* Header */}
            <div
                style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>📅</span> Rate Calendar
                    </h2>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                        {roomName} • Base: ৳{basePrice.toLocaleString()}
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                        onClick={() => navigateMonth(-1)}
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-bg-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FiChevronLeft size={16} />
                    </button>
                    <span style={{ minWidth: "140px", textAlign: "center", fontWeight: 500 }}>
                        {monthName}
                    </span>
                    <button
                        onClick={() => navigateMonth(1)}
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-bg-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ padding: "1rem 1.25rem" }}>
                {/* Weekday Headers */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "4px",
                        marginBottom: "0.5rem",
                    }}
                >
                    {weekdays.map((day) => (
                        <div
                            key={day}
                            style={{
                                textAlign: "center",
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                color: "var(--color-text-muted)",
                                textTransform: "uppercase",
                                padding: "0.5rem 0",
                            }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "4px",
                    }}
                >
                    {calendarDays.map((day, index) => {
                        if (!day) {
                            return <div key={`empty-${index}`} style={{ aspectRatio: "1" }} />;
                        }

                        const rate = getRateForDate(day);
                        const priceColor = getPriceColor(rate);
                        const isSelected = selectedDate === formatDate(day);
                        const dayIsToday = isToday(day);
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                        return (
                            <button
                                key={formatDate(day)}
                                onClick={() => setSelectedDate(isSelected ? null : formatDate(day) || null)}
                                style={{
                                    aspectRatio: "1",
                                    borderRadius: "8px",
                                    border: isSelected
                                        ? "2px solid var(--color-primary)"
                                        : dayIsToday
                                        ? "2px solid rgba(59, 130, 246, 0.3)"
                                        : "1px solid var(--color-border)",
                                    background: isSelected
                                        ? "rgba(59, 130, 246, 0.1)"
                                        : isWeekend
                                        ? "rgba(148, 163, 184, 0.05)"
                                        : "transparent",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                    padding: "4px",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: dayIsToday ? 700 : 500,
                                        color: dayIsToday ? "var(--color-primary)" : "var(--color-text-primary)",
                                    }}
                                >
                                    {day.getDate()}
                                </span>
                                <span
                                    style={{
                                        fontSize: "0.625rem",
                                        fontWeight: 600,
                                        color: priceColor,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    ৳{(rate?.adjustedPrice || basePrice).toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div
                style={{
                    padding: "0.75rem 1.25rem",
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    fontSize: "0.75rem",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10B981" }} />
                    <span style={{ color: "var(--color-text-secondary)" }}>Higher (+10%)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#F59E0B" }} />
                    <span style={{ color: "var(--color-text-secondary)" }}>Adjusted</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#EF4444" }} />
                    <span style={{ color: "var(--color-text-secondary)" }}>Lower (-10%)</span>
                </div>
            </div>
        </div>
    );
}
