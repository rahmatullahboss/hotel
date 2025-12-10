"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components";
import { findBookingById, checkInGuest, getPartnerHotel } from "../actions/dashboard";

interface BookingResult {
    id: string;
    guestName: string;
    guestPhone: string;
    roomNumber: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalAmount: number;
}

export default function ScannerPage() {
    const router = useRouter();
    const [hotelId, setHotelId] = useState<string | null>(null);
    const [bookingId, setBookingId] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        booking?: BookingResult;
    } | null>(null);
    const [checkInDone, setCheckInDone] = useState(false);

    // Get hotel ID on mount
    useEffect(() => {
        getPartnerHotel().then((hotel) => {
            if (hotel) {
                setHotelId(hotel.id);
            } else {
                router.push("/auth/signin");
            }
        });
    }, [router]);

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookingId.trim() || !hotelId) return;

        startTransition(async () => {
            const response = await findBookingById(bookingId.trim(), hotelId);

            if (response.success && response.booking) {
                setResult({
                    success: true,
                    message: "Guest found! Ready to check in.",
                    booking: response.booking,
                });
            } else {
                setResult({
                    success: false,
                    message: response.error || "Booking not found",
                });
            }
        });
    };

    const handleCheckIn = async () => {
        if (!result?.booking || !hotelId) return;

        startTransition(async () => {
            const response = await checkInGuest(result.booking!.id, hotelId);

            if (response.success) {
                setCheckInDone(true);
                setResult({
                    success: true,
                    message: "✓ Guest checked in successfully!",
                });
                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } else {
                setResult({
                    success: false,
                    message: response.error || "Failed to check in guest",
                    booking: result.booking,
                });
            }
        });
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
                            placeholder="Enter booking ID or UUID"
                            style={{
                                flex: 1,
                                padding: "0.75rem 1rem",
                                fontSize: "1rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                outline: "none",
                            }}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isPending || !hotelId}
                        >
                            {isPending ? "..." : "Search"}
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
                        {result.booking && !checkInDone ? (
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
                                            {result.booking.guestName}
                                        </div>
                                        <div style={{ color: "var(--color-text-secondary)" }}>
                                            Room {result.booking.roomNumber} • {result.booking.roomName}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                                            Check-in: {result.booking.checkIn} • Check-out: {result.booking.checkOut}
                                        </div>
                                    </div>
                                    <span className={`badge ${result.booking.status === "CONFIRMED" ? "badge-success" : "badge-warning"}`}>
                                        {result.booking.status}
                                    </span>
                                </div>
                                {result.booking.status === "CONFIRMED" ? (
                                    <button
                                        className="btn btn-accent"
                                        style={{ width: "100%" }}
                                        onClick={handleCheckIn}
                                        disabled={isPending}
                                    >
                                        {isPending ? "Processing..." : "✓ Check In Guest"}
                                    </button>
                                ) : result.booking.status === "CHECKED_IN" ? (
                                    <div style={{ textAlign: "center", color: "var(--color-success)", fontWeight: 600 }}>
                                        Guest is already checked in
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", color: "var(--color-warning)", fontWeight: 600 }}>
                                        Booking must be confirmed before check-in
                                    </div>
                                )}
                            </>
                        ) : (
                            <div
                                style={{
                                    textAlign: "center",
                                    color: result.success ? "var(--color-success)" : "var(--color-error)",
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
