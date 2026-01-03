import { redirect } from "next/navigation";
import Link from "next/link";
import { MdSmartphone, MdDirectionsWalk } from "react-icons/md";
import { getPartnerHotel } from "../actions/dashboard";
import { getBookingHistory } from "../actions/bookings-history";
import { BottomNav } from "../components";
import { BookingsExportClient } from "../components/BookingsExportClient";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function BookingsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    const currentStatus = params.status || "ALL";
    const currentPage = parseInt(params.page || "1", 10);

    const { bookings, total, pages } = await getBookingHistory(
        { status: currentStatus === "ALL" ? undefined : currentStatus },
        currentPage,
        15
    );

    const statusTabs = [
        { value: "ALL", label: "All", count: total },
        { value: "CONFIRMED", label: "Confirmed" },
        { value: "CHECKED_IN", label: "Staying" },
        { value: "CHECKED_OUT", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "var(--color-primary)";
            case "CHECKED_IN": return "var(--color-success)";
            case "CHECKED_OUT": return "var(--color-text-muted)";
            case "CANCELLED": return "var(--color-error)";
            default: return "var(--color-warning)";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "Confirmed";
            case "CHECKED_IN": return "Staying";
            case "CHECKED_OUT": return "Completed";
            case "CANCELLED": return "Cancelled";
            default: return "Pending";
        }
    };

    return (
        <>
            {/* Header */}
            <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: "1200px", margin: "0 auto 16px auto" }}>
                <div>
                    <Link
                        href="/settings"
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
                    <h1 className="page-title">Booking History</h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        {total} total bookings
                    </p>
                </div>
                <BookingsExportClient
                    bookings={bookings.map((b) => ({
                        id: b.id,
                        guestName: b.guestName,
                        guestPhone: b.guestPhone,
                        roomNumber: b.roomNumber,
                        roomName: b.roomName || b.roomNumber,
                        checkIn: b.checkIn,
                        checkOut: b.checkOut,
                        status: b.status,
                        totalAmount: b.totalAmount,
                        paymentStatus: b.paymentStatus,
                        bookingSource: b.bookingSource,
                    }))}
                    hotelName={hotel.name}
                    dateRange={{
                        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]!,
                        endDate: new Date().toISOString().split("T")[0]!,
                    }}
                />
            </header>

            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* Status Filter Tabs */}
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        overflowX: "auto",
                        marginBottom: "1.25rem",
                        paddingBottom: "0.5rem",
                    }}
                >
                    {statusTabs.map((tab) => (
                        <Link
                            key={tab.value}
                            href={`/bookings?status=${tab.value}`}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "12px",
                                background: currentStatus === tab.value
                                    ? "#0f172a" // slate-900 (primary)
                                    : "white",
                                border: currentStatus === tab.value ? "none" : "1px solid #e2e8f0",
                                color: currentStatus === tab.value
                                    ? "white"
                                    : "#64748b",
                                fontSize: "13px",
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                                fontWeight: 600,
                                boxShadow: currentStatus === tab.value ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none"
                            }}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>

                {/* Bookings List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {bookings.length === 0 ? (
                        <div
                            style={{
                                padding: "32px",
                                textAlign: "center",
                                color: "#64748b",
                                background: "white",
                                borderRadius: "16px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                border: "1px solid #f1f5f9"
                            }}
                        >
                            No bookings found
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div
                                key={booking.id}
                                style={{
                                    padding: "16px",
                                    background: "white",
                                    borderRadius: "16px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                    border: "1px solid #f1f5f9",
                                    borderLeft: `4px solid ${getStatusColor(booking.status)}`,
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{booking.guestName}</div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                            {booking.guestPhone}
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "12px",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            background: `${getStatusColor(booking.status)}20`,
                                            color: getStatusColor(booking.status),
                                        }}
                                    >
                                        {getStatusLabel(booking.status)}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                                    Room {booking.roomNumber} • {booking.checkIn} → {booking.checkOut}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                        {booking.bookingSource === "WALK_IN" ? <><MdDirectionsWalk style={{ display: "inline", verticalAlign: "middle" }} /> Walk-in</> : <><MdSmartphone style={{ display: "inline", verticalAlign: "middle" }} /> Platform</>}
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontWeight: 700 }}>৳{booking.totalAmount.toLocaleString()}</div>
                                        {booking.advancePaid > 0 && (
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>
                                                Advance: ৳{booking.advancePaid.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.5rem",
                            marginTop: "1.5rem",
                        }}
                    >
                        {currentPage > 1 && (
                            <Link
                                href={`/bookings?status=${currentStatus}&page=${currentPage - 1}`}
                                className="btn"
                                style={{ padding: "0.5rem 1rem" }}
                            >
                                ← Prev
                            </Link>
                        )}
                        <span style={{ padding: "0.5rem 1rem", color: "var(--color-text-secondary)" }}>
                            Page {currentPage} of {pages}
                        </span>
                        {currentPage < pages && (
                            <Link
                                href={`/bookings?status=${currentStatus}&page=${currentPage + 1}`}
                                className="btn"
                                style={{ padding: "0.5rem 1rem" }}
                            >
                                Next →
                            </Link>
                        )}
                    </div>
                )}
            </main>

            <BottomNav />
        </>
    );
}
