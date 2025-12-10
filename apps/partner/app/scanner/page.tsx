"use client";

import { useState } from "react";
import { BottomNav } from "../components";

export default function ScannerPage() {
    const [bookingId, setBookingId] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        guest?: { name: string; room: string };
    } | null>(null);

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Mock check-in result
        if (bookingId.trim()) {
            setResult({
                success: true,
                message: "Guest found! Ready to check in.",
                guest: {
                    name: "Mohammad Rahman",
                    room: "Room 101",
                },
            });
        }
    };

    const handleCheckIn = () => {
        // TODO: Call Server Action to check in guest
        setResult({
            success: true,
            message: "✓ Guest checked in successfully!",
        });
        setTimeout(() => {
            window.location.href = "/";
        }, 2000);
    };

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">Check-in Guest</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Scan QR code or enter booking ID
                </p>
            </header>

            <main style={{ padding: "1rem" }}>
                {/* Camera Scanner Area */}
                <div
                    className="card"
                    style={{
                        aspectRatio: "1",
                        maxWidth: "320px",
                        margin: "0 auto 1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isScanning ? "#000" : "var(--color-bg-secondary)",
                    }}
                >
                    {isScanning ? (
                        <div style={{ color: "white", textAlign: "center" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📷</div>
                            <p>Point camera at QR code</p>
                            <button
                                className="btn btn-outline"
                                style={{ marginTop: "1rem", color: "white", borderColor: "white" }}
                                onClick={() => setIsScanning(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📲</div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setIsScanning(true)}
                            >
                                Start QR Scanner
                            </button>
                        </>
                    )}
                </div>

                {/* Divider */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div
                        style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }}
                    />
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                        or
                    </span>
                    <div
                        style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }}
                    />
                </div>

                {/* Manual Entry */}
                <form onSubmit={handleManualSearch}>
                    <label
                        htmlFor="bookingId"
                        style={{
                            display: "block",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                        }}
                    >
                        Enter Booking ID
                    </label>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <input
                            id="bookingId"
                            type="text"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            placeholder="e.g., VBK-123456"
                            style={{
                                flex: 1,
                                padding: "0.75rem 1rem",
                                fontSize: "1rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                outline: "none",
                            }}
                        />
                        <button type="submit" className="btn btn-primary">
                            Search
                        </button>
                    </div>
                </form>

                {/* Result Card */}
                {result && (
                    <div
                        className="card"
                        style={{
                            marginTop: "1.5rem",
                            padding: "1.5rem",
                            borderColor: result.success
                                ? "var(--color-success)"
                                : "var(--color-error)",
                        }}
                    >
                        {result.guest ? (
                            <>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                                            {result.guest.name}
                                        </div>
                                        <div style={{ color: "var(--color-text-secondary)" }}>
                                            {result.guest.room}
                                        </div>
                                    </div>
                                    <span className="badge badge-success">Verified</span>
                                </div>
                                <button
                                    className="btn btn-accent"
                                    style={{ width: "100%" }}
                                    onClick={handleCheckIn}
                                >
                                    ✓ Check In Guest
                                </button>
                            </>
                        ) : (
                            <div
                                style={{
                                    textAlign: "center",
                                    color: "var(--color-success)",
                                    fontSize: "1.25rem",
                                    fontWeight: 600,
                                }}
                            >
                                {result.message}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </>
    );
}
