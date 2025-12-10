"use client";

import { BottomNav } from "../components";

type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "PAY_AT_HOTEL" | "REFUNDED";

interface Booking {
    id: string;
    hotel: {
        name: string;
        location: string;
        imageUrl: string;
    };
    room: string;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
    totalAmount: number;
    paymentStatus: PaymentStatus;
}

// Mock user bookings
const mockBookings: Booking[] = [
    {
        id: "VBK-ABC123",
        hotel: {
            name: "Hotel Sunrise",
            location: "Gulshan, Dhaka",
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
        },
        room: "Standard Double",
        checkIn: "2024-12-15",
        checkOut: "2024-12-16",
        status: "CONFIRMED" as const,
        totalAmount: 2500,
        paymentStatus: "PAY_AT_HOTEL" as const,
    },
    {
        id: "VBK-DEF456",
        hotel: {
            name: "Grand Palace Hotel",
            location: "Banani, Dhaka",
            imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
        },
        room: "Deluxe Suite",
        checkIn: "2024-11-20",
        checkOut: "2024-11-22",
        status: "CHECKED_OUT" as const,
        totalAmount: 7600,
        paymentStatus: "PAID" as const,
    },
];

const statusConfig = {
    PENDING: { label: "Pending", className: "badge-warning" },
    CONFIRMED: { label: "Confirmed", className: "badge-success" },
    CHECKED_IN: { label: "Checked In", className: "badge-success" },
    CHECKED_OUT: { label: "Completed", className: "" },
    CANCELLED: { label: "Cancelled", className: "badge-error" },
};

export default function BookingsPage() {
    const upcomingBookings = mockBookings.filter(
        (b) => b.status === "CONFIRMED" || b.status === "PENDING"
    );
    const pastBookings = mockBookings.filter(
        (b) => b.status === "CHECKED_OUT" || b.status === "CANCELLED"
    );

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

            <main style={{ padding: "1rem" }}>
                {mockBookings.length === 0 ? (
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
                                                    src={booking.hotel.imageUrl}
                                                    alt={booking.hotel.name}
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
                                                            {booking.hotel.name}
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
                                                        {booking.room}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: "0.875rem",
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {booking.checkIn} → {booking.checkOut}
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
                                                    <span style={{ fontWeight: 600 }}>{booking.id}</span>
                                                </div>
                                                <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                                                    ৳{booking.totalAmount.toLocaleString()}
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
                                                    src={booking.hotel.imageUrl}
                                                    alt={booking.hotel.name}
                                                    style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        filter: "grayscale(50%)",
                                                    }}
                                                />
                                                <div style={{ flex: 1, padding: "0.5rem 0.75rem 0.5rem 0" }}>
                                                    <h3 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                                                        {booking.hotel.name}
                                                    </h3>
                                                    <p
                                                        style={{
                                                            fontSize: "0.875rem",
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {booking.checkIn} → {booking.checkOut}
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
