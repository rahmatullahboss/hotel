import { getAdminBookings } from "@/actions/bookings";

export default async function BookingsPage() {
    const bookings = await getAdminBookings();

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 className="text-2xl font-bold">All Bookings</h1>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                    {bookings.length} bookings total
                </div>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)" }}>
                        <tr>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Booking ID</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Hotel</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Guest</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Dates</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Amount</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                                    No bookings found.
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.75rem" }}>
                                        {booking.id.slice(0, 8)}...
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        {/* @ts-ignore */}
                                        <div style={{ fontWeight: 500 }}>{booking.hotel?.name || "Unknown Hotel"}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                            {/* @ts-ignore */}
                                            {booking.hotel?.city || "Unknown City"}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontWeight: 500 }}>{booking.guestName}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                            {booking.guestEmail}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                                        <div>In: {booking.checkIn}</div>
                                        <div>Out: {booking.checkOut}</div>
                                    </td>
                                    <td style={{ padding: "1rem", fontWeight: 600 }}>
                                        ৳{Number(booking.totalAmount).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span
                                            className={`badge badge-${booking.status === "CONFIRMED"
                                                ? "success"
                                                : booking.status === "CANCELLED"
                                                    ? "danger"
                                                    : "warning"
                                                }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
