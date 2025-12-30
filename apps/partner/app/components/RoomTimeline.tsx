"use client";

import { useState, useMemo } from "react";

interface Booking {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
}

interface Room {
    id: string;
    roomNumber: string;
    roomType: string;
    bookings: Booking[];
}

interface RoomTimelineProps {
    rooms: Room[];
    startDate?: Date;
    daysToShow?: number;
}

const statusColors: Record<string, string> = {
    CONFIRMED: "#3B82F6",
    CHECKED_IN: "#10B981",
    CHECKED_OUT: "#94A3B8",
    PENDING: "#F59E0B",
    CANCELLED: "#EF4444",
};

export function RoomTimeline({
    rooms,
    startDate = new Date(),
    daysToShow = 14,
}: RoomTimelineProps) {
    const [hoveredBooking, setHoveredBooking] = useState<string | null>(null);

    // Generate dates array
    const dates = useMemo(() => {
        const result: Date[] = [];
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            result.push(date);
        }
        return result;
    }, [startDate, daysToShow]);

    const formatDate = (date: Date) => {
        const day = date.getDate();
        const weekday = date.toLocaleDateString("en", { weekday: "short" });
        return { day, weekday };
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    // Calculate booking position and width
    const getBookingStyle = (booking: Booking) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const startTime = dates[0]!.getTime();
        const endTime = dates[dates.length - 1]!.getTime();
        const dayWidth = 100 / daysToShow;

        // Clamp to visible range
        const visibleCheckIn = Math.max(checkIn.getTime(), startTime);
        const visibleCheckOut = Math.min(checkOut.getTime(), endTime + 86400000);

        const startOffset = (visibleCheckIn - startTime) / (86400000);
        const duration = (visibleCheckOut - visibleCheckIn) / (86400000);

        const left = `${startOffset * dayWidth}%`;
        const width = `${Math.max(duration * dayWidth, dayWidth * 0.5)}%`;

        return { left, width };
    };

    const isBookingVisible = (booking: Booking) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const startTime = dates[0]!.getTime();
        const endTime = dates[dates.length - 1]!.getTime() + 86400000;

        return checkIn.getTime() < endTime && checkOut.getTime() > startTime;
    };

    const cellWidth = 60;
    const rowHeight = 48;

    return (
        <div className="glass-card animate-slide-up" style={{ overflow: "hidden" }}>
            {/* Header */}
            <div style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <h2 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    <span>📅</span> Room Timeline
                </h2>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {daysToShow} days view
                </div>
            </div>

            {/* Timeline Container */}
            <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: `${100 + cellWidth * daysToShow}px` }}>
                    {/* Date Header */}
                    <div style={{
                        display: "flex",
                        borderBottom: "1px solid var(--color-border)",
                        background: "var(--color-bg-secondary)",
                    }}>
                        {/* Room label column */}
                        <div style={{
                            width: "100px",
                            minWidth: "100px",
                            padding: "0.75rem",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                            borderRight: "1px solid var(--color-border)",
                        }}>
                            Room
                        </div>

                        {/* Date columns */}
                        {dates.map((date, i) => {
                            const { day, weekday } = formatDate(date);
                            const today = isToday(date);
                            const weekend = isWeekend(date);

                            return (
                                <div
                                    key={i}
                                    style={{
                                        width: `${cellWidth}px`,
                                        minWidth: `${cellWidth}px`,
                                        padding: "0.5rem",
                                        textAlign: "center",
                                        borderRight: "1px solid var(--color-border)",
                                        background: today
                                            ? "rgba(59, 130, 246, 0.1)"
                                            : weekend
                                            ? "rgba(148, 163, 184, 0.05)"
                                            : "transparent",
                                    }}
                                >
                                    <div style={{
                                        fontSize: "0.625rem",
                                        color: today ? "var(--color-primary)" : "var(--color-text-muted)",
                                        textTransform: "uppercase",
                                    }}>
                                        {weekday}
                                    </div>
                                    <div style={{
                                        fontSize: "0.875rem",
                                        fontWeight: today ? 700 : 500,
                                        color: today ? "var(--color-primary)" : "var(--color-text-primary)",
                                    }}>
                                        {day}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Room Rows */}
                    {rooms.length === 0 ? (
                        <div style={{
                            padding: "2rem",
                            textAlign: "center",
                            color: "var(--color-text-muted)",
                        }}>
                            No rooms to display
                        </div>
                    ) : (
                        rooms.map((room) => (
                            <div
                                key={room.id}
                                style={{
                                    display: "flex",
                                    borderBottom: "1px solid var(--color-border)",
                                }}
                            >
                                {/* Room label */}
                                <div style={{
                                    width: "100px",
                                    minWidth: "100px",
                                    padding: "0.75rem",
                                    borderRight: "1px solid var(--color-border)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                }}>
                                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                        {room.roomNumber}
                                    </div>
                                    <div style={{
                                        fontSize: "0.625rem",
                                        color: "var(--color-text-muted)",
                                        textTransform: "capitalize",
                                    }}>
                                        {room.roomType}
                                    </div>
                                </div>

                                {/* Timeline cells */}
                                <div style={{
                                    flex: 1,
                                    position: "relative",
                                    height: `${rowHeight}px`,
                                    display: "flex",
                                }}>
                                    {/* Grid cells */}
                                    {dates.map((date, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: `${cellWidth}px`,
                                                minWidth: `${cellWidth}px`,
                                                borderRight: "1px solid var(--color-border)",
                                                background: isToday(date)
                                                    ? "rgba(59, 130, 246, 0.05)"
                                                    : isWeekend(date)
                                                    ? "rgba(148, 163, 184, 0.03)"
                                                    : "transparent",
                                            }}
                                        />
                                    ))}

                                    {/* Booking bars */}
                                    {room.bookings
                                        .filter(isBookingVisible)
                                        .map((booking) => {
                                            const style = getBookingStyle(booking);
                                            const color = statusColors[booking.status] || "#6B7280";

                                            return (
                                                <div
                                                    key={booking.id}
                                                    onMouseEnter={() => setHoveredBooking(booking.id)}
                                                    onMouseLeave={() => setHoveredBooking(null)}
                                                    style={{
                                                        position: "absolute",
                                                        top: "8px",
                                                        left: style.left,
                                                        width: style.width,
                                                        height: "32px",
                                                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                                                        borderRadius: "4px",
                                                        padding: "0 8px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        overflow: "hidden",
                                                        cursor: "pointer",
                                                        boxShadow: hoveredBooking === booking.id
                                                            ? `0 4px 12px ${color}40`
                                                            : "none",
                                                        transform: hoveredBooking === booking.id
                                                            ? "translateY(-2px)"
                                                            : "none",
                                                        transition: "all 0.2s ease",
                                                        zIndex: hoveredBooking === booking.id ? 10 : 1,
                                                    }}
                                                >
                                                    <span style={{
                                                        color: "white",
                                                        fontSize: "0.6875rem",
                                                        fontWeight: 500,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}>
                                                        {booking.guestName}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Legend */}
            <div style={{
                padding: "0.75rem 1.25rem",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                fontSize: "0.75rem",
            }}>
                {Object.entries(statusColors).map(([status, color]) => (
                    <div key={status} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <div style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "3px",
                            background: color,
                        }} />
                        <span style={{ color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
                            {status.replace("_", " ").toLowerCase()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
