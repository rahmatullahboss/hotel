"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiCamera, FiSearch, FiUser, FiPhone, FiCalendar, FiHome, FiDollarSign, FiCheck, FiX, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
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

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
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
        fontSize: "26px",
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
        maxWidth: "600px",
        margin: "0 auto",
    } as React.CSSProperties,
    scanCard: {
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        borderRadius: "24px",
        padding: "32px 24px",
        textAlign: "center" as const,
        marginBottom: "24px",
        boxShadow: "0 8px 30px rgba(59, 130, 246, 0.3)",
        color: "white",
    } as React.CSSProperties,
    scanButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "16px 32px",
        background: "white",
        color: "#1d4ed8",
        border: "none",
        borderRadius: "16px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    } as React.CSSProperties,
    divider: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "24px",
    } as React.CSSProperties,
    dividerLine: {
        flex: 1,
        height: "1px",
        background: "#e5e7eb",
    } as React.CSSProperties,
    dividerText: {
        color: "#9ca3af",
        fontSize: "14px",
        fontWeight: "500",
    } as React.CSSProperties,
    inputWrapper: {
        background: "white",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    } as React.CSSProperties,
    inputLabel: {
        display: "block",
        fontWeight: "700",
        fontSize: "15px",
        color: "#1a1a2e",
        marginBottom: "12px",
    } as React.CSSProperties,
    inputContainer: {
        display: "flex",
        gap: "12px",
    } as React.CSSProperties,
    textInput: {
        flex: 1,
        padding: "16px 18px",
        fontSize: "16px",
        border: "2px solid #e5e7eb",
        borderRadius: "14px",
        outline: "none",
        transition: "border-color 0.2s",
    } as React.CSSProperties,
    searchButton: {
        padding: "16px 24px",
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        color: "white",
        border: "none",
        borderRadius: "14px",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    } as React.CSSProperties,
    resultCard: {
        background: "white",
        borderRadius: "24px",
        padding: "24px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
    } as React.CSSProperties,
    guestName: {
        fontWeight: "800",
        fontSize: "22px",
        color: "#1a1a2e",
    } as React.CSSProperties,
    guestPhone: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#6b7280",
        fontSize: "14px",
        marginTop: "4px",
    } as React.CSSProperties,
    statusBadge: {
        padding: "8px 16px",
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: "700",
    } as React.CSSProperties,
    roomCard: {
        background: "#f8fafc",
        padding: "18px",
        borderRadius: "16px",
        marginTop: "20px",
        marginBottom: "20px",
    } as React.CSSProperties,
    actionButton: {
        width: "100%",
        padding: "18px",
        border: "none",
        borderRadius: "16px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
    } as React.CSSProperties,
    outlineButton: {
        width: "100%",
        padding: "16px",
        background: "transparent",
        border: "2px solid #e5e7eb",
        borderRadius: "14px",
        fontSize: "15px",
        fontWeight: "600",
        color: "#6b7280",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginTop: "12px",
    } as React.CSSProperties,
};

