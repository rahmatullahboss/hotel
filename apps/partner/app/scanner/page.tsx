"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, QRScanner } from "../components";
import { findBookingById, checkInGuest, checkOutGuest, getPartnerHotel, collectRemainingPayment } from "../actions/dashboard";

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
    paymentStatus?: string;
    paymentMethod?: string;
    advancePaid?: number;
    remainingAmount?: number;
    bookingFeeStatus?: string;
    numberOfNights?: number;
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
    const [actionDone, setActionDone] = useState(false);

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

    const handleQRScan = (decodedText: string) => {
        setIsScanning(false);

        // Try to extract booking ID from QR code
        // QR code format: JSON with bookingId, or just the booking ID string
        let extractedBookingId = decodedText;

        try {
            const parsed = JSON.parse(decodedText);
            if (parsed.bookingId) {
                extractedBookingId = parsed.bookingId;
            }
        } catch {
            // Not JSON, use as-is (might be just the booking ID)
        }

        setBookingId(extractedBookingId);
        // Automatically search for the booking
        handleSearch(extractedBookingId);
    };

    const handleSearch = async (searchId?: string) => {
        const idToSearch = searchId || bookingId.trim();
        if (!idToSearch || !hotelId) return;

        startTransition(async () => {
            const response = await findBookingById(idToSearch, hotelId);

            if (response.success && response.booking) {
                setResult({
                    success: true,
                    message: "Booking found!",
                    booking: response.booking as BookingResult,
                });
                setActionDone(false);
            } else {
                setResult({
                    success: false,
                    message: response.error || "Booking not found",
                });
            }
        });
    };

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    const handleCheckIn = async () => {
        if (!result?.booking || !hotelId) return;

        // Validate check-in date
        const today = new Date().toISOString().split("T")[0]!;
        if (result.booking.checkIn > today) {
            setResult({
                ...result,
                success: false,
                message: `Check-in is not available yet. Scheduled for ${result.booking.checkIn}`,
            });
            return;
        }

        startTransition(async () => {
            const response = await checkInGuest(result.booking!.id, hotelId);

            if (response.success) {
                setActionDone(true);
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

    const handleCheckOut = async () => {
        if (!result?.booking || !hotelId) return;

        startTransition(async () => {
            const response = await checkOutGuest(result.booking!.id, hotelId);

            if (response.success) {
                setActionDone(true);
                setResult({
                    success: true,
                    message: "✓ Guest checked out successfully! Loyalty points awarded.",
                });
                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } else {
                setResult({
                    success: false,
                    message: response.error || "Failed to check out guest",
                    booking: result.booking,
                });
            }
        });
    };

    const handleCollectPayment = async () => {
        if (!result?.booking || !hotelId) return;

        startTransition(async () => {
            const response = await collectRemainingPayment(result.booking!.id, hotelId);

            if (response.success) {
                // Refresh booking data to show updated payment status
                const refreshed = await findBookingById(result.booking!.id, hotelId);
                if (refreshed.success && refreshed.booking) {
                    setResult({
                        success: true,
                        message: `৳${response.amountCollected?.toLocaleString()} collected successfully!`,
                        booking: refreshed.booking as BookingResult,
                    });
                }
            } else {
                setResult({
                    success: false,
                    message: response.error || "Failed to collect payment",
                    booking: result.booking,
                });
            }
        });
    };

    const resetSearch = () => {
        setResult(null);
        setBookingId("");
        setActionDone(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { class: string; label: string }> = {
            PENDING: { class: "badge-warning", label: "Pending" },
            CONFIRMED: { class: "badge-success", label: "Ready for Check-in" },
            CHECKED_IN: { class: "badge-primary", label: "Currently Staying" },
            CHECKED_OUT: { class: "badge-secondary", label: "Completed" },
            CANCELLED: { class: "badge-error", label: "Cancelled" },
        };
        return styles[status] || { class: "badge-secondary", label: status };
    };

    return (
        <>
            {/* QR Scanner Modal */}
            {isScanning && (
                <QRScanner
                    onScanSuccess={handleQRScan}
                    onScanError={(err) => {
                        setResult({
                            success: false,
                            message: `Camera error: ${err}`,
                        });
                    }}
                    onClose={() => setIsScanning(false)}
                />
            )}

            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">Guest Check-in / Check-out</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Scan QR code or enter booking ID
                </p>
            </header>

            <main>
                {!result ? (
                    <>
                        {/* Scan QR Button */}
                        <div
                            className="card"
                            style={{
                                padding: "2rem",
                                textAlign: "center",
                                marginBottom: "1.5rem",
                                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                                color: "white",
                            }}
                        >
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📱</div>
                            <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Quick Scan</h3>
                            <p style={{ opacity: 0.9, marginBottom: "1rem", fontSize: "0.875rem" }}>
                                Scan guest&apos;s booking QR code
                            </p>
                            <button
                                className="btn"
                                onClick={() => setIsScanning(true)}
                                disabled={!hotelId}
                                style={{
                                    backgroundColor: "white",
                                    color: "var(--color-primary)",
                                    fontWeight: 600,
                                }}
                            >
                                📷 Open Scanner
                            </button>
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
                            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
                            <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                                or enter manually
                            </span>
                            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
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
                                Booking ID
                            </label>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <input
                                    id="bookingId"
                                    type="text"
                                    value={bookingId}
                                    onChange={(e) => setBookingId(e.target.value)}
                                    placeholder="Enter booking ID"
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
                                    disabled={isPending || !hotelId || !bookingId.trim()}
                                >
                                    {isPending ? "..." : "Search"}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    /* Result Card */
                    <div
                        className="card"
                        style={{
                            padding: "1.5rem",
                            borderLeft: `4px solid ${result.success ? "var(--color-success)" : "var(--color-error)"}`,
                        }}
                    >
                        {result.booking && !actionDone ? (
                            <>
                                {/* Guest Info */}
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                                                {result.booking.guestName}
                                            </div>
                                            <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                                                📞 {result.booking.guestPhone}
                                            </div>
                                        </div>
                                        <span className={`badge ${getStatusBadge(result.booking.status).class}`}>
                                            {getStatusBadge(result.booking.status).label}
                                        </span>
                                    </div>

                                    {/* Room Info */}
                                    <div
                                        style={{
                                            background: "var(--color-bg-secondary)",
                                            padding: "1rem",
                                            borderRadius: "0.5rem",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                                            🏨 Room {result.booking.roomNumber} - {result.booking.roomName}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                            📅 {formatDate(result.booking.checkIn)} → {formatDate(result.booking.checkOut)}
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div
                                        style={{
                                            padding: "0.75rem 0",
                                            borderTop: "1px solid var(--color-border)",
                                        }}
                                    >
                                        {/* Show payment breakdown for Pay at Hotel */}
                                        {result.booking.paymentMethod === "PAY_AT_HOTEL" && result.booking.bookingFeeStatus === "PAID" ? (
                                            <>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        marginBottom: "0.5rem",
                                                    }}
                                                >
                                                    <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                                        ✅ Advance Paid
                                                    </span>
                                                    <span style={{ fontWeight: 600, color: "var(--color-success)" }}>
                                                        ৳{(result.booking.advancePaid || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        padding: "0.75rem",
                                                        background: result.booking.paymentStatus === "PAID"
                                                            ? "rgba(42, 157, 143, 0.1)"
                                                            : "rgba(230, 57, 70, 0.1)",
                                                        borderRadius: "0.5rem",
                                                    }}
                                                >
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: result.booking.paymentStatus === "PAID"
                                                            ? "var(--color-success)"
                                                            : "var(--color-primary)"
                                                    }}>
                                                        {result.booking.paymentStatus === "PAID"
                                                            ? "✅ Fully Paid"
                                                            : "💵 Collect at Hotel"}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "1.125rem",
                                                        fontWeight: 700,
                                                        color: result.booking.paymentStatus === "PAID"
                                                            ? "var(--color-success)"
                                                            : "var(--color-primary)"
                                                    }}>
                                                        ৳{(result.booking.remainingAmount || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span style={{ color: "var(--color-text-secondary)" }}>
                                                    Total Amount
                                                </span>
                                                <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                                                    ৳{result.booking.totalAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {/* Collect Payment Button - Show when payment is pending for Pay at Hotel */}
                                    {result.booking.paymentMethod === "PAY_AT_HOTEL" &&
                                        result.booking.paymentStatus !== "PAID" &&
                                        result.booking.remainingAmount && result.booking.remainingAmount > 0 && (
                                            <button
                                                className="btn"
                                                style={{
                                                    width: "100%",
                                                    padding: "1rem",
                                                    background: "linear-gradient(135deg, #2a9d8f 0%, #264653 100%)",
                                                    color: "white",
                                                    fontWeight: 600,
                                                }}
                                                onClick={handleCollectPayment}
                                                disabled={isPending}
                                            >
                                                {isPending ? "Processing..." : `💵 Collect ৳${result.booking.remainingAmount.toLocaleString()}`}
                                            </button>
                                        )}

                                    {result.booking.status === "CONFIRMED" && (
                                        <button
                                            className="btn btn-accent"
                                            style={{ width: "100%", padding: "1rem" }}
                                            onClick={handleCheckIn}
                                            disabled={isPending}
                                        >
                                            {isPending ? "Processing..." : "✓ Check In Guest"}
                                        </button>
                                    )}

                                    {result.booking.status === "CHECKED_IN" && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: "100%", padding: "1rem" }}
                                            onClick={handleCheckOut}
                                            disabled={isPending}
                                        >
                                            {isPending ? "Processing..." : "✓ Check Out Guest"}
                                        </button>
                                    )}

                                    {result.booking.status === "PENDING" && (
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: "1rem",
                                                backgroundColor: "rgba(233, 196, 106, 0.1)",
                                                borderRadius: "0.5rem",
                                                color: "var(--color-warning)",
                                            }}
                                        >
                                            ⚠️ Booking is pending confirmation
                                        </div>
                                    )}

                                    {result.booking.status === "CHECKED_OUT" && (
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: "1rem",
                                                backgroundColor: "rgba(42, 157, 143, 0.1)",
                                                borderRadius: "0.5rem",
                                                color: "var(--color-success)",
                                            }}
                                        >
                                            ✓ Guest has already checked out
                                        </div>
                                    )}

                                    {result.booking.status === "CANCELLED" && (
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: "1rem",
                                                backgroundColor: "rgba(208, 0, 0, 0.1)",
                                                borderRadius: "0.5rem",
                                                color: "var(--color-error)",
                                            }}
                                        >
                                            ✕ This booking was cancelled
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-outline"
                                        style={{ width: "100%" }}
                                        onClick={resetSearch}
                                    >
                                        Search Another
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Success/Error Message */
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "1.5rem 0",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "3rem",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    {result.success ? "✅" : "❌"}
                                </div>
                                <div
                                    style={{
                                        fontSize: "1.125rem",
                                        fontWeight: 600,
                                        color: result.success ? "var(--color-success)" : "var(--color-error)",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    {result.message}
                                </div>
                                {!actionDone && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={resetSearch}
                                    >
                                        Try Again
                                    </button>
                                )}
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
