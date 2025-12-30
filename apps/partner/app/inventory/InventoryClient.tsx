"use client";

import { useState } from "react";
import Link from "next/link";
import { RoomGrid, ViewToggle, FloorPlanView, RoomTimeline, BottomNav, ScannerFAB } from "../components";
import type { RoomStatus } from "../actions/inventory";

type ViewMode = "grid" | "timeline" | "floor";

interface InventoryClientProps {
    rooms: RoomStatus[];
    hotelId: string;
    role: string;
}

export function InventoryClient({ rooms, hotelId, role }: InventoryClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    // Transform rooms for timeline view (bookings need to be fetched separately)
    const timelineRooms = rooms.map((room) => ({
        id: room.id,
        roomNumber: room.number,
        roomType: room.type,
        bookings: [], // Timeline will show empty - bookings need separate fetch
    }));

    // Transform rooms for floor plan view
    const floorPlanRooms = rooms.map((room) => ({
        id: room.id,
        roomNumber: room.number,
        roomType: room.type,
        floor: parseInt(room.number.charAt(0)) || 1, // Extract floor from room number (e.g., "201" -> 2)
        status: room.status,
        guestName: undefined, // Guest info needs separate fetch
    }));

    return (
        <>
            {/* Header */}
            <header
                className="page-header glass"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <Link
                        href="/"
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.5rem",
                            textDecoration: "none",
                            color: "inherit",
                            display: "block",
                            marginBottom: "0.5rem",
                        }}
                    >
                        ←
                    </Link>
                    <h1 className="page-title gradient-text" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                        Room Inventory
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        {rooms.length} rooms • Tap a room to manage
                    </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
                    <Link href="/inventory/rooms" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                        + Add Room
                    </Link>
                </div>
            </header>

            <main className="animate-fade-in">
                {rooms.length === 0 ? (
                    <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏨</div>
                        <h3 style={{ marginBottom: "0.5rem", fontWeight: 600 }}>No Rooms Yet</h3>
                        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                            Add rooms to start managing your inventory.
                        </p>
                        <Link href="/inventory/rooms" className="btn-gradient" style={{ padding: "0.75rem 1.5rem" }}>
                            + Add Your First Room
                        </Link>
                    </div>
                ) : (
                    <>
                        {viewMode === "grid" && (
                            <RoomGrid initialRooms={rooms} hotelId={hotelId} />
                        )}

                        {viewMode === "timeline" && (
                            <RoomTimeline rooms={timelineRooms} daysToShow={14} />
                        )}

                        {viewMode === "floor" && (
                            <FloorPlanView rooms={floorPlanRooms} />
                        )}
                    </>
                )}
            </main>

            {/* Scanner FAB */}
            <ScannerFAB />

            {/* Bottom Navigation */}
            <BottomNav role={role as any} />
        </>
    );
}
