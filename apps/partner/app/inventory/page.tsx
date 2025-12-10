"use client";

import { useState } from "react";
import { BottomNav, ScannerFAB } from "../components";

// Room status types
type RoomStatus = "available" | "occupied" | "blocked";

interface Room {
    id: string;
    name: string;
    type: string;
    status: RoomStatus;
    guestName?: string;
}

// Mock data - will be replaced with Server Actions
const mockRooms: Room[] = [
    { id: "1", name: "101", type: "Double", status: "available" },
    { id: "2", name: "102", type: "Double", status: "occupied", guestName: "M. Rahman" },
    { id: "3", name: "103", type: "Single", status: "available" },
    { id: "4", name: "104", type: "Double", status: "blocked" },
    { id: "5", name: "105", type: "Suite", status: "available" },
    { id: "6", name: "201", type: "Double", status: "occupied", guestName: "F. Akter" },
    { id: "7", name: "202", type: "Double", status: "available" },
    { id: "8", name: "203", type: "Single", status: "available" },
    { id: "9", name: "204", type: "Double", status: "occupied", guestName: "K. Ahmed" },
    { id: "10", name: "205", type: "Suite", status: "available" },
    { id: "11", name: "301", type: "Double", status: "blocked" },
    { id: "12", name: "302", type: "Double", status: "available" },
];

const statusLabels: Record<RoomStatus, string> = {
    available: "Available",
    occupied: "Occupied",
    blocked: "Blocked",
};

export default function InventoryPage() {
    const [rooms, setRooms] = useState<Room[]>(mockRooms);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const handleToggleBlock = () => {
        if (!selectedRoom) return;

        // Optimistic UI update
        setRooms((prev) =>
            prev.map((r) =>
                r.id === selectedRoom.id
                    ? {
                        ...r,
                        status: r.status === "blocked" ? "available" : "blocked",
                    }
                    : r
            )
        );

        setIsModalOpen(false);
        // TODO: Call Server Action to persist change
    };

    const availableCount = rooms.filter((r) => r.status === "available").length;
    const occupiedCount = rooms.filter((r) => r.status === "occupied").length;
    const blockedCount = rooms.filter((r) => r.status === "blocked").length;

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">Room Inventory</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Tap a room to block/unblock
                </p>
            </header>

            <main style={{ padding: "1rem" }}>
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
                    {rooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => handleRoomClick(room)}
                            className={`room-card ${room.status === "available"
                                    ? "room-available"
                                    : room.status === "occupied"
                                        ? "room-occupied"
                                        : "room-blocked"
                                }`}
                        >
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                                {room.name}
                            </span>
                            <span style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                {room.type}
                            </span>
                            {room.guestName && (
                                <span
                                    style={{
                                        fontSize: "0.625rem",
                                        marginTop: "0.5rem",
                                        opacity: 0.8,
                                    }}
                                >
                                    {room.guestName}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </main>

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
                            Room {selectedRoom.name}
                        </h3>
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                marginBottom: "1.5rem",
                            }}
                        >
                            {selectedRoom.type} • {statusLabels[selectedRoom.status]}
                            {selectedRoom.guestName && ` • ${selectedRoom.guestName}`}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {selectedRoom.status === "available" && (
                                <button className="btn btn-primary" onClick={handleToggleBlock}>
                                    Block Room
                                </button>
                            )}
                            {selectedRoom.status === "blocked" && (
                                <button className="btn btn-success" onClick={handleToggleBlock}>
                                    Unblock Room
                                </button>
                            )}
                            {selectedRoom.status === "occupied" && (
                                <button className="btn btn-accent">
                                    Check Out Guest
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

            {/* Scanner FAB */}
            <ScannerFAB onClick={() => (window.location.href = "/scanner")} />

            {/* Bottom Navigation */}
            <BottomNav />
        </>
    );
}
