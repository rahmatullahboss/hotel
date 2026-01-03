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
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                    background: "white",
                    padding: "16px",
                    borderRadius: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    border: "1px solid #f1f5f9",
                    maxWidth: "1200px",
                    margin: "0 auto 16px auto"
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
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                        Room Inventory
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0, marginTop: "4px" }}>
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

            <main className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {rooms.length === 0 ? (
                    <div style={{ 
                        padding: "48px 24px", 
                        textAlign: "center",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        border: "1px solid #f1f5f9",
                        maxWidth: "600px",
                        margin: "0 auto"
                    }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1rem", lineHeight: 1 }}>🏨</div>
                        <h3 style={{ marginBottom: "0.5rem", fontWeight: 600, color: "#1e293b", fontSize: "1.25rem" }}>No Rooms Yet</h3>
                        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                            Add rooms to start managing your inventory.
                        </p>
                        <Link href="/inventory/rooms" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
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
