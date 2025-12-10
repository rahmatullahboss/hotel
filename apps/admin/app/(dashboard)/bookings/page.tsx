import { getAdminBookings } from "@/actions/bookings";

export default async function BookingsPage() {
    const bookings = await getAdminBookings();

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">All Bookings</h1>
                <p className="page-subtitle">{bookings.length} bookings total</p>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
                <span className="scroll-hint">← Scroll to see more →</span>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Hotel</th>
                                <th>Guest</th>
                                <th>Dates</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="table-empty">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>
                                            <code style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                {booking.id.slice(0, 8)}...
                                            </code>
                                        </td>
                                        <td>
                                            {/* @ts-ignore */}
                                            <div className="table-cell-primary">
                                                {booking.hotel?.name || "Unknown Hotel"}
                                            </div>
                                            <div className="table-cell-secondary">
                                                {/* @ts-ignore */}
                                                {booking.hotel?.city || "Unknown City"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-cell-primary">{booking.guestName}</div>
                                            <div className="table-cell-secondary">{booking.guestEmail}</div>
                                        </td>
                                        <td>
                                            <div className="table-cell-secondary">
                                                In: {booking.checkIn}
                                            </div>
                                            <div className="table-cell-secondary">
                                                Out: {booking.checkOut}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="table-cell-primary" style={{ fontWeight: 600 }}>
                                                ৳{Number(booking.totalAmount).toLocaleString()}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${booking.status === "CONFIRMED"
                                                        ? "badge-success"
                                                        : booking.status === "CANCELLED"
                                                            ? "badge-danger"
                                                            : "badge-warning"
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
        </div>
    );
}
