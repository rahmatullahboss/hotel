import { redirect } from "next/navigation";
import Link from "next/link";
import { MdSmartphone, MdDirectionsWalk } from "react-icons/md";
import { getPartnerHotel } from "../actions/dashboard";
import { getBookingHistory } from "../actions/bookings-history";
import { BottomNav } from "../components";

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
            <header className="page-header">
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
            </header>

            <main>
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
                                padding: "0.5rem 1rem",
                                borderRadius: "20px",
                                background: currentStatus === tab.value
                                    ? "var(--color-primary)"
                                    : "var(--color-bg-secondary)",
                                color: currentStatus === tab.value
                                    ? "white"
                                    : "var(--color-text-primary)",
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                                fontWeight: currentStatus === tab.value ? 600 : 400,
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
                            className="card"
                            style={{
                                padding: "2rem",
                                textAlign: "center",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            No bookings found
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="card"
                                style={{
                                    padding: "1rem",
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
