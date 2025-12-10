"use client";

import { useState, useTransition } from "react";
import { blockRoom, unblockRoom, type RoomStatus } from "../actions/inventory";

interface RoomGridProps {
    initialRooms: RoomStatus[];
    hotelId: string;
}

const statusLabels: Record<RoomStatus["status"], string> = {
    AVAILABLE: "Available",
    OCCUPIED: "Occupied",
    BLOCKED: "Blocked",
};

export function RoomGrid({ initialRooms, hotelId }: RoomGridProps) {
    const [rooms, setRooms] = useState<RoomStatus[]>(initialRooms);
    const [selectedRoom, setSelectedRoom] = useState<RoomStatus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleRoomClick = (room: RoomStatus) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const handleToggleBlock = async () => {
        if (!selectedRoom) return;

        const today = new Date().toISOString().split("T")[0]!;
        const isBlocking = selectedRoom.status !== "BLOCKED";

        // Optimistic UI update
        setRooms((prev) =>
            prev.map((r) =>
                r.id === selectedRoom.id
                    ? {
                        ...r,
                        status: isBlocking ? "BLOCKED" : "AVAILABLE",
                    }
                    : r
            )
        );

        setIsModalOpen(false);

        // Call server action
        startTransition(async () => {
            const result = isBlocking
                ? await blockRoom(selectedRoom.id, today, today)
                : await unblockRoom(selectedRoom.id, today, today);

            if (!result.success) {
                // Revert on error
                setRooms((prev) =>
                    prev.map((r) =>
                        r.id === selectedRoom.id
                            ? { ...r, status: selectedRoom.status }
                            : r
                    )
                );
            }
        });
    };

    const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;
    const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
    const blockedCount = rooms.filter((r) => r.status === "BLOCKED").length;

    return (
        <>
            {/* Summary Pills */}
            <div
                style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                    overflowX: "auto",
                    paddingBottom: "0.5rem",
                }}
            >
                <span className="badge badge-success">
                    {availableCount} Available
                </span>
                <span className="badge badge-error">
                    {occupiedCount} Occupied
                </span>
                <span
                    className="badge"
                    style={{
                        backgroundColor: "rgba(100, 116, 139, 0.1)",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    {blockedCount} Blocked
                </span>
            </div>

            {/* Room Grid */}
            <div className="room-grid">
                {rooms.length === 0 ? (
                    <div
                        style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            padding: "2rem",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        No rooms found. Add rooms to your hotel first.
                    </div>
                ) : (
                    rooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => handleRoomClick(room)}
                            disabled={isPending}
                            className={`room-card ${room.status === "AVAILABLE"
                                ? "room-available"
                                : room.status === "OCCUPIED"
                                    ? "room-occupied"
                                    : "room-blocked"
                                }`}
                        >
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                                {room.number}
                            </span>
                            <span style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                {room.type}
                            </span>
                        </button>
                    ))
                )}
            </div>

            {/* Room Action Modal */}
            {isModalOpen && selectedRoom && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "flex-end",
                        zIndex: 200,
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="card"
                        style={{
                            width: "100%",
                            borderRadius: "1.5rem 1.5rem 0 0",
                            padding: "1.5rem",
                            paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                marginBottom: "0.5rem",
                            }}
                        >
                            Room {selectedRoom.number}
                        </h3>
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                marginBottom: "1.5rem",
                            }}
                        >
                            {selectedRoom.type} • {statusLabels[selectedRoom.status]} • ৳{selectedRoom.price.toLocaleString()}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {selectedRoom.status === "AVAILABLE" && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleToggleBlock}
                                    disabled={isPending}
                                >
                                    {isPending ? "Blocking..." : "Block Room"}
                                </button>
                            )}
                            {selectedRoom.status === "BLOCKED" && (
                                <button
                                    className="btn btn-success"
                                    onClick={handleToggleBlock}
                                    disabled={isPending}
                                >
                                    {isPending ? "Unblocking..." : "Unblock Room"}
                                </button>
                            )}
                            {selectedRoom.status === "OCCUPIED" && (
                                <button className="btn btn-accent" disabled>
                                    Room is Occupied
                                </button>
                            )}
                            <button
                                className="btn btn-outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
