"use client";

import { useState } from "react";

interface Room {
    id: string;
    roomNumber: string;
    roomType: string;
    floor: number;
    status: "AVAILABLE" | "OCCUPIED" | "BLOCKED";
    guestName?: string;
}

interface FloorPlanViewProps {
    rooms: Room[];
    onRoomClick?: (room: Room) => void;
}

const statusColors = {
    AVAILABLE: { bg: "rgba(16, 185, 129, 0.15)", border: "#10B981", text: "#10B981" },
    OCCUPIED: { bg: "rgba(239, 68, 68, 0.15)", border: "#EF4444", text: "#EF4444" },
    BLOCKED: { bg: "rgba(148, 163, 184, 0.15)", border: "#94A3B8", text: "#64748B" },
};

export function FloorPlanView({ rooms, onRoomClick }: FloorPlanViewProps) {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

    // Group rooms by floor
    const floors = rooms.reduce((acc, room) => {
        const floor = room.floor || 1;
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(room);
        return acc;
    }, {} as Record<number, Room[]>);

    const sortedFloors = Object.keys(floors)
        .map(Number)
        .sort((a, b) => b - a); // Highest floor first

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(selectedRoom === room.id ? null : room.id);
        onRoomClick?.(room);
    };

    // Calculate stats
    const availableRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
    const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
    const blockedRooms = rooms.filter((r) => r.status === "BLOCKED").length;

    return (
        <div className="glass-card animate-slide-up" style={{ overflow: "hidden" }}>
            {/* Header with Stats */}
            <div style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
            }}>
                <h2 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    <span>🏨</span> Floor Plan
                </h2>

                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <div style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#10B981",
                        }} />
                        <span>{availableRooms} Available</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <div style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#EF4444",
                        }} />
                        <span>{occupiedRooms} Occupied</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <div style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#94A3B8",
                        }} />
                        <span>{blockedRooms} Blocked</span>
                    </div>
                </div>
            </div>

            {/* Floor Plan */}
            <div style={{ padding: "1rem 1.25rem" }}>
                {sortedFloors.length === 0 ? (
                    <div style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--color-text-muted)",
                    }}>
                        No rooms to display
                    </div>
                ) : (
                    sortedFloors.map((floorNum) => (
                        <div key={floorNum} style={{ marginBottom: "1.5rem" }}>
                            {/* Floor Label */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "0.75rem",
                            }}>
                                <div style={{
                                    background: "var(--color-primary)",
                                    color: "white",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                }}>
                                    Floor {floorNum}
                                </div>
                                <div style={{
                                    flex: 1,
                                    height: "1px",
                                    background: "var(--color-border)",
                                }} />
                                <span style={{
                                    fontSize: "0.75rem",
                                    color: "var(--color-text-muted)",
                                }}>
                                    {floors[floorNum]?.length || 0} rooms
                                </span>
                            </div>

                            {/* Room Grid */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                                gap: "0.75rem",
                            }}>
                                {floors[floorNum]
                                    ?.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
                                    .map((room) => {
                                        const colors = statusColors[room.status];
                                        const isSelected = selectedRoom === room.id;

                                        return (
                                            <button
                                                key={room.id}
                                                onClick={() => handleRoomClick(room)}
                                                style={{
                                                    padding: "0.75rem",
                                                    borderRadius: "0.75rem",
                                                    border: `2px solid ${isSelected ? "var(--color-primary)" : colors.border}`,
                                                    background: isSelected
                                                        ? "rgba(59, 130, 246, 0.1)"
                                                        : colors.bg,
                                                    cursor: "pointer",
                                                    textAlign: "center",
                                                    transition: "all 0.2s ease",
                                                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                                                    boxShadow: isSelected
                                                        ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                                                        : "none",
                                                }}
                                            >
                                                <div style={{
                                                    fontSize: "1.125rem",
                                                    fontWeight: 700,
                                                    color: isSelected ? "var(--color-primary)" : colors.text,
                                                }}>
                                                    {room.roomNumber}
                                                </div>
                                                <div style={{
                                                    fontSize: "0.625rem",
                                                    color: "var(--color-text-muted)",
                                                    textTransform: "capitalize",
                                                    marginTop: "2px",
                                                }}>
                                                    {room.roomType.replace("_", " ").toLowerCase()}
                                                </div>
                                                {room.status === "OCCUPIED" && room.guestName && (
                                                    <div style={{
                                                        fontSize: "0.625rem",
                                                        color: "var(--color-text-secondary)",
                                                        marginTop: "4px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}>
                                                        {room.guestName}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
