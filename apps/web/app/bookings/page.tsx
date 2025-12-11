"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserBookings } from "../actions/bookings";
import { BottomNav, BookingQRCode } from "../components";

type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "PAY_AT_HOTEL" | "REFUNDED";

interface Booking {
    id: string;
    hotelName: string | null;
    hotelLocation: string | null;
    hotelImage: string | null;
    roomName: string | null;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
    totalAmount: string;
    paymentStatus: PaymentStatus;
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "badge-warning" },
    CONFIRMED: { label: "Confirmed", className: "badge-success" },
    CHECKED_IN: { label: "Checked In", className: "badge-success" },
    CHECKED_OUT: { label: "Completed", className: "" },
    CANCELLED: { label: "Cancelled", className: "badge-error" },
};

export default function BookingsPage() {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBookings() {
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const data = await getUserBookings(session.user.id);
            setBookings(data as Booking[]);
            setLoading(false);
        }

        fetchBookings();
    }, [session?.user?.id]);

    const upcomingBookings = bookings.filter(
        (b) => b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "CHECKED_IN"
    );
    const pastBookings = bookings.filter(
        (b) => b.status === "CHECKED_OUT" || b.status === "CANCELLED"
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-BD", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (!session) {
        return (
            <>
                <header
                    style={{
                        padding: "1rem",
                        background: "white",
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>My Bookings</h1>
                </header>
                <main style={{ padding: "1rem" }}>
                    <div
                        style={{
                            textAlign: "center",
                            padding: "3rem 1rem",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                        <h2 style={{ marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>
                            Please sign in
                        </h2>
                        <p style={{ marginBottom: "1.5rem" }}>
                            Sign in to view your bookings
                        </p>
                        <a href="/auth/signin" className="btn btn-primary">
                            Sign In
                        </a>
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    if (loading) {
        return (
            <>
                <header
                    style={{
                        padding: "1rem",
                        background: "white",
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>My Bookings</h1>
                </header>
                <main style={{ padding: "1rem", textAlign: "center" }}>
                    <div style={{ padding: "3rem" }}>
                        <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
                        <p style={{ marginTop: "1rem", color: "var(--color-text-secondary)" }}>
                            Loading bookings...
                        </p>
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            {/* Header */}
            <header
                style={{
                    padding: "1rem",
                    background: "white",
                    borderBottom: "1px solid var(--color-border)",
                }}
            >
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>My Bookings</h1>
            </header>

            <main style={{ padding: "1rem", paddingBottom: "100px" }}>
                {bookings.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "3rem 1rem",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏨</div>
                        <h2 style={{ marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>
                            No bookings yet
                        </h2>
                        <p style={{ marginBottom: "1.5rem" }}>
                            Start exploring hotels and make your first booking!
                        </p>
                        <a href="/" className="btn btn-primary">
                            Search Hotels
                        </a>
                    </div>
                ) : (
                    <>
                        {/* Upcoming Bookings */}
                        {upcomingBookings.length > 0 && (
                            <section style={{ marginBottom: "2rem" }}>
                                <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                                    Upcoming
                                </h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {upcomingBookings.map((booking) => (
                                        <div key={booking.id} className="card" style={{ overflow: "hidden" }}>
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <img
                                                    src={booking.hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"}
                                                    alt={booking.hotelName || "Hotel"}
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                <div style={{ flex: 1, padding: "0.75rem 0.75rem 0.75rem 0" }}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "start",
                                                            marginBottom: "0.25rem",
                                                        }}
                                                    >
                                                        <h3 style={{ fontWeight: 600, fontSize: "1rem" }}>
                                                            {booking.hotelName || "Unknown Hotel"}
                                                        </h3>
                                                        <span className={`badge ${statusConfig[booking.status].className}`}>
                                                            {statusConfig[booking.status].label}
                                                        </span>
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontSize: "0.875rem",
                                                            color: "var(--color-text-secondary)",
                                                            marginBottom: "0.5rem",
                                                        }}
                                                    >
                                                        {booking.roomName || "Room"}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: "0.875rem",
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "0.75rem 1rem",
                                                    borderTop: "1px solid var(--color-border)",
                                                    background: "var(--color-bg-secondary)",
                                                }}
                                            >
                                                <div>
                                                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                        Booking ID:
                                                    </span>{" "}
                                                    <span style={{ fontWeight: 600 }}>{booking.id.slice(0, 8).toUpperCase()}</span>
                                                </div>
                                                <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                                                    ৳{Number(booking.totalAmount).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Past Bookings */}
                        {pastBookings.length > 0 && (
                            <section>
                                <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                                    Past Bookings
                                </h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {pastBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="card"
                                            style={{ opacity: 0.7, overflow: "hidden" }}
                                        >
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <img
                                                    src={booking.hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"}
                                                    alt={booking.hotelName || "Hotel"}
                                                    style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        filter: "grayscale(50%)",
                                                    }}
                                                />
                                                <div style={{ flex: 1, padding: "0.5rem 0.75rem 0.5rem 0" }}>
                                                    <h3 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                                                        {booking.hotelName || "Unknown Hotel"}
                                                    </h3>
                                                    <p
                                                        style={{
                                                            fontSize: "0.875rem",
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: "0.875rem",
                                                            color: "var(--color-text-muted)",
                                                        }}
                                                    >
                                                        {statusConfig[booking.status].label}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>

            <BottomNav />
        </>
    );
}
