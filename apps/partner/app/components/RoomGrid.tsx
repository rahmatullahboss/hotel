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

    // Enhanced blocking fields
    const [blockStartDate, setBlockStartDate] = useState("");
    const [blockEndDate, setBlockEndDate] = useState("");
    const [blockReason, setBlockReason] = useState("");
    const [showDatePickers, setShowDatePickers] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const today = new Date().toISOString().split("T")[0]!;

    const handleRoomClick = (room: RoomStatus) => {
        setSelectedRoom(room);
        setBlockStartDate(today);
        setBlockEndDate(today);
        setBlockReason("");
        setShowDatePickers(false);
        setErrorMessage(null);
        setIsModalOpen(true);
    };

    const handleQuickBlockToday = async () => {
        if (!selectedRoom) return;

        const isBlocking = selectedRoom.status !== "BLOCKED";
        setErrorMessage(null);

        // Call server action first to validate
        startTransition(async () => {
            const result = isBlocking
                ? await blockRoom(selectedRoom.id, today, today, "Quick block")
                : await unblockRoom(selectedRoom.id, today, today);

            if (!result.success) {
                // Show error and keep modal open
                setErrorMessage(result.error || "Failed to update room status");
            } else {
                // Success - update UI and close modal
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
            }
        });
    };

    const handleAdvancedBlock = async () => {
        if (!selectedRoom || !blockStartDate || !blockEndDate) return;
        setErrorMessage(null);

        startTransition(async () => {
            const result = await blockRoom(
                selectedRoom.id,
                blockStartDate,
                blockEndDate,
                blockReason || "Blocked by partner"
            );

            if (!result.success) {
                // Show error and keep modal open
                setErrorMessage(result.error || "Failed to block room");
            } else {
                // Success - update UI and close modal
                if (blockStartDate <= today && blockEndDate >= today) {
                    setRooms((prev) =>
                        prev.map((r) =>
                            r.id === selectedRoom.id
                                ? { ...r, status: "BLOCKED" }
                                : r
                        )
                    );
                }
                setIsModalOpen(false);
            }
        });
    };

    const handleAdvancedUnblock = async () => {
        if (!selectedRoom || !blockStartDate || !blockEndDate) return;

        setIsModalOpen(false);

        startTransition(async () => {
            const result = await unblockRoom(selectedRoom.id, blockStartDate, blockEndDate);

            if (result.success && blockStartDate <= today && blockEndDate >= today) {
                setRooms((prev) =>
                    prev.map((r) =>
                        r.id === selectedRoom.id
                            ? { ...r, status: "AVAILABLE" }
                            : r
                    )
                );
            }
        });
    };

    const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;
    const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
    const blockedCount = rooms.filter((r) => r.status === "BLOCKED").length;

    // Calculate number of days to block
    const getDaysCount = () => {
        if (!blockStartDate || !blockEndDate) return 0;
        const start = new Date(blockStartDate);
        const end = new Date(blockEndDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    };

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

            {/* Enhanced Room Action Modal */}
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
                            maxHeight: "85vh",
                            overflow: "auto",
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
                                marginBottom: "1rem",
                            }}
                        >
                            {selectedRoom.type} • {statusLabels[selectedRoom.status]} • ৳{selectedRoom.price.toLocaleString('en-IN')}/night
                        </p>

                        {/* Error Message Display */}
                        {errorMessage && (
                            <div style={{
                                padding: "0.75rem 1rem",
                                background: "rgba(230, 57, 70, 0.1)",
                                border: "1px solid var(--color-error)",
                                borderRadius: "0.5rem",
                                color: "var(--color-error)",
                                marginBottom: "1rem",
                                fontSize: "0.875rem",
                            }}>
                                ⚠️ {errorMessage}
                            </div>
                        )}

                        {/* Quick Actions */}
                        {!showDatePickers && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {selectedRoom.status === "AVAILABLE" && (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleQuickBlockToday}
                                            disabled={isPending}
                                        >
                                            🚫 {isPending ? "Blocking..." : "Block for Today"}
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => setShowDatePickers(true)}
                                            disabled={isPending}
                                        >
                                            📅 Block for Date Range
                                        </button>
                                    </>
                                )}
                                {selectedRoom.status === "BLOCKED" && (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={handleQuickBlockToday}
                                            disabled={isPending}
                                        >
                                            ✓ {isPending ? "Unblocking..." : "Unblock for Today"}
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => setShowDatePickers(true)}
                                            disabled={isPending}
                                        >
                                            📅 Unblock for Date Range
                                        </button>
                                    </>
                                )}
                                {selectedRoom.status === "OCCUPIED" && (
                                    <div style={{
                                        padding: "1rem",
                                        background: "rgba(230, 57, 70, 0.1)",
                                        borderRadius: "0.5rem",
                                        textAlign: "center",
                                        color: "var(--color-error)"
                                    }}>
                                        This room is currently occupied and cannot be blocked.
                                    </div>
                                )}
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ marginTop: "0.5rem" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Advanced Date Range Selection */}
                        {showDatePickers && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div
                                    style={{
                                        padding: "0.75rem",
                                        background: "var(--color-bg-secondary)",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                        color: "var(--color-text-secondary)"
                                    }}
                                >
                                    {selectedRoom.status === "BLOCKED"
                                        ? "Select dates to unblock this room"
                                        : "Select dates to block this room from bookings"
                                    }
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={blockStartDate}
                                            min={today}
                                            onChange={(e) => {
                                                setBlockStartDate(e.target.value);
                                                if (e.target.value > blockEndDate) {
                                                    setBlockEndDate(e.target.value);
                                                }
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: "0.75rem",
                                                border: "1px solid var(--color-border)",
                                                borderRadius: "0.5rem",
                                                fontSize: "0.875rem"
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={blockEndDate}
                                            min={blockStartDate || today}
                                            onChange={(e) => setBlockEndDate(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "0.75rem",
                                                border: "1px solid var(--color-border)",
                                                borderRadius: "0.5rem",
                                                fontSize: "0.875rem"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Days count */}
                                {getDaysCount() > 0 && (
                                    <div style={{
                                        textAlign: "center",
                                        padding: "0.5rem",
                                        background: selectedRoom.status === "BLOCKED"
                                            ? "rgba(42, 157, 143, 0.1)"
                                            : "rgba(230, 57, 70, 0.1)",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                        fontWeight: 500
                                    }}>
                                        {selectedRoom.status === "BLOCKED"
                                            ? `📅 Will unblock for ${getDaysCount()} day${getDaysCount() > 1 ? 's' : ''}`
                                            : `📅 Will block for ${getDaysCount()} day${getDaysCount() > 1 ? 's' : ''}`
                                        }
                                    </div>
                                )}

                                {/* Block Reason (only for blocking) */}
                                {selectedRoom.status !== "BLOCKED" && (
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                            Reason (optional)
                                        </label>
                                        <select
                                            value={blockReason}
                                            onChange={(e) => setBlockReason(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "0.75rem",
                                                border: "1px solid var(--color-border)",
                                                borderRadius: "0.5rem",
                                                fontSize: "0.875rem",
                                                background: "white"
                                            }}
                                        >
                                            <option value="">Select reason...</option>
                                            <option value="Maintenance">🔧 Maintenance</option>
                                            <option value="Renovation">🏗️ Renovation</option>
                                            <option value="Deep Cleaning">🧹 Deep Cleaning</option>
                                            <option value="Reserved for VIP">⭐ Reserved for VIP</option>
                                            <option value="Staff Accommodation">👤 Staff Accommodation</option>
                                            <option value="Out of Order">❌ Out of Order</option>
                                            <option value="Other">📝 Other</option>
                                        </select>
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => setShowDatePickers(false)}
                                        style={{ flex: 1 }}
                                    >
                                        ← Back
                                    </button>
                                    {selectedRoom.status === "BLOCKED" ? (
                                        <button
                                            className="btn btn-success"
                                            onClick={handleAdvancedUnblock}
                                            disabled={isPending || !blockStartDate || !blockEndDate}
                                            style={{ flex: 1 }}
                                        >
                                            {isPending ? "Unblocking..." : "Unblock Dates"}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleAdvancedBlock}
                                            disabled={isPending || !blockStartDate || !blockEndDate}
                                            style={{ flex: 1 }}
                                        >
                                            {isPending ? "Blocking..." : "Block Dates"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

