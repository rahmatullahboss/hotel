import { getAdminHotels, getPendingHotels, approveHotelRegistration, rejectHotelRegistration, toggleHotelVerification } from "@/actions/hotels";

export default async function HotelsPage() {
    const [hotels, pendingHotels] = await Promise.all([
        getAdminHotels(),
        getPendingHotels(),
    ]);

    // Separate active/suspended hotels from pending
    const activeHotels = hotels.filter(h => h.status !== "PENDING");

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manage Hotels</h1>
                <p className="page-subtitle">
                    {hotels.length} hotels total • {pendingHotels.length} pending approval
                </p>
            </div>

            {/* Pending Applications Section */}
            {pendingHotels.length > 0 && (
                <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
                    <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "var(--color-warning)",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: 700
                        }}>
                            {pendingHotels.length}
                        </span>
                        Pending Applications
                    </h2>

                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                        {pendingHotels.map((hotel) => (
                            <div key={hotel.id} className="card" style={{
                                border: "2px solid var(--color-warning)",
                                background: "rgba(233, 196, 106, 0.05)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                                            {hotel.name}
                                        </h3>
                                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                                            {hotel.city} • {hotel.address}
                                        </p>
                                    </div>
                                    <span className="badge badge-warning">Pending</span>
                                </div>

                                <div style={{
                                    padding: "0.75rem",
                                    background: "var(--color-bg-secondary)",
                                    borderRadius: "0.5rem",
                                    marginBottom: "1rem",
                                    fontSize: "0.875rem"
                                }}>
                                    <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Owner</div>
                                    <div style={{ color: "var(--color-text-primary)" }}>
                                        {/* @ts-ignore */}
                                        {hotel.owner?.name || "Unknown"} • {hotel.owner?.email}
                                    </div>
                                </div>

                                {hotel.description && (
                                    <p style={{
                                        fontSize: "0.875rem",
                                        color: "var(--color-text-secondary)",
                                        marginBottom: "1rem",
                                        lineHeight: 1.5
                                    }}>
                                        {hotel.description.length > 150
                                            ? hotel.description.slice(0, 150) + "..."
                                            : hotel.description}
                                    </p>
                                )}

                                {hotel.amenities && (hotel.amenities as string[]).length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "1rem" }}>
                                        {(hotel.amenities as string[]).slice(0, 5).map((amenity) => (
                                            <span key={amenity} style={{
                                                padding: "0.25rem 0.5rem",
                                                background: "var(--color-bg-secondary)",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.75rem",
                                                color: "var(--color-text-secondary)"
                                            }}>
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <form action={async () => {
                                        "use server";
                                        await approveHotelRegistration(hotel.id);
                                    }} style={{ flex: 1 }}>
                                        <button className="btn btn-primary" style={{ width: "100%" }}>
                                            ✓ Approve
                                        </button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await rejectHotelRegistration(hotel.id);
                                    }}>
                                        <button className="btn btn-outline" style={{ color: "var(--color-error)" }}>
                                            ✕ Reject
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Hotels Table */}
            <div style={{ padding: "0 1.5rem" }}>
                <h2 style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginBottom: "1rem"
                }}>
                    All Hotels
                </h2>

                <div className="card" style={{ overflow: "hidden" }}>
                    <span className="scroll-hint">← Scroll to see more →</span>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Hotel Name</th>
                                    <th>Location</th>
                                    <th>Manager</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hotels.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="table-empty">
                                            No hotels found.
                                        </td>
                                    </tr>
                                ) : (
                                    hotels.map((hotel) => (
                                        <tr key={hotel.id}>
                                            <td>
                                                <div className="table-cell-flex">
                                                    <div
                                                        className="table-thumbnail"
                                                        style={{
                                                            backgroundImage: hotel.coverImage
                                                                ? `url(${hotel.coverImage})`
                                                                : "none",
                                                        }}
                                                    />
                                                    <span className="table-cell-primary">{hotel.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="table-cell-primary">{hotel.city}</div>
                                                <div className="table-cell-secondary">{hotel.address}</div>
                                            </td>
                                            <td>
                                                {/* @ts-ignore - owner relation might be optional/null */}
                                                <span className="table-cell-primary">
                                                    {hotel.owner?.name || hotel.owner?.email || "Unknown"}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${hotel.status === "ACTIVE"
                                                        ? "badge-success"
                                                        : hotel.status === "PENDING"
                                                            ? "badge-warning"
                                                            : "badge-error"
                                                        }`}
                                                >
                                                    {hotel.status}
                                                </span>
                                            </td>
                                            <td>
                                                {hotel.status === "PENDING" ? (
                                                    <form
                                                        action={async () => {
                                                            "use server";
                                                            await approveHotelRegistration(hotel.id);
                                                        }}
                                                    >
                                                        <button className="btn btn-sm btn-primary">
                                                            Approve
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <form
                                                        action={async () => {
                                                            "use server";
                                                            await toggleHotelVerification(
                                                                hotel.id,
                                                                hotel.status !== "ACTIVE"
                                                            );
                                                        }}
                                                    >
                                                        <button
                                                            className={`btn btn-sm ${hotel.status === "ACTIVE"
                                                                ? "btn-outline"
                                                                : "btn-primary"
                                                                }`}
                                                        >
                                                            {hotel.status === "ACTIVE" ? "Suspend" : "Activate"}
                                                        </button>
                                                    </form>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
