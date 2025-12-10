import { getAdminHotels, toggleHotelVerification } from "@/actions/hotels";

export default async function HotelsPage() {
    const hotels = await getAdminHotels();

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manage Hotels</h1>
                <p className="page-subtitle">{hotels.length} hotels total</p>
            </div>

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
                                                        : "badge-warning"
                                                    }`}
                                            >
                                                {hotel.status}
                                            </span>
                                        </td>
                                        <td>
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
                                                    {hotel.status === "ACTIVE" ? "Suspend" : "Approve"}
                                                </button>
                                            </form>
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
