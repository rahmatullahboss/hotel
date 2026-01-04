"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiPlus, FiHome, FiGrid, FiClock, FiLayers } from "react-icons/fi";
import { RoomGrid, ViewToggle, FloorPlanView, RoomTimeline, BottomNav, ScannerFAB } from "../components";
import type { RoomStatus } from "../actions/inventory";

type ViewMode = "grid" | "timeline" | "floor";

interface InventoryClientProps {
    rooms: RoomStatus[];
    hotelId: string;
    role: string;
}

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
        marginBottom: "24px",
    } as React.CSSProperties,
    backLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "rgba(255,255,255,0.9)",
        fontSize: "14px",
        fontWeight: "500",
        textDecoration: "none",
        marginBottom: "12px",
    } as React.CSSProperties,
    pageTitle: {
        fontSize: "28px",
        fontWeight: "800",
        color: "white",
        margin: 0,
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    } as React.CSSProperties,
    pageSubtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: "15px",
        margin: 0,
    } as React.CSSProperties,
    main: {
        padding: "0 16px",
        maxWidth: "1000px",
        margin: "0 auto",
    } as React.CSSProperties,
    actionBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap" as const,
    } as React.CSSProperties,
    addButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "14px 24px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        color: "white",
        fontSize: "15px",
        fontWeight: "700",
        textDecoration: "none",
        boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
        transition: "all 0.2s ease",
    } as React.CSSProperties,
    viewToggleContainer: {
        display: "flex",
        background: "white",
        borderRadius: "14px",
        padding: "6px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    } as React.CSSProperties,
    viewToggleBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 18px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "600",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
    } as React.CSSProperties,
    emptyState: {
        padding: "60px 24px",
        textAlign: "center" as const,
        background: "white",
        borderRadius: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        maxWidth: "500px",
        margin: "0 auto",
    } as React.CSSProperties,
};

export function InventoryClient({ rooms, hotelId, role }: InventoryClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const timelineRooms = rooms.map((room) => ({
        id: room.id,
        roomNumber: room.number,
        roomType: room.type,
        bookings: [],
    }));

    const floorPlanRooms = rooms.map((room) => ({
        id: room.id,
        roomNumber: room.number,
        roomType: room.type,
        floor: parseInt(room.number.charAt(0)) || 1,
        status: room.status,
        guestName: undefined,
    }));

    const viewOptions = [
        { mode: "grid" as ViewMode, icon: FiGrid, label: "Grid" },
        { mode: "timeline" as ViewMode, icon: FiClock, label: "Timeline" },
        { mode: "floor" as ViewMode, icon: FiLayers, label: "Floor" },
    ];

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <Link href="/" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <FiHome size={28} />
                        Room Inventory
                    </h1>
                    <p style={styles.pageSubtitle}>
                        {rooms.length} rooms • Tap a room to manage
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Action Bar */}
                <div style={styles.actionBar}>
                    {/* Custom View Toggle */}
                    <div style={styles.viewToggleContainer}>
                        {viewOptions.map((option) => (
                            <button
                                key={option.mode}
                                onClick={() => setViewMode(option.mode)}
                                style={{
                                    ...styles.viewToggleBtn,
                                    background: viewMode === option.mode
                                        ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                                        : "transparent",
                                    color: viewMode === option.mode ? "white" : "#6b7280",
                                    boxShadow: viewMode === option.mode
                                        ? "0 4px 12px rgba(139, 92, 246, 0.3)"
                                        : "none",
                                }}
                            >
                                <option.icon size={16} />
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <Link href="/inventory/rooms" style={styles.addButton}>
                        <FiPlus size={18} />
                        Add Room
                    </Link>
                </div>

                {rooms.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}>
                            <FiHome size={48} color="#8b5cf6" />
                        </div>
                        <h3 style={{
                            fontSize: "22px",
                            fontWeight: "700",
                            color: "#1a1a2e",
                            marginBottom: "12px",
                        }}>
                            No Rooms Yet
                        </h3>
                        <p style={{
                            fontSize: "15px",
                            color: "#6b7280",
                            marginBottom: "28px",
                            lineHeight: "1.6",
                        }}>
                            Add rooms to start managing your inventory and track availability.
                        </p>
                        <Link href="/inventory/rooms" style={styles.addButton}>
                            <FiPlus size={18} />
                            Add Your First Room
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

            <ScannerFAB />
            <BottomNav role={role as "OWNER" | "MANAGER" | "RECEPTIONIST"} />
        </div>
    );
}