const getStatusStyle = (status: string) => {
    const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
        PENDING: { bg: "#fef3c7", color: "#d97706", label: "Pending" },
        CONFIRMED: { bg: "#d1fae5", color: "#059669", label: "Ready for Check-in" },
        CHECKED_IN: { bg: "#dbeafe", color: "#2563eb", label: "Currently Staying" },
        CHECKED_OUT: { bg: "#f3f4f6", color: "#6b7280", label: "Completed" },
        CANCELLED: { bg: "#fee2e2", color: "#dc2626", label: "Cancelled" },
    };
    return statusStyles[status] || { bg: "#f3f4f6", color: "#6b7280", label: status };
};

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
        let extractedBookingId = decodedText;
        try {
            const parsed = JSON.parse(decodedText);
            if (parsed.bookingId) {
                extractedBookingId = parsed.bookingId;
            }
        } catch {
            // Not JSON, use as-is
        }
        setBookingId(extractedBookingId);
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
                setResult({ success: true, message: "✓ Guest checked in successfully!" });
                setTimeout(() => router.push("/"), 2000);
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
                setResult({ success: true, message: "✓ Guest checked out successfully!" });
                setTimeout(() => router.push("/"), 2000);
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

    return (
        <div style={styles.pageContainer}>
            {/* QR Scanner Modal */}
            {isScanning && (
                <QRScanner
                    onScanSuccess={handleQRScan}
                    onScanError={(err) => {
                        setResult({ success: false, message: `Camera error: ${err}` });
                    }}
                    onClose={() => setIsScanning(false)}
                />
            )}

            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <Link href="/" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <FiCamera size={26} />
                        Guest Check-in / Check-out
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Scan QR code or enter booking ID
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {!result ? (
                    <>
                        {/* Scan QR Card */}
                        <div style={styles.scanCard}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}>
                                <FiCamera size={36} color="white" />
                            </div>
                            <h3 style={{ fontWeight: "700", fontSize: "20px", marginBottom: "8px" }}>
                                Quick Scan
                            </h3>
                            <p style={{ opacity: 0.9, marginBottom: "20px", fontSize: "14px" }}>
                                Scan guest&apos;s booking QR code
                            </p>
                            <button
                                style={{
                                    ...styles.scanButton,
                                    opacity: hotelId ? 1 : 0.6,
                                }}
                                onClick={() => setIsScanning(true)}
                                disabled={!hotelId}
                            >
                                <FiCamera size={20} />
                                Open Scanner
                            </button>
                        </div>

                        {/* Divider */}
                        <div style={styles.divider}>
                            <div style={styles.dividerLine} />
                            <span style={styles.dividerText}>or enter manually</span>
                            <div style={styles.dividerLine} />
                        </div>

                        {/* Manual Entry */}
                        <div style={styles.inputWrapper}>
                            <form onSubmit={handleManualSearch}>
                                <label htmlFor="bookingId" style={styles.inputLabel}>
                                    Booking ID
                                </label>
                                <div style={styles.inputContainer}>
                                    <input
                                        id="bookingId"
                                        type="text"
                                        value={bookingId}
                                        onChange={(e) => setBookingId(e.target.value)}
                                        placeholder="Enter booking ID"
                                        style={styles.textInput}
                                    />
                                    <button
                                        type="submit"
                                        style={{
                                            ...styles.searchButton,
                                            opacity: isPending || !hotelId || !bookingId.trim() ? 0.6 : 1,
                                        }}
                                        disabled={isPending || !hotelId || !bookingId.trim()}
                                    >
                                        <FiSearch size={18} />
                                        {isPending ? "..." : "Search"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    /* Result Card */
                    <div style={{
                        ...styles.resultCard,
                        borderLeft: `5px solid ${result.success ? "#10b981" : "#ef4444"}`,
                    }}>
                        {result.booking && !actionDone ? (
                            <>
                                {/* Guest Info */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={styles.guestName}>{result.booking.guestName}</div>
                                        <div style={styles.guestPhone}>
                                            <FiPhone size={14} />
                                            {result.booking.guestPhone}
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.statusBadge,
                                        background: getStatusStyle(result.booking.status).bg,
                                        color: getStatusStyle(result.booking.status).color,
                                    }}>
                                        {getStatusStyle(result.booking.status).label}
                                    </span>
                                </div>

                                {/* Room Info */}
                                <div style={styles.roomCard}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
                                        <FiHome size={18} color="#3b82f6" />
                                        Room {result.booking.roomNumber} - {result.booking.roomName}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#6b7280" }}>
                                        <FiCalendar size={16} />
                                        {formatDate(result.booking.checkIn)} → {formatDate(result.booking.checkOut)}
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                                    {result.booking.paymentMethod === "PAY_AT_HOTEL" && result.booking.bookingFeeStatus === "PAID" ? (
                                        <>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                                <span style={{ fontSize: "14px", color: "#6b7280" }}>✅ Advance Paid</span>
                                                <span style={{ fontWeight: "700", color: "#10b981" }}>
                                                    ৳{(result.booking.advancePaid || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "14px 16px",
                                                background: result.booking.paymentStatus === "PAID" ? "#d1fae5" : "#fef3c7",
                                                borderRadius: "12px",
                                            }}>
                                                <span style={{
                                                    fontWeight: "700",
                                                    color: result.booking.paymentStatus === "PAID" ? "#059669" : "#d97706"
                                                }}>
                                                    {result.booking.paymentStatus === "PAID" ? "✅ Fully Paid" : "💵 Collect at Hotel"}
                                                </span>
                                                <span style={{
                                                    fontSize: "18px",
                                                    fontWeight: "800",
                                                    color: result.booking.paymentStatus === "PAID" ? "#059669" : "#d97706"
                                                }}>
                                                    ৳{(result.booking.remainingAmount || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ color: "#6b7280" }}>Total Amount</span>
                                            <span style={{ fontWeight: "800", fontSize: "20px", color: "#1a1a2e" }}>
                                                ৳{result.booking.totalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {result.booking.paymentMethod === "PAY_AT_HOTEL" &&
                                        result.booking.paymentStatus !== "PAID" &&
                                        result.booking.remainingAmount && result.booking.remainingAmount > 0 && (
                                            <button
                                                style={{
                                                    ...styles.actionButton,
                                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                    color: "white",
                                                }}
                                                onClick={handleCollectPayment}
                                                disabled={isPending}
                                            >
                                                <FiDollarSign size={20} />
                                                {isPending ? "Processing..." : `Collect ৳${result.booking.remainingAmount.toLocaleString()}`}
                                            </button>
                                        )}

                                    {result.booking.status === "CONFIRMED" && (
                                        <button
                                            style={{
                                                ...styles.actionButton,
                                                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                                                color: "white",
                                            }}
                                            onClick={handleCheckIn}
                                            disabled={isPending}
                                        >
                                            <FiCheck size={20} />
                                            {isPending ? "Processing..." : "Check In Guest"}
                                        </button>
                                    )}

                                    {result.booking.status === "CHECKED_IN" && (
                                        <button
                                            style={{
                                                ...styles.actionButton,
                                                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                                color: "white",
                                            }}
                                            onClick={handleCheckOut}
                                            disabled={isPending}
                                        >
                                            <FiCheck size={20} />
                                            {isPending ? "Processing..." : "Check Out Guest"}
                                        </button>
                                    )}

                                    {result.booking.status === "PENDING" && (
                                        <div style={{
                                            textAlign: "center",
                                            padding: "16px",
                                            background: "#fef3c7",
                                            borderRadius: "14px",
                                            color: "#d97706",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontWeight: "600",
                                        }}>
                                            <FiAlertTriangle size={18} />
                                            Booking is pending confirmation
                                        </div>
                                    )}

                                    {result.booking.status === "CHECKED_OUT" && (
                                        <div style={{
                                            textAlign: "center",
                                            padding: "16px",
                                            background: "#d1fae5",
                                            borderRadius: "14px",
                                            color: "#059669",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontWeight: "600",
                                        }}>
                                            <FiCheck size={18} />
                                            Guest has already checked out
                                        </div>
                                    )}

                                    {result.booking.status === "CANCELLED" && (
                                        <div style={{
                                            textAlign: "center",
                                            padding: "16px",
                                            background: "#fee2e2",
                                            borderRadius: "14px",
                                            color: "#dc2626",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontWeight: "600",
                                        }}>
                                            <FiX size={18} />
                                            This booking was cancelled
                                        </div>
                                    )}

                                    <button style={styles.outlineButton} onClick={resetSearch}>
                                        <FiRefreshCw size={16} />
                                        Search Another
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Success/Error Message */
                            <div style={{ textAlign: "center", padding: "32px 0" }}>
                                <div style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    background: result.success ? "#d1fae5" : "#fee2e2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 20px",
                                }}>
                                    {result.success ? (
                                        <FiCheck size={40} color="#059669" />
                                    ) : (
                                        <FiX size={40} color="#dc2626" />
                                    )}
                                </div>
                                <div style={{
                                    fontSize: "18px",
                                    fontWeight: "700",
                                    color: result.success ? "#059669" : "#dc2626",
                                    marginBottom: "20px",
                                }}>
                                    {result.message}
                                </div>
                                {!actionDone && (
                                    <button
                                        style={{
                                            ...styles.actionButton,
                                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                            color: "white",
                                            width: "auto",
                                            padding: "14px 32px",
                                            display: "inline-flex",
                                        }}
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

            <BottomNav />
        </div>
    );
}
