"use client";

import { useState } from "react";
import { FiUser, FiMail, FiPhone, FiStar, FiMapPin } from "react-icons/fi";

interface Guest {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    nationality?: string;
    totalStays: number;
    totalSpent: number;
    lastVisit: string;
    averageRating?: number;
    isVIP?: boolean;
    preferences?: string[];
}

interface GuestProfileCardProps {
    guest: Guest;
    onViewDetails?: (guest: Guest) => void;
}

export function GuestProfileCard({ guest, onViewDetails }: GuestProfileCardProps) {
    return (
        <div
            className="glass-card animate-slide-up"
            style={{
                padding: "1rem",
                cursor: onViewDetails ? "pointer" : "default",
            }}
            onClick={() => onViewDetails?.(guest)}
        >
            <div style={{ display: "flex", gap: "1rem" }}>
                {/* Avatar */}
                <div
                    style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        background: guest.isVIP
                            ? "linear-gradient(135deg, #F59E0B, #FBBF24)"
                            : "linear-gradient(135deg, var(--color-primary), #60A5FA)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        position: "relative",
                        flexShrink: 0,
                    }}
                >
                    {guest.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    {guest.isVIP && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: "-4px",
                                right: "-4px",
                                background: "#F59E0B",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid var(--color-bg-primary)",
                            }}
                        >
                            <FiStar size={10} color="white" fill="white" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "2px" }}>
                                {guest.name}
                            </h3>
                            {guest.nationality && (
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <FiMapPin size={10} />
                                    {guest.nationality}
                                </div>
                            )}
                        </div>
                        {guest.averageRating && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    background: "rgba(245, 158, 11, 0.1)",
                                    padding: "4px 8px",
                                    borderRadius: "8px",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "#F59E0B",
                                }}
                            >
                                <FiStar size={12} fill="#F59E0B" />
                                {guest.averageRating.toFixed(1)}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            marginTop: "0.75rem",
                            fontSize: "0.8125rem",
                        }}
                    >
                        <div>
                            <span style={{ color: "var(--color-text-muted)" }}>Stays: </span>
                            <span style={{ fontWeight: 600 }}>{guest.totalStays}</span>
                        </div>
                        <div>
                            <span style={{ color: "var(--color-text-muted)" }}>Spent: </span>
                            <span style={{ fontWeight: 600, color: "var(--color-success)" }}>
                                ৳{guest.totalSpent.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Contact */}
                    <div
                        style={{
                            display: "flex",
                            gap: "0.75rem",
                            marginTop: "0.5rem",
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        {guest.email && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <FiMail size={10} />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
                                    {guest.email}
                                </span>
                            </div>
                        )}
                        {guest.phone && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <FiPhone size={10} />
                                {guest.phone}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preferences */}
            {guest.preferences && guest.preferences.length > 0 && (
                <div
                    style={{
                        marginTop: "0.75rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid var(--color-border)",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.375rem",
                    }}
                >
                    {guest.preferences.slice(0, 4).map((pref) => (
                        <span
                            key={pref}
                            style={{
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background: "var(--color-bg-secondary)",
                                fontSize: "0.6875rem",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {pref}
                        </span>
                    ))}
                    {guest.preferences.length > 4 && (
                        <span
                            style={{
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background: "var(--color-bg-secondary)",
                                fontSize: "0.6875rem",
                                color: "var(--color-text-muted)",
                            }}
                        >
                            +{guest.preferences.length - 4} more
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

interface GuestListProps {
    guests: Guest[];
    title?: string;
    onViewDetails?: (guest: Guest) => void;
}

export function GuestList({ guests, title = "Recent Guests", onViewDetails }: GuestListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredGuests = guests.filter((guest) =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone?.includes(searchQuery)
    );

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
                    gap: "1rem",
                    flexWrap: "wrap",
                }}
            >
                <h2 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FiUser size={18} />
                    {title}
                </h2>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search guests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-bg-secondary)",
                        fontSize: "0.8125rem",
                        width: "180px",
                        outline: "none",
                    }}
                />
            </div>

            {/* Guest List */}
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {filteredGuests.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                        {searchQuery ? "No guests found" : "No guests yet"}
                    </div>
                ) : (
                    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {filteredGuests.map((guest) => (
                            <GuestProfileCard key={guest.id} guest={guest} onViewDetails={onViewDetails} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
